const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseDelete = require('mongoose-delete');

const Schema = new mongoose.Schema(
    {
        name: String,
        code: String,
        states : { type: mongoose.Schema.Types.Mixed }
    },
    {
        versionKey: false,
        // timestamps: true
    }
);

Schema.plugin(mongoosePaginate);
Schema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('countries', Schema);