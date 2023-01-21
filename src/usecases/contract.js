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
