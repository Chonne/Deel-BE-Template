const {Op} = require('sequelize');
const model = require('../model');

module.exports.getOneForProfile = async (contractId, profileId) => {
    const options = {
        where: {
            id: contractId,
            ContractorId: profileId,
        },
    };

    return model.Contract.findOne(options);
};

module.exports.getAllNonTerminatedForProfile = async (profileId) => {
    const options = {
        where: {
            status: {
                [Op.not]: 'terminated',
            },
            [Op.or]: [{ContractorId: profileId}, {ClientId: profileId}],
        },
    };

    return model.Contract.findAll(options);
};
