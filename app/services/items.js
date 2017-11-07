const Item = require('../models/item');
const Mall = require('../models/mall');
const TaskService = require('./tasks');


class ItemSerivce {
    static saveItem(req) {
        // handle data
        //console.log(req);

        if (!req.id)
            throw new Error(`ID is not provided for the data`);
        if (!req.agent)
            throw new Error(`agent is not provided for the data`);

        const sid = req.id.split('_')[0]||'';
        const pid = req.id.split('_')[1]||'';

        // make data array to items
        let malls = [];
        const agent = req.agent;
        const items = req.data.map( (data) => {
            // make nodes array to malls
            const currentMalls = data.nodes.map( (node) => {
                let mall = {
                    id: `${sid}_${node.id}`,
                    sid: sid,
                    mall: node.mall,
                    name: node.name,
                    price: node.price,
                    delivery: node.delivery,
                    npay: node.npay
                };
                return new Mall(mall);
            });
            malls = malls.concat(currentMalls);

            const item = {
                id: req.id + (data.pkey ? "_" + data.pkey : ""),
                sid: sid,
                name: data.item_name,
                option: data.option_name,
                malls: currentMalls.map( (m) => m.get("id")),
                vector: [1,2,3,4,5,6,7,8,9,10],
                cat: data.cat,
                image: data.meta.thumbnail,
            };
            return new Item(item);
        });
        // console.log(malls);
        // console.log(items);

        // save items and malls to db
        let promises = [];
        promises = promises.concat(items.map((i) => i.save()));
        promises = promises.concat(malls.map((m) => m.save()));
        return Promise.all(promises)
            .then(() => TaskService.releaseTasks(agent, items))
            .then(() => new Item(req).toObject());
    }

    static getItem(id) {
        return Item.findById(id)
            .then((item) => {
                if (!item) {
                    throw new Error(`An item with id (${id}) does not exist.`);
                }
                const result = {
                    count: 1,
                    items: item.toObject()
                };
                return result;
            })
    }

    static getAllItems() {
        return Item.scan(10)
            .then((result) => {
                result.items = result.items.map((item) => item.toObject());
                return result;
            });
    }

    static getMall(id) {
        return Mall.findById(id)
            .then((mall) => {
                if (!mall) {
                    throw new Error(`A mall with id (${id}) does not exist.`);
                }
                const result = {
                    count: 1,
                    malls: mall.toObject()
                };
                return result;
            })
    }

    static getAllMalls() {
        return Mall.scan(10)
            .then((result) => {
                result.malls = result.malls.map((mall) => mall.toObject());
                return result;
            });
    }

    static test() {
        return Promise.all([Item.test(), Mall.test()])
            .then(() => {
                return 'success';
            })
    }
}


module.exports = ItemSerivce;
