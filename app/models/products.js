const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// const autoIncrement = require('mongoose-auto-increment');
const mongooseDelete = require('mongoose-delete');

// const categories = new Schema({
//     id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'categories'
//     }
// },{ _id : false });

// const brands = new Schema({
//     id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'brands'
//     }
// },{ _id : false });


const attributes = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'attributes'
    },
    name: String,
    value: [String]
}, { _id: false });

// const variations = new mongoose.Schema({
//     description: String,
//     sku: String,
//     price: String,
//     regular_price: String,
//     sale_price: String,
//     on_sale: String,
//     status: String,
//     // tax_status: String,
//     // tax_class: String,
//     manage_stock: Boolean,
//     stock_quantity: Number,
//     stock_status: String,
//     // attributes: { type: mongoose.Schema.Types.Mixed }
//     attributes
// })

const Schema = new mongoose.Schema({
    name: String,
    slug: String,
    permalink: String,
    date_created: { type: Date, default: new Date() },
    status: String,
    featured: { type: Boolean, default: false },
    description: String,
    short_description: String,
    type: String,
    sku: String,
    price: Number,
    weight: Number,
    // regular_price: { type: String, default: '' },
    // sale_price: { type: String, default: '' },
    tax_status: String,
    tax_class: String,
    stock_quantity: Number,
    stock_status: String,
    average_rating: { type: String, default: '0.00' },
    manage_stock: Boolean,
    related_ids: { type: mongoose.Schema.Types.Mixed, ref: 'products' },
    upsell_ids: { type: mongoose.Schema.Types.Mixed },
    rating_count: { type: Number, default: 0 },
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categories'
        }
    ],
    images: [
        {
            wp_id: String,
            name: String,
            src: String,
            alt: String
        }
    ],
    brands: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'brands'
        }
    ],
    attributes: [],
    variations:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'variations'
    }],
    square_product_id: String,
    square_variation_id: String,
    sync_square: { type: Boolean, default: false },
    // parent: { type: mongoose.Types.ObjectId, ref: 'brands', default: null },
    meta_data: { type: mongoose.Schema.Types.Mixed },
},
    {
        versionKey: false,
        // timestamps: true
    }
);


// autoIncrement.initialize(mongoose.connection);
// Schema.plugin(autoIncrement.plugin, { model: 'orders', field: 'order_no', startAt: 10000, incrementBy: 1 });
Schema.plugin(mongoosePaginate);
Schema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('products', Schema);




















/* 


const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// const autoIncrement = require('mongoose-auto-increment');
const mongooseDelete = require('mongoose-delete');

// const categories = new Schema({
//     id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'categories'
//     }
// },{ _id : false });

// const brands = new Schema({
//     id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'brands'
//     }
// },{ _id : false });

const variations = new mongoose.Schema({
    // description: String,
    sku: String,
    price: String,
    // regular_price: String,
    // sale_price: String,
    // on_sale: String,
    status: String,
    // tax_status: String,
    // tax_class: String,
    manage_stock: Boolean,
    stock_quantity: Number,
    stock_status: String,
    link from attributes foriegn keys

    get from populate
    attribute:
    name = 0mg
    // attributes: { type: mongoose.Schema.Types.Mixed }
})

const Schema = new mongoose.Schema({
    name: String,
    // slug: String,
    // permalink: String,
    date_created: { type: Date, default: new Date() },
    status: String,
    featured: { type: Boolean, default: false },
    description: String,
    short_description: String,
    type: String, // simple & variable
    sku: String,
    price: String,
    regular_price: { type: String, default: '' },
    sale_price: { type: String, default: '' },
    tax_status: String,
    tax_class: String,
    stock_quantity: Number,
    stock_status: String,
    average_rating: { type: String, default: '0.00' },
    manage_stock: Boolean,
    // related_ids: { type: mongoose.Schema.Types.Mixed, ref: 'products' },
    // upsell_ids: { type: mongoose.Schema.Types.Mixed },
    rating_count: { type: Number, default: 0 },
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categories'
        }
    ],
    images: [
        {
            // wp_id: String,
            name: String,
            src: String,
            alt: String
        }
    ],
    brands: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'brands'
        }
    ],
    // attributes: { type: mongoose.Schema.Types.Mixed },
    variations,
    square_product_id: String,
    square_variation_id: String,
    sync_square: { type: Boolean, default: false },
    // parent: { type: mongoose.Types.ObjectId, ref: 'brands', default: null },
    meta_data: { type: mongoose.Schema.Types.Mixed },
},
    {
        versionKey: false,
        // timestamps: true
    }
);


// autoIncrement.initialize(mongoose.connection);
// Schema.plugin(autoIncrement.plugin, { model: 'orders', field: 'order_no', startAt: 10000, incrementBy: 1 });
Schema.plugin(mongoosePaginate);
Schema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('products', Schema);
 */