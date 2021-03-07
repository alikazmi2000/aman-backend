const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseDelete = require('mongoose-delete');
const { Status } = require('../enums');
const Schema = new mongoose.Schema(
    {
        term_id: String,
        name: String,
        slug: String,
        description: String,
        // term_group: String,
        // term_taxonomy_id: String,
        // taxonomy: String,
        // count: Number,
        // filter: String,
        // brand_image: { type: mongoose.Schema.Types.Mixed },
        // brand_banner: String,
        brand_image: {
            src: String,
            name: String,
            alt: String
        },
        parent: { type: mongoose.Types.ObjectId, ref: 'brands', default: null },
        status: { type: String, enum: Object.values(Status) }
    },
    {
        versionKey: false,
        // timestamps: true
    }
);

Schema.plugin(mongoosePaginate);
Schema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('brands', Schema);