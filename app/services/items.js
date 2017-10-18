const Item = require('../models/item');
const Mall = require('../models/mall');


class ItemSerivce {
    static save(data) {
        // handle data
        return Item.create(data);
    }

    static get(id) {
        return Item.findById(id)
            .then((item) => {
                if (!item) {
                    return new Error(`An item with id (${id}) does not exist.`);
                }
                item = item.toObject();

                return item;
            })
    }

    static test() {
        return Item.test()
            .then(() => {
                return Mall.test()
            })
            .then(() => {
                return 'success';
            })
            .catch((err) => {
                return err;
            });
    }
}


module.exports = ItemSerivce;
