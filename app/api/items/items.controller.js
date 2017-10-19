const ItemService = require('../../services/items');


const save = (req, res) => {
    const data = req.body;

    ItemService.save(data)
        .then((item) => {
            res.json({
                message: 'An new item is saved successfully.',
                item
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: err.message
            });
        });
};

const query = (req, res) => {
    const {id} = req.params;

    ItemService.get(id)
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
    save,
    query,
    test
};