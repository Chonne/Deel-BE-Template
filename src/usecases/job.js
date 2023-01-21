const sequelize = require('sequelize');
const model = require('../model');

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
