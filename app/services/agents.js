const Agent = require('../models/agent');


class AgentService {
    static saveAgent(req) {
        if (!req.name)
            throw new Error(`ID is not provided for the data`);
        if (!req.uuid)
            throw new Error(`name is not provided for the data`);

        const new_agent = {
            name: req.name,
            uuid: req.uuid
        };
        return Agent.create(new_agent)
    }

    static put(data) {
        if (!data.uuid)
            throw new Error(`ID is not provided for the data`);
        if (!data.msg)
            throw new Error(`Message is not provided for the data`);
        if (!data.cpu)
            throw new Error(`CPU is not provided for the data`);

        return Agent.Update(data)
            .then((agent) => {
                return agent._object.Attributes
            })
    }

    static get() {
        return Agent.getAll()
            .then((agent) => {
                if (!agent) {
                    throw new Error(`There is no agent.`);
                }
                return {'message': agent._object}
            })
    }



    static test() {
        return Promise.all([Agent.test()])
            .then((data) => {
                return data||'success';
            })
    }
}


module.exports = AgentService;
