const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model');
const {getProfile} = require('./middleware/getProfile');
const {getOneForProfile: getContract, getAllNonTerminatedForProfile: getContracts} = require('./usecases/contract');
const {getAllActiveUnpaid: getUnpaidJobs, getBestProfession, getBestPayingClients, payForJob} = require('./usecases/job');
const {depositInBalance} = require('./usecases/profile');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

/**
 * return the contract only if it belongs to the profile calling
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
    const {id} = req.params;
    const contract = await getContract(id, req.profile.id);
    if (!contract) return res.status(404).end();

    res.json(contract);
});

/**
 * Returns a list of non terminated contracts belonging to a user (client or contractor)
 * @returns contracts
 */
app.get('/contracts', getProfile, async (req, res) => {
    const contracts = await getContracts(req.profile.id);

    res.json(contracts);
});

/**
 * Get all unpaid jobs for a user (either a client or contractor), for active contracts only
 * @returns jobs
 */
app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const jobs = await getUnpaidJobs(req.profile.id);

    res.json(jobs);
});

/**
 * Pay for a job, a client can only pay if his balance >= the amount to pay.
 * The amount should be moved from the client's balance to the contractor balance.
 * The job can only be paid by the client
 * @returns job
 */
app.post('/jobs/:jobId/pay', getProfile, async (req, res) => {
    try {
        const {jobId} = req.params;
        let result;

        await sequelize.transaction(async (t) => {
            result = await payForJob(jobId, req.profile.id, t);
        });

        let statusCode = 200;

        switch (result.status) {
            case 'BALANCE_TOO_LOW':
                // not sure this is the best response code to send back, should perhaps be considered as a user error
                statusCode = 400;
                break;
            case 'JOB_NOT_FOUND':
                statusCode = 404;
                break;
        }

        res.status(statusCode).send(result.msg);
    } catch (error) {
        res.status(500).send(`Payment failed: ${error}`);
    }
});

/**
 * Deposits money into the balance of a client, a client can't deposit more than 25%
 * his total of jobs to pay. (at the deposit moment)
 * Expected body: {amount: <number>}
 * @returns job
 */
app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
    try {
        const {userId} = req.params;
        // todo: validate amount is a positive number and parse it as float
        const {amount} = req.body;
        let result = {msg: 'ok'};
        let statusCode = 200;

        await sequelize.transaction(async (t) => {
            result = await depositInBalance(userId, amount, t);

            switch (result.status) {
                case 'DEPOSIT_TOO_BIG':
                    statusCode = 400;
                    break;
            }
        });

        res.status(statusCode).send(result.msg);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Payment failed: ${error}`);
    }
});

/**
 * Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range
 * @returns profession
 */
app.get('/admin/best-profession', getProfile, async (req, res) => {
    // todo: validate the parameters: must be date strings (YYYY-MM-DD), valid dates, not empty, start <= end...
    const {start, end} = req.query;

    const profession = await getBestProfession(start, end);

    res.json(profession);
});

/**
 * returns the clients that paid the most for jobs in the query time period.
 * limit query parameter should be applied, default limit is 2
 * @returns clients
 */
app.get('/admin/best-clients', getProfile, async (req, res) => {
    // todo: validate the parameters: must be date strings (YYYY-MM-DD), valid dates, not empty, start <= end, limit a positive int...
    let {start, end, limit} = req.query;

    limit = limit ? parseInt(limit) : undefined;

    const clients = await getBestPayingClients(start, end, limit);

    res.json(clients);
});

module.exports = app;
