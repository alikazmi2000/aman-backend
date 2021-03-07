
const Customers = require('./../models/customers');
const paypal = require('@paypal/checkout-server-sdk');
// 1b. Import the PayPal SDK client that was created in `Set up Server-Side SDK`.
/**
 *
 * PayPal HTTP client dependency
 */
// const payPalClient = require('../Common/payPalClient');
class PaypalHelper {

    static client() {
        let paypalClientId = process.env.paypal_client_id_sanbox;
        let paypalSecretId = process.env.paypal_secret_id_sandbox;
        const paypalEnv = process.env.paypal_env;
        let environment = new paypal.core.SandboxEnvironment(paypalClientId, paypalSecretId);

        if (paypalEnv != 'sandbox') {
            paypalClientId = process.env.paypal_client_id;
            paypalSecretId = process.env.paypal_secret_id;
            environment = new paypal.core.SandboxEnvironment(paypalClientId, paypalSecretId);

        }

        console.log(environment);

        return new paypal.core.PayPalHttpClient(environment);

    }


    static async purchase(data) {
        // return this.buildRequestBody(data)
        let request = new paypal.orders.OrdersCreateRequest();
        request.headers["prefer"] = "return=representation";
        request.requestBody(this.buildRequestBody(data));
        //request.requestBody(this.buildRequestBody());
        console.log('purchasing order')
        // return 
        let response = await this.client().execute(request);


        console.log(`Response: ${JSON.stringify(response)}`);
        // If call returns body in response, you can get the deserialized version from the result attribute of the response.
        console.log(`Order: ${JSON.stringify(response.result)}`);
        if(response.statusCode === 201) {
            return response
        }
        return false
    }



    static async captureOrder(orderId) {
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        try {
            const capture = await this.client().execute(request);

            // 4. Save the capture ID to your database. Implement logic to save capture to your database for future reference.
            const captureID = capture.result.purchase_units[0]
                .payments.captures[0].id;

            console.log(captureID);

            return captureID;
            // await database.saveCaptureID(captureID);

        } catch (err) {

            // 5. Handle any errors from the call
            console.error(err);

        }

    }


    static buildRequestBody(data) {
        let obj = {
            intent: "CAPTURE",
            application_context: {
                return_url: process.env.PAYPAL_URL_RETURN,
                cancel_url: process.env.PAYPAL_URL_CANCEL,
                brand_name: "EXAMPLE INC",
                locale: "en-US",
                landing_page: "BILLING",
                shipping_preference: "SET_PROVIDED_ADDRESS",
                user_action: "CONTINUE"
            },
            purchase_units: []
        }

        let prod = {
            "reference_id": "PUHF",
            "description": "Sporting Goods",

            "custom_id": "CUST-HighFashions",
            "soft_descriptor": "HighFashions",
        }


        let items = data.line_items.map(item => {
            return {
                name: item.name,
                description: item.description || '',
                sku: item.sku,
                unit_amount: {
                    currency_code: process.env.currency,
                    value: item.price
                },
                tax: {
                    currency_code: process.env.currency,
                    value: item.total_tax
                },
                quantity: item.quantity,
                category: "PHYSICAL_GOODS"
            }
        })
        const shipping = {
            method: "United States Postal Service",
            name: {
                full_name: `${data.shipping.first_name} ${data.shipping.last_name || ''}`
            },
            address: {
                address_line_1: data.shipping.address,
                address_line_2: data.shipping.address,// later update this
                admin_area_1: data.shipping.city,
                admin_area_2: data.shipping.city,// later update this
                postal_code: data.shipping.zip_code,
                country_code: data.shipping.country.code
            }
        }

        const amount = {
            currency_code: process.env.currency,
            value: data.invoice.grand_total,
            breakdown: {
                item_total: {
                    currency_code: process.env.currency,
                    value: data.invoice.subtotal
                },
                shipping: {
                    currency_code: process.env.currency,
                    value: data.invoice.shipping_fee
                },
                handling: {
                    currency_code: process.env.currency,
                    value: '0.00'//data.invoice.
                },
                tax_total: {
                    currency_code: process.env.currency,
                    value: data.invoice.total_tax
                },
                shipping_discount: {
                    currency_code: process.env.currency,
                    value: '0.00'//data.invoice.
                }
            }
        }

        prod = { ...prod, items, shipping, amount }

        obj.purchase_units.push(prod)
        return obj
        // "shipping": {
        //     "method": "United States Postal Service",
        //     "name": {
        //         "full_name": "John Doe"
        //     },
        //     "address": {
        //         address_line_1: "123 Townsend St",
        //         address_line_2: "Floor 6",
        //         admin_area_2: "San Francisco",
        //         admin_area_1: "CA",
        //         postal_code: "94107",
        //         country_code: "US"
        //     }
        // }
        /* 
        {
            "name": "T-Shirt",
            "description": "Green XL",
            "sku": "sku01",
            "unit_amount": {
                "currency_code": "USD",
                "value": "90.00"
            },
            "tax": {
                "currency_code": "USD",
                "value": "10.00"
            },
            "quantity": "1",
            "category": "PHYSICAL_GOODS"
        }
 */
        // {
        // "reference_id": "PUHF",
        // "description": "Sporting Goods",

        // "custom_id": "CUST-HighFashions",
        // "soft_descriptor": "HighFashions",
        /* "amount": {
            "currency_code": "USD",
            "value": "220.00",
            "breakdown": {
                "item_total": {
                    "currency_code": "USD",
                    "value": "180.00"
                },
                "shipping": {
                    "currency_code": "USD",
                    "value": "20.00"
                },
                "handling": {
                    "currency_code": "USD",
                    "value": "10.00"
                },
                "tax_total": {
                    "currency_code": "USD",
                    "value": "20.00"
                },
                "shipping_discount": {
                    "currency_code": "USD",
                    "value": "10"
                }
            }
        },
        "items": [
            {
                "name": "T-Shirt",
                "description": "Green XL",
                "sku": "sku01",
                "unit_amount": {
                    "currency_code": "USD",
                    "value": "90.00"
                },
                "tax": {
                    "currency_code": "USD",
                    "value": "10.00"
                },
                "quantity": "1",
                "category": "PHYSICAL_GOODS"
            },
            {
                "name": "Shoes",
                "description": "Running, Size 10.5",
                "sku": "sku02",
                "unit_amount": {
                    "currency_code": "USD",
                    "value": "45.00"
                },
                "tax": {
                    "currency_code": "USD",
                    "value": "5.00"
                },
                "quantity": "2",
                "category": "PHYSICAL_GOODS"
            }
        ],
        "shipping": {
            "method": "United States Postal Service",
            "name": {
                "full_name": "John Doe"
            },
            "address": {
                "address_line_1": "123 Townsend St",
                "address_line_2": "Floor 6",
                "admin_area_2": "San Francisco",
                "admin_area_1": "CA",
                "postal_code": "94107",
                "country_code": "US"
            }
        }
    }*/
    }



}

module.exports = PaypalHelper;