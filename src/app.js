const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model');
const {getProfile} = require('./middleware/getProfile');
const {getOneForProfile: getContract, getAllNonTerminatedForProfile: getContracts} = require('./usecases/contract');
const {getAllActiveUnpaid: getUnpaidJobs, getBestProfession} = require('./usecases/job');
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
 * Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range
 * @returns profession
 */
app.get('/admin/best-profession', getProfile, async (req, res) => {
    // todo: validate the parameters: must be date strings (YYYY-MM-DD), valid dates, not empty, start <= end...
    const {start, end} = req.query;

    const profession = await getBestProfession(start, end);

    res.json(profession);
});

module.exports = app;
