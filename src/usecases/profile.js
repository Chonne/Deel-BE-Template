const model = require('../model');

/**
 * Updates a client's balance after paying for a job
 * @param {Profile} profile Client's Profile, provided by Sequelize
 * @param {number} price 
 * @param {object} transaction Sequelize transaction
 * @returns {Profile} same as param, but updated
 */
module.exports.updateClientBalance = async (profile, price, transaction) => {
    profile.set({
        balance: profile.balance - price
    });

    profile = await profile.save({transaction})

    return profile;
};

/**
 * Updates a contractor's balance after being paid for a job
 * @param {Profile} profile Contractor's Profile, provided by Sequelize
 * @param {number} price 
 * @param {object} transaction Sequelize transaction
 * @returns {Profile} same as param, but updated
 */
module.exports.updateContractorBalance = async (profile, price, transaction) => {
    profile.set({
        balance: profile.balance + price
    });

    profile = await profile.save({transaction})

    return profile;
};

/**
 * 
 * @param {number|string} id Profile id
 * @param {object} transaction Sequelize transaction
 * @returns {Profile}
 */
module.exports.getOne = async (id, transaction = null) => {
    return model.Profile.findByPk(id, {transaction});
}
