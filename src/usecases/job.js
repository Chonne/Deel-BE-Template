const {Op} = require('sequelize');
const model = require('../model');

module.exports.getAllActiveUnpaid = async (profileId) => {
    const options = {
        include: [
            {
                model: model.Contract,
                where: {
                    [Op.or]: [{ContractorId: profileId}, {ClientId: profileId}],
                    status: 'in_progress',
                },
            },
        ],
        where: {
            [Op.or]: [{paid: false}, {paid: {[Op.is]: null}}],
        },
    };

    return model.Job.findAll(options);
};
