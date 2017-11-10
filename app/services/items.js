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
        let items = [];
        const agent = req.agent;
        const promises_items = (req.data || []).map( (data) => {
            // make nodes array to malls
            const currentMalls = (data.nodes || []).map( (node) => {
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

            const item_data = {
                id: req.id + (data.pkey ? "_" + data.pkey : ""),
                sid: sid,
                malls: (currentMalls || []).map( (m) => m.get("id")),
                //vector: [1,2,3,4,5,6,7,8,9,10],
            };
            if (data.option_name)
                item_data.option = data.option_name;
            if (data.cat)
                item_data.cat = data.cat;
            if (data.item_data_name)
                item_data.name= data.item_data_name;
            if (data.meta && data.meta.thumbnail)
                item_data.image= data.meta.thumbnail;

            const item = new Item(item_data);
            items.push(item);
            if (data.is_invalid)
                return item.remove();
            return item.save();
        });
        // console.log(malls);
        // console.log(items);

        // save items and malls to db
        let promises_malls = malls.map((mall) => mall.save());
        return Promise.all(promises_items.concat(promises_malls))
            .then(() => TaskService.releaseTasks(agent, items))
            .then(() => new Item(req).toObject());
    }

    static getItemPrice(id) {
        let refId;
        if (!id)
            throw new Error('id should be provided');

        let result = {
            count: 1
        };

        return Item.findById(id)
            .then((item) => {
                if (!item) {
                    throw new Error(`An item with id (${id}) does not exist.`);
                }
                refId = item.get("refId");
                if (refId) {
                    return Item.findById(refId);
                }
                return item;
            })
            .then((item) => {
                if (!item) {
                    throw new Error(`An item with id (${refId}) referenced from the item with id (${id}) does not exist.`);
                }
                result.items = item.toObject();
                if (!item.get("malls")) {
                    throw new Error(`An item with id (${id}) does not have mall information.`);
                }
                return Mall.findByIds(item.get("malls"));
            })
            .then((malls_data) => {
                let malls = malls_data.malls;
                let minPriceIdx = 0;
                let minPrice = malls[0].get("price");
                let minPriceWithDeliveryIdx = 0;
                let minPriceWithDelivery = malls[0].get("price") + malls[0].get("delivery");
                malls.forEach( (v,i) => {
                    if (v.get("price") < minPrice) {
                        minPrice = v.get("price");
                        minPriceIdx = i;
                    }
                    if (v.get("price") + v.get("delivery") < minPriceWithDelivery) {
                        minPriceWithDelivery = v.get("price") + v.get("delivery");
                        minPriceWithDeliveryIdx = i;
                    }
                });
                console.log("malls count:", malls.length);
                console.log("minPriceIdx: ", minPriceIdx);
                console.log("minPirceWithDeliveryIdx: ", minPriceWithDeliveryIdx);
                result.lowest_price = minPrice;
                result.lowest_price_mall = malls[minPriceIdx].toObject();
                result.lowest_price_with_delivery = minPriceWithDelivery;
                result.lowest_price_with_delivery_mall = malls[minPriceWithDeliveryIdx].toObject();

                return result;
            })
    }

    static getItem(id) {
        if (!id)
            throw new Error('id should be provided');

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
        if (!id)
            throw new Error('id should be provided');

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
