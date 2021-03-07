const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseDelete = require('mongoose-delete');

const Schema = new mongoose.Schema({
    name: String,
    country: String,
    state: String,
    zip_code: [{ type: String }],
    shipping_fee: Number,
    shipping_name: String,
    order: String,
    shipping_methods: { type: mongoose.Schema.Types.Mixed }
    // classes: [
    // rates: [
    //     {
    //         country: String,
    //         state: String,
    //         zip_code: [String], // if empty then for apply all under state else only on mentioned
    //         city: [String],
    //         rate: Number,
    //         name: String, // tax name
    //         priority: Number,
    //         compound: { type: Boolean, default: false }, // ignore for now
    //         shipping: { type: Boolean, default: false }, // apply for shipping rate or not?
    //     }
    // ]
}, { versionKey: false });

Schema.plugin(mongoosePaginate);
Schema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('shipping', Schema);
