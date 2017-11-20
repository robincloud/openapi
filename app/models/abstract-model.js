class AbstractModel {
    get(field)			{ return this._object[field]; }
    set(field, value)	{ this._object[field] = value; }
    removeField(field)  { delete this._object[field]; }
    toObject()			{ return this._object; }
    toJSON()			{ return JSON.stringify(this._object); }

    constructor() {
        this._object = {};
    }

    getRequestParamInt(data) {
        if (Number.isInteger(data)) {
            return {"N": data + ""};
        }
        else if (Array.isArray(data)) {
            return { "L" : data.map((k) => this.getRequestParamInt(k))};
        }
        else {
            return {"S": data};
        }
    };

    getRequestParam() {
        let data = {};
        if (this.get('is_invalid')) {
            data = {
                "DeleteRequest": {
                    "Key": {
                        "N": this._object["id"]
                    }
                }
            };
        } else {
            data = {
                "PutRequest": {
                    "Item": {}
                }
            };
            Object.keys(this._object).map((key) => {
                data["PutRequest"]["Item"][key] = this.getRequestParamInt(this._object[key]);
            });
        }
        return data;
    }
}

module.exports = AbstractModel;
