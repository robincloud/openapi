const Item = require('../models/item');
const Mall = require('../models/mall');
const TaskService = require('./tasks');


class ItemSerivce {
    static saveItem(req) {
        // handle data
        console.log(req);

        if (!req.id)
            throw new Error(`ID is not provided for the data`);
        const sid = req.id.split('_')[0]||'';
        const pid = req.id.split('_')[1]||'';

        // make data array to items
        var malls = [];
        const agent = req.agent;
        const items = req.data.map( (data) => {
            // make nodes array to malls
            const currentMalls = data.nodes.map( (node) => {
                var mall = {
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
        console.log(malls);
        console.log(items);

        // save items and malls to db
        var promises = [];
        promises = promises.concat(items.map((i) => i.save()));
        promises = promises.concat(malls.map((m) => m.save()));
        return Promise.all(promises)
            .then(() => TaskService.releaseTasks(agent, items))
            .then(() => new Item(req).toObject());
    }

    static get(data) {
        data.id = Item.getId(data);
        return Item.findById(data.id)
            .then((item) => {
                if (!item) {
                    throw new Error(`An item with id (${data.id}) does not exist.`);
                }
                return item.toObject();
            })
    }

    static test() {
        return Promise.all([Item.test(), Mall.test()])
            .then(() => {
                return 'success';
            })
    }
}


module.exports = ItemSerivce;
