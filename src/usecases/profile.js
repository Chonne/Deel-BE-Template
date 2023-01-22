const model = require('../model');
// require the whole module to avoid circular references. Otherwise it won't find the functions
const Job = require('./job');

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
};

module.exports.depositInBalance = async (userId, amount, transaction) => {
    const client = await this.getOne(userId, transaction);
    const sumLeftToPay = await Job.getSumActiveUnpaidAsClient(userId, transaction);

    // deposit must be <= 25% of sum left to pay for active jobs
    if (amount > (sumLeftToPay * 0.25)) {
        return {status: 'DEPOSIT_TOO_BIG', msg: `Amount to deposit (${amount}) is more than 25% of total jobs to pay (${sumLeftToPay})`};
    }

    client.balance += amount
    await client.save({transaction})

    return {status: 'DEPOSIT_DONE', msg: `Deposited ${amount} in client's balance`};
};
