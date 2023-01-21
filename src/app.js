const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model');
const {getProfile} = require('./middleware/getProfile');
const {getOneForProfile: getContract} = require('./usecases/contract');
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
module.exports = app;
