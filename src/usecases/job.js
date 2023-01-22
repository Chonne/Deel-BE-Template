const sequelize = require('sequelize');
const model = require('../model');
const {getOne: getContractorOrClient, updateClientBalance, updateContractorBalance} = require('./profile');

module.exports.getAllActiveUnpaid = async (profileId) => {
    const options = {
        include: [
            {
                model: model.Contract,
                where: {
                    [sequelize.Op.or]: [{ContractorId: profileId}, {ClientId: profileId}],
                    status: 'in_progress',
                },
            },
        ],
        where: {
            [sequelize.Op.or]: [{paid: false}, {paid: {[sequelize.Op.is]: null}}],
        },
    };

    return model.Job.findAll(options);
};

module.exports.getBestProfession = async (start, end) => {
    const options = {
        attributes: [
            [sequelize.col('Contract.Contractor.profession'), 'profession'],
            [sequelize.fn('sum', sequelize.col('price')), 'sumPrice'],
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
                [sequelize.Op.gte]: start,
                [sequelize.Op.lte]: end,
            },
        },
        group: ['Contract.ContractorId'],
        order: [['sumPrice', 'DESC']],
    };

    return model.Job.findOne(options);
};

module.exports.getOneWithContract = async (id, transaction) => {
    const options = {
        include: [
            {
                model: model.Contract,
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

module.exports.payForJob = async (jobId, transaction) => {
    const job = await this.getOneWithContract(jobId);

    if (job.paid) {
        // not sure this is the best response code to send back, should perhaps be considered as a user error
        return {status: 'JOB_ALREADY_PAID', msg: 'Job already paid'};
    }

    const contractor = await getContractorOrClient(job.Contract.ContractorId, transaction);
    const client = await getContractorOrClient(job.Contract.ClientId, transaction);

    if (job.price > client.balance) {
        return {status: 'BALANCE_TOO_LOW', msg: `Balance too low: ${client.balance}. Job costs ${job.price}`};
    }

    await this.setJobPaid(job, transaction);

    await updateClientBalance(client, job.price, transaction);
    await updateContractorBalance(contractor, job.price, transaction);

    return {status: 'JOB_PAID', msg: 'Job paid'};
};
