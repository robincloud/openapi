class AbstractModel {
    get(field)			{ return this._object[field]; }
    set(field, value)	{ this._object[field] = value; }
    toObject()			{ return this._object; }
    toJSON()			{ return JSON.stringify(this._object); }

    constructor() {
        this._object = {};
    }
}

module.exports = AbstractModel;