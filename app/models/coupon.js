const mongoose = require('mongoose');

const Schema = new mongoose.Schema(
    {
        wp_id: String,
        code: String,
        amount: String,
        date_created: Date,
        date_created_gmt: Date,
        date_modified: Date,
        date_modified_gmt: Date,
        discount_type: String,
        description: String,
        date_expires: Date,
        date_expires_gmt: Date,
        usage_count: Number,
        individual_use: Boolean,
        product_ids: { type: mongoose.Schema.Types.Mixed },
        excluded_product_ids: { type: mongoose.Schema.Types.Mixed },
        usage_limit: Number,
        usage_limit_per_user: Number,
        limit_usage_to_x_items: Number,
        free_shipping: Boolean,
        product_categories: { type: mongoose.Schema.Types.Mixed },
        excluded_product_categories: { type: mongoose.Schema.Types.Mixed },
        exclude_sale_items: false,
        minimum_amount: String,
        maximum_amount: String,
        email_restrictions: { type: mongoose.Schema.Types.Mixed },
        used_by: { type: mongoose.Schema.Types.Mixed },
        meta_data: { type: mongoose.Schema.Types.Mixed }
    },
    {
        versionKey: false,
        // timestamps: true
    }
);

module.exports = mongoose.model('coupons', Schema);
