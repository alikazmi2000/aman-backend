const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseDelete = require('mongoose-delete');
// const billing = new mongoose.Schema({
//     first_name: String,
//     last_name: String,
//     company: String,
//     address_1: String,
//     address_2: String,
//     city: String,
//     state: String,
//     zip_code: String,
//     country: String,
//     email: String,
//     phone: String
// });


const billing = new mongoose.Schema({
    first_name: String,
    last_name: String,
    address: String,
    city: String,
    state: {
        code: String,
        name: String
    },
    zip_code: String,
    country: {
        code: String,
        name: String,
        charges:Number
    },
    shippment_weight:Number,

    email: String,
    phone: String
});


// const shipping = new mongoose.Schema({
//     first_name: String,
//     last_name: String,
//     company: String,
//     address_1: String,
//     address_2: String,
//     city: String,
//     state: String,
//     zip_code: String,
//     country: String,
// });


const shipping = new mongoose.Schema({
    first_name: String,
    last_name: String,
    address: String,
    city: String,
    state: {
        code: String,
        name: String
    },
    zip_code: String,
    country: {
        code: String,
        name: String,
        charges:Number
    },
    shippment_weight:Number,

})


const line_items = new mongoose.Schema({
    name: String,
    product_id: { type: mongoose.Types.ObjectId, ref: 'products' },
    variation_id: { type: mongoose.Types.ObjectId, ref: 'variations' },
    quantity: Number,
    tax_class: String,
    subtotal: String,
    subtotal_tax: String,
    total: String,
    total_tax: String,
    // taxes: [
    //     {
    //         // "id": NumberInt(1),
    //         total: String,
    //         subtotal: String
    //     }
    // ],
    sku: String,
    price: Number,
    weight: Number,
});


const shipping_lines = new mongoose.Schema({
    value: String,   // "flat_rate",
    name: String,   //"Flat rate",
    desc: String,   //"$9.99",
    cost: String,   //"9.99"
})

const tax_lines = new mongoose.Schema({

    rate_code : String,
    rate_id : Number,
    label : String,
    compound : Boolean,
    // "meta_data" : [
    // ]
    tax_total: Number,
    shipping_tax_total: Number,
    rate_percent: Number,
    // value: String,   // "flat_rate",
    // name: String,   //"Flat rate",
    // desc: String,   //"$9.99",
    // cost: String,   //"9.99"
})

const invoice = new mongoose.Schema({

    subtotal: Number,
    total_tax: Number,
    shippment_weight:Number,
    shipping_fee: Number,
    grand_total: Number,

    // value: String,   // "flat_rate",
    // name: String,   //"Flat rate",
    // desc: String,   //"$9.99",
    // cost: String,   //"9.99"
})

const Schema = new mongoose.Schema({
    order_no: Number,
    // reference_id
    billing,
    shipping,
    line_items: [line_items],
    payment_method: { type: String, enum: ['cash_on_delivery', 'card', 'paypal'] },
    shipping_lines,
    paypal_id: String,
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers'
    },
    status: { type: String, enum: ['pending', 'pending payment', 'processing', 'on hold', 'completed', 'cancelled', 'refunded', 'failed'], default: 'pending' },
 


    invoice,
    tax_lines,

    sku: String,
    number: String,
    order_key: String,
    currency: String,
    date_created: { type: Date, default: new Date() },
    date_created_gmt: Date,
    date_modified: Date,
    date_modified_gmt: Date,
    shipping_total: String,
    shipping_tax: String,
    total: String,
    total_tax: String,
    prices_include_tax: Boolean,
    customer_note: String,
    payment_method_title: String,
    transaction_id: String,

    // reference_id



    //     wp_id: String,
    // wp_parent_id: String,
    // parent_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'products'
    // },
    // number: String,
    // order_key: String,
    // created_via: String,
    // version: String,
    // status: String,
    // currency: String,
    // date_created: Date,
    // date_created_gmt: Date,
    // date_modified: Date,
    // date_modified_gmt: Date,
    // discount_total: String,
    // discount_tax: String,
    // shipping_total: String,
    // shipping_tax: String,
    // cart_tax: String,
    // total: String,
    // total_tax: String,
    // prices_include_tax: Boolean,
    // wp_customer_id: String,
    // customer_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'customers'
    // },
    // customer_ip_address: String,
    // customer_user_agent: String,
    // customer_note: String,
    // billing,
    // shipping,
    // payment_method: String,
    // payment_method_title: String,

    // paypal_id: String,

    // transaction_id: String,
    // date_paid: Date,
    // date_paid_gmt: Date,
    // date_completed: Date,
    // date_completed_gmt: Date,
    // cart_hash: String,
    // meta_data: { type: mongoose.Schema.Types.Mixed },


    // line_items: { type: mongoose.Schema.Types.Mixed },
   
    // tax_lines: { type: mongoose.Schema.Types.Mixed },
   
    // shipping_lines: { type: mongoose.Schema.Types.Mixed },
   
    // fee_lines: { type: mongoose.Schema.Types.Mixed },
    // coupon_lines: { type: mongoose.Schema.Types.Mixed },
    // refunds: { type: mongoose.Schema.Types.Mixed },
    // currency_symbol: String,
    // _links: {
    //     self: [{ href: String }],
    //     collection: [{ href: String }],
    //     customer: [{ href: String }]
    // }
},
    {
        versionKey: false,
        timestamps: true
    }
);

autoIncrement.initialize(mongoose.connection);
Schema.plugin(mongoosePaginate);
Schema.plugin(mongooseDelete, { overrideMethods: true });
Schema.plugin(autoIncrement.plugin, { model: 'orders', field: 'order_no', startAt: 10000, incrementBy: 1 });
module.exports = mongoose.model('orders', Schema);
