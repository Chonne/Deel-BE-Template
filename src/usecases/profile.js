const model = require('../model');

module.exports.updateClientBalance = async (profile, price, transaction) => {
    profile.set({
        balance: profile.balance - price
    });

    profile = await profile.save({transaction})

    return profile;
};

module.exports.updateContractorBalance = async (profile, price, transaction) => {
    profile.set({
        balance: profile.balance + price
    });

    profile = await profile.save({transaction})

    return profile;
};

module.exports.getOne = async (id, transaction = null) => {
    return model.Profile.findByPk(id, {transaction});
}
