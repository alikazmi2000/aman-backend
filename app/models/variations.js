const mongoose = require('mongoose');

const Schema = new mongoose.Schema(
    {
        
        sku: String,
        price: Number,
        weight: Number,
        status: String,
        tax_status: String,
        tax_class: String,
        manage_stock: Boolean,
        stock_quantity: Number,
        stock_status: String,
        attributes: [{ type: mongoose.Schema.Types.Mixed }]
    },
    {
        versionKey: false,
        // timestamps: true
    }
);

module.exports = mongoose.model('variations', Schema);
