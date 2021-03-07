const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const mongoosePaginate = require('mongoose-paginate-v2');
const { AttributeStatus } = require('../enums');

const Schema = new mongoose.Schema(
    {
        name: String,
        options: { type: mongoose.Schema.Types.Mixed, default: [] },
        status: { type: String, enum: Object.values(AttributeStatus) }

    },
    {
        versionKey: false
    }
);

Schema.plugin(mongoosePaginate);
Schema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('attributes', Schema);
