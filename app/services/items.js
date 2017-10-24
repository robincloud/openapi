const Item = require('../models/item');
const Mall = require('../models/mall');


class ItemSerivce {
    static saveItem(data) {
        // handle data
        data.oid = Item.getOid(data);
        return Item.create(data)
            .then((item) => item.toObject());
    }

    static saveMall(data) {
        // handle data
        data.oid = Item.getOid(data);
        return Item.create(data)
            .then((item) => item.toObject());
    }

    static get(data) {
        data.oid = Item.getOid(data);
        return Item.findById(data.oid)
            .then((item) => {
                if (!item) {
                    throw new Error(`An item with id (${id}) does not exist.`);
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
