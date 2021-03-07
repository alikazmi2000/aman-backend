const _ = require('lodash');

const Products = require('../models/products');
const Variations = require('../models/variations');

const Crud = require('./Crud');


class Order {


    static convertToOrder(data, id) {
        let order = { reference_id: id };
      
        order.line_items = data.line_items.map(item => {

            return {
                // location_id: locationId, // later will take from env
                name: item.name,
                quantity: item.quantity,
                // variation_name: item.variation_name,
                base_price_money: {
                    amount: item.price,
                    currency: "USD" // later will take from env
                },
                fulfillments: [
                    {
                        type: "SHIPMENT",
                        state: "PROPOSED",
                        shipment_details: {
                            carrier: "UPS",
                            // expected_shipped_at: new Date(),
                            recipient: {
                                // customer_id:"asdf",
                                display_name: data.billing.first_name,
                                email_address: data.billing.email,
                                phone_number: data.billing.phone//"+16163193645",

                                // address: {
                                //     address_line_1:shipping.address,
                                //     // address_line_2:"asdfsdf",
                                //     country: shipping.country.code,
                                //     first_name: shipping.first_name,
                                //     last_name: shipping.last_name,
                                //     postal_code: shipping.zip_code,
                                //     // email_address: shipping.email,
                                //     // phone_number,

                                // }
                            }
                        },
                    }
                ],
            }

        })
        return { order };

    };


    static boItemConversion(data) {
        return data.map(item => {
            return {
                _id: item._id,
                first_name: item.billing.first_name || '',
                last_name: item.billing.last_name || '',
                status: item.status,
                order_no: item.order_no,
                date_created: item.date_created || '',
                grand_total: item.invoice.grand_total || ''

            }
        })
    }

}

module.exports = Order;