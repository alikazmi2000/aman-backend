const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseDelete = require('mongoose-delete');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { Status } = require('../enums');
const Schema = new mongoose.Schema(
    {
        name: String,
        slug: String,
        description: String,
        image: {
            src: String,
            name: String,
            alt: String
        },
        parent: { type: mongoose.Types.ObjectId, ref: 'categories' },
        // wp_id: {
        //     type: String,
        //     // type: mongoose.Schema.Types.ObjectId,
        //     // ref: 'categories',
        //     default: null
        // },
        // parent_wp_id: {
        //     type: String,
        //     // type: mongoose.Schema.Types.ObjectId,
        //     // ref: 'categories',
        //     default: null
        // },
        // square_id: String,
        // sync_square: { type: Boolean, default: false },
        status: { type: String, enum: Object.values(Status) }
    },
    {
        versionKey: false,
        // timestamps: true
    }
);
Schema.plugin(aggregatePaginate);
Schema.plugin(mongoosePaginate);
Schema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('categories', Schema);
