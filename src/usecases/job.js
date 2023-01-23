const Sequelize = require('sequelize');
const model = require('../model');
const {getOne: getContractorOrClient, updateClientBalance, updateContractorBalance} = require('./profile');

module.exports.getAllActiveUnpaid = async (profileId) => {
    const options = {
        include: [
            {
                model: model.Contract,
                where: {
                    [Sequelize.Op.or]: [{ContractorId: profileId}, {ClientId: profileId}],
                    status: 'in_progress',
                },
            },
        ],
        where: {
            [Sequelize.Op.or]: [{paid: false}, {paid: {[Sequelize.Op.is]: null}}],
        },
    };

    return model.Job.findAll(options);
};

module.exports.getSumActiveUnpaidAsClient = async (clientId, transaction = null) => {
    const options = {
        attributes: [[Sequelize.fn('sum', Sequelize.col('price')), 'sumPrice']],
        include: [
            {
                model: model.Contract,
                attributes: [],
                where: {
                    ClientId: clientId,
                    status: 'in_progress',
                },
            },
        ],
        where: {
            [Sequelize.Op.or]: [{paid: false}, {paid: {[Sequelize.Op.is]: null}}],
        },
        group: ['Contract.ClientId'],
    };

    const result = await model.Job.findOne(options, {transaction});
    const sumPrice = result ? result.get('sumPrice') : 0;

    return sumPrice;
};

module.exports.getBestProfession = async (start, end) => {
    const options = {
        attributes: [
            [Sequelize.col('Contract.Contractor.profession'), 'profession'],
            [Sequelize.fn('sum', Sequelize.col('price')), 'sumPrice'],
        ],
        include: [
            {
                model: model.Contract,
                attributes: [],
                include: [
                    {
                        attributes: ['profession'],
                        model: model.Profile,
                        as: 'Contractor',
                    },
                ],
            },
        ],
        where: {
            paid: true,
            paymentDate: {
                [Sequelize.Op.gte]: start,
                [Sequelize.Op.lte]: end,
            },
        },
        group: ['Contract.ContractorId'],
        order: [['sumPrice', 'DESC']],
    };

    return model.Job.findOne(options);
};

module.exports.getBestPayingClients = async (start, end, limit = 2) => {
    const options = {
        attributes: [
            [Sequelize.col('Contract.Client.id'), 'id'],
            [Sequelize.col('Contract.Client.firstName'), 'firstName'],
            [Sequelize.col('Contract.Client.lastName'), 'lastName'],
            [Sequelize.fn('sum', Sequelize.col('price')), 'paid'],
        ],
        include: [
            {
                model: model.Contract,
                attributes: [],
                include: [
                    {
                        attributes: ['id', 'fullName'],
                        model: model.Profile,
                        as: 'Client',
                    },
                ],
            },
        ],
        where: {
            paid: true,
            paymentDate: {
                [Sequelize.Op.gte]: start,
                [Sequelize.Op.lte]: end,
            },
        },
        group: ['Contract.ClientId'],
        order: [['paid', 'DESC']],
        limit,
    };

    const results = await model.Job.findAll(options);
    const bestPayingClients = [];

    // todo: find a proper way to concat first and last names, with a virtual field or
    //       an sqlite compatible concat function
    results.forEach((result) => {
        bestPayingClients.push({
            id: result.get('id'),
            fullName: `${result.get('firstName')} ${result.get('lastName')}`,
            paid: result.get('paid'),
        });
    });

    return bestPayingClients;
};

module.exports.getOneWithContract = async (id, clientId = null, transaction = null) => {
    const contractOptions = {};

    if (clientId) {
        contractOptions.where = {
            ClientId: clientId,
        };
    }

    const options = {
        include: [
            {
                model: model.Contract,
                ...contractOptions,
            },
        ],
        where: {
            id,
        },
    };

    return model.Job.findOne(options, {transaction});
};

module.exports.setJobPaid = async (job, transaction) => {
    job.set({
        paid: true,
        paymentDate: new Date(),
    });

    job = await job.save({transaction});

    return job;
};

module.exports.payForJob = async (jobId, clientId, transaction) => {
    const job = await this.getOneWithContract(jobId, clientId, transaction);

    if (!job) {
        return {status: 'JOB_NOT_FOUND', msg: 'Job not found'};
    }

    const client = await getContractorOrClient(job.Contract.ClientId, transaction);

    if (job.paid) {
        // not sure this is the best response code to send back, should perhaps be considered as a user error
        return {status: 'JOB_ALREADY_PAID', msg: 'Job already paid'};
    }

    const contractor = await getContractorOrClient(job.Contract.ContractorId, transaction);

    if (job.price > client.balance) {
        return {status: 'BALANCE_TOO_LOW', msg: `Balance too low: ${client.balance}. Job costs ${job.price}`};
    }

    await this.setJobPaid(job, transaction);

    await updateClientBalance(client, job.price, transaction);
    await updateContractorBalance(contractor, job.price, transaction);

    return {status: 'JOB_PAID', msg: 'Job paid'};
};
