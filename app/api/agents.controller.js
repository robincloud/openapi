const AgentService = require('../services/agents');


const saveAgent = (req, res) => {
    const data = req.body;
    AgentService.saveAgent(data)
        .then((agent) => {
            res.json({
                message: 'added to new client list successfully.',
                agent
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: err.message
            });
        });
};
const saveMsg = (req, res) => {
    const data = req.body;
    AgentService.put(data)
        .then((item) => {
            res.json({
                message: 'Item found',
                item
            });
        })
        .catch((err) => {
            res.status(404).json({
                message: err.message
            });
        });
};

const getMsg = (req, res) => {
    AgentService.get()
        .then((item) => {
            res.json(item);
        })
        .catch((err) => {
            res.status(404).json({
                message: err.message
            });
        });
};

const test = (req, res) => {
    AgentService.test()
        .then((msg) => {
            res.status(200).json({
                message: msg
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: err.message
            });
        })
};


module.exports = {
    saveAgent,
    saveMsg,
    getMsg,
    test
};