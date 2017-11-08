const Agent = require('../models/agent');


class AgentSerivce {
    static saveAgent(req) {
        // handle data

        if (!req.name)
            throw new Error(`ID is not provided for the data`);
        if (!req.uuid)
            throw new Error(`name is not provided for the data`);

        // make data array to items
        const new_agent = {
            name: req.name,
            id: req.uuid
        };

        return Agent.create(new_agent)
    }

    static put(data) {
        if (!data.uuid)
            throw new Error(`ID is not provided for the data`);
        if (!data.message)
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
                let data = [];
                agent._object.forEach((item) => {
                    let tmp = {};
                    tmp['uuid'] = item.id;
                    tmp['name'] = item.name;
                    tmp['cpu'] = item.cpu;
                    tmp['msg'] = item.message;
                    data.push(tmp);
                });
                return {'message': data}
            })
    }



    static test() {
        return Promise.all([Agent.test(), Agent.findById('asdf')])
            .then((data) => {
                return data||'success';
            })
    }
}


module.exports = AgentSerivce;
