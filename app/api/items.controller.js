const ItemService = require('../services/items');


const saveItem = (req, res) => {
    const data = req.body;

    ItemService.saveItem(data)
        .then((item) => {
            //console.log(`* saved item id: ${item.id}`);
            res.status(200).json({
                message: "ok"
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                message: err.message
            });
        });
};

const saveMall = (req, res) => {
    const data = req.body;

    ItemService.saveMall(data)
        .then((mall) => {
            //console.log(`* saved mall id: ${mall.get('id')}`);
            res.status(200).json({
                message: "ok"
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                message: err.message
            });
        });
};

const getItemPrice = (req, res) => {
    const id = req.params.id;

    ItemService.getItemPrice(id)
        .then((item) => {
            res.json({
                message: 'Item found',
                data: item
            });
        })
        .catch((err) => {
            res.status(404).json({
                message: err.message
            });
        });
};
const getItem = (req, res) => {
    const id = req.params.id;

    if (id) {
        ItemService.getItem(id)
            .then((item) => {
                res.json({
                    message: 'Item found',
                    data: item
                });
            })
            .catch((err) => {
                res.status(404).json({
                    message: err.message
                });
            });
    } else {
        ItemService.getAllItems()
            .then((result) => {
                res.json({
                    message: 'Items found',
                    data: result
                });
            })
            .catch((err) => {
                res.status(404).json({
                    message: err.message
                });
            });
    }
};

const getMall = (req, res) => {
    const id = req.params.id;

    if (id) {
        ItemService.getMall(id)
            .then((mall) => {
                res.json({
                    message: 'Mall found',
                    data: mall
                });
            })
            .catch((err) => {
                res.status(404).json({
                    message: err.message
                });
            });
    } else {
        ItemService.getAllMalls()
            .then((result) => {
                res.json({
                    message: 'Malls found',
                    data: result
                });
            })
            .catch((err) => {
                res.status(404).json({
                    message: err.message
                });
            });
    }
};

const test = (req, res) => {
    ItemService.test()
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
    saveItem,
    saveMall,
    getItemPrice,
    getItem,
    getMall,
    test
};
