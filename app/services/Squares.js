const _ = require('lodash');
const mongoose = require('mongoose');
// const squareConfig = require('../../config/square');

const { v4: uuidv4 } = require('uuid');
uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

const request = require('request');
const baseURL = 'http://connect.squareupsandbox.com/v2/';

const SquareConnect = require('square-connect');
const defaultClient = SquareConnect.ApiClient.instance;
// Set sandbox url
// defaultClient.basePath = baseURL;
defaultClient.basePath = 'https://connect.squareupsandbox.com';
// Configure OAuth2 access token for authorization: oauth2
const oauth2 = defaultClient.authentications['oauth2'];
// Set sandbox access token
oauth2.accessToken = "Bearer EAAAEBLc_I-dPxQO6FvLrQLeLM_DP2PvKzWFY8nEFz0Ndi1TWRz30jeGpPbJomr0";
// 

// SquareConnect.api_client.configuration.access_token = 'XXXXX'

const locationId = process.env.square_location_id;
class Square {

    // async listLocations(req, res) {

    //     // Create a new Locations API Client
    //     // const locationsApi = new SquareConnect.LocationsApi();
    //     const locationsApi = squareConfig;

    //     // Make an API call to the listLocations endpoint
    //     locationsApi.listLocations()
    //         .then((response) => {
    //             console.log('API called successfully, returned data: ' +
    //                 response);
    //             return res.send(response)
    //         });
    // }


    static createCatalog(data) {
    // static createCatalog(data) {
        return new Promise((resolve, reject) => {
            console.log('testing request api')
            console.log('createCatalog')

            const api = new SquareConnect.CatalogApi();
            // Make an API call to the listLocations endpoint

            // var locationId = "2M1320321ERXA"; // String | The ID of the business location to associate the order with.
            let body = new SquareConnect.UpsertCatalogObjectRequest(); // CreateOrderRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.
            body.object = data.object;
            body.idempotency_key = uuidv4();
            console.log(body)
            api.upsertCatalogObject(locationId, body).then((data) => {
                console.log('API called successfully. Returned data: ' + data);
                return resolve(data);
            }, (error) => {
                console.log('error occurred while creating catalog square connect')
                // console.error(error);
                // console.error(Object.keys(error));
                // console.error(Object.keys(error.response));
                // console.error(Object.keys(error.response.body));
                // console.error(Object.keys(error.response.body.errors));
                // console.error(error.response.body.errors[0]);
                return reject(error);
            });

        })
    }


    static createBatchCatalog(objects) {

        return new Promise((resolve, reject) => {
            console.log('createBatchCatalog')
            const api = new SquareConnect.CatalogApi();

            // Make an API call to the listLocations endpoint

            // var locationId = "2M1320321ERXA"; // String | The ID of the business location to associate the order with.
         
            let body = new SquareConnect.BatchUpsertCatalogObjectsRequest(); // CreateOrderRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.

            body.batches = [{
                objects
            }]


            body.idempotency_key = uuidv4();
            // console.log(body.batches[0].objects[0])
            console.log(JSON.stringify(body.batches))
            // console.log(JSON.stringify(body.batches[0].objects[0].item_data.variations))
            api.batchUpsertCatalogObjects(body).then((data) => {
            // api.batchUpsertCatalogObjects(locationId, body).then((data) => {
                console.log('API called successfully. Returned data: ' + data);
                return resolve(data);
            }, (error) => {
                console.log('error occurred while creating catalog square connect')
                console.error(JSON.parse(error.response.text));
                return reject(error);
            });

        })
    }


    static createOrder(data, shipping) {
        return new Promise((resolve, reject) => {
            console.log('testing request api')
            console.log('getting new payload')

            const api = new SquareConnect.OrdersApi();

            let body = new SquareConnect.CreateOrderRequest(); // CreateOrderRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.
            body.idempotency_key = uuidv4();

            // location_id: locationId,
            body.order = data.order
            body.order.location_id = locationId;
            return resolve(body.order)
            // body.order = {
            //     location_id: locationId,
            //     name: data.name,
            //     quantity: data.quantity,
            //     // variation_name: data.variation_name,
            //     base_price_money: {
            //         amount: data.price,
            //         currency: "USD"
            //     },
            //     fulfillments: [
            //         {
            //             type: "SHIPMENT",
            //             state: "PROPOSED",
            //             shipment_details: {
            //                 carrier: "UPS",
            //                 // expected_shipped_at: new Date(),
            //                 recipient: {
            //                     // customer_id:"asdf",
            //                     display_name: "asdfasdf",
            //                     email_address: "zeemehmood35@gmail.com",
            //                     phone_number: "+16163193645",

            //                     // address: {
            //                     //     address_line_1:shipping.address,
            //                     //     // address_line_2:"asdfsdf",
            //                     //     country: shipping.country.code,
            //                     //     first_name: shipping.first_name,
            //                     //     last_name: shipping.last_name,
            //                     //     postal_code: shipping.zip_code,
            //                     //     // email_address: shipping.email,
            //                     //     // phone_number,


            //                     // }
            //                 }
            //             },

            //         }
            //     ],

            // }
              

            // let payload = {
            //     "idempotency_key": "8193148c-9586-11e6-99f9-28cfe92138cf",
            //     "order": {
            //         "reference_id": "my-order-001",
            //         "line_items": [
            //             {
            //                 "name": "GeekVape Aero Mesh 5ML Replacement Glass",
            //                 "quantity": "1",
            //                 "base_price_money": {
            //                     "amount": 499,
            //                     "currency": "USD"
            //                 }
            //             },
                        
            //         ],
            //         "fulfillments": [{
            //             "type": "SHIPMENT",
            //             "state": "PROPOSED",
            //             "pickup_details": {
            //                 "recipient": {
            //                     "display_name": "Jaiden Urie"
            //                 },
            //                 "expires_at": "2020-06-20T20:21:54.859Z",
            //                 "auto_complete_duration": "P0DT1H0S",
            //                 "schedule_type": "SCHEDULED",
            //                 "pickup_at": "2020-06-19T20:21:54.859Z",
            //                 "note": "Pour over coffee"
            //             }
            //         }]
            //     }
            // }
            
            api.createOrder(locationId, body).then((data) => {
                console.log('API called successfully. Returned data: ' + data);
                return resolve(data);
            }, (error) => {
                console.log('error occurred while creating order square connect')
                console.error(error);
                return reject(error);
            });

        })
    }

    // static createOrder(data, shipping) {
    //     return new Promise((resolve, reject) => {
    //         console.log('testing request api')
    //         console.log('getting new payload')

    //         const api = new SquareConnect.OrdersApi();

    //         let body = new SquareConnect.CreateOrderRequest(); // CreateOrderRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.
    //         body.idempotency_key = uuidv4();
    //         body.order = {
    //             location_id: locationId,
    //             name: data.name,
    //             quantity: data.quantity,
    //             // variation_name: data.variation_name,
    //             base_price_money: {
    //                 amount: data.price,
    //                 currency: "USD"
    //             },
    //             fulfillments: [
    //                 {
    //                     type: "SHIPMENT",
    //                     state: "PROPOSED",
    //                     shipment_details: {
    //                         carrier: "UPS",
    //                         // expected_shipped_at: new Date(),
    //                         recipient: {
    //                             // customer_id:"asdf",
    //                             display_name: "asdfasdf",
    //                             email_address: "zeemehmood35@gmail.com",
    //                             phone_number: "+16163193645",

    //                             // address: {
    //                             //     address_line_1:shipping.address,
    //                             //     // address_line_2:"asdfsdf",
    //                             //     country: shipping.country.code,
    //                             //     first_name: shipping.first_name,
    //                             //     last_name: shipping.last_name,
    //                             //     postal_code: shipping.zip_code,
    //                             //     // email_address: shipping.email,
    //                             //     // phone_number,


    //                             // }
    //                         }
    //                     },

    //                 }
    //             ],

    //         }
              

    //         // let payload = {
    //         //     "idempotency_key": "8193148c-9586-11e6-99f9-28cfe92138cf",
    //         //     "order": {
    //         //         "reference_id": "my-order-001",
    //         //         "line_items": [
    //         //             {
    //         //                 "name": "GeekVape Aero Mesh 5ML Replacement Glass",
    //         //                 "quantity": "1",
    //         //                 "base_price_money": {
    //         //                     "amount": 499,
    //         //                     "currency": "USD"
    //         //                 }
    //         //             },
                        
    //         //         ],
    //         //         "fulfillments": [{
    //         //             "type": "SHIPMENT",
    //         //             "state": "PROPOSED",
    //         //             "pickup_details": {
    //         //                 "recipient": {
    //         //                     "display_name": "Jaiden Urie"
    //         //                 },
    //         //                 "expires_at": "2020-06-20T20:21:54.859Z",
    //         //                 "auto_complete_duration": "P0DT1H0S",
    //         //                 "schedule_type": "SCHEDULED",
    //         //                 "pickup_at": "2020-06-19T20:21:54.859Z",
    //         //                 "note": "Pour over coffee"
    //         //             }
    //         //         }]
    //         //     }
    //         // }
            
    //         api.createOrder(locationId, body).then((data) => {
    //             console.log('API called successfully. Returned data: ' + data);
    //             return resolve(data);
    //         }, (error) => {
    //             console.log('error occurred while creating order square connect')
    //             console.error(error);
    //             return reject(error);
    //         });

    //     })
    // }

    static catalogMigration(data) {

            let prod = require('../../products.json');
            return new Promise((resolve, reject) => {
                console.log('testing request api')
    
                const api = new SquareConnect.CatalogApi();

                let body = new SquareConnect.BatchUpsertCatalogObjectsRequest(); // CreateOrderRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.
    
                body.batches = [{ objects : data}];
                body.idempotency_key = uuidv4();
                api.batchUpsertCatalogObjects(body).then((data) => {
                    console.log('API called successfully. Returned data: ' + data);
                    return resolve(data);
                }, (error) => {
                    console.log('error occurred while creating catalog square connect')
                    console.error(error);
                    return reject(error);
                });
    
            })
        }
        
        
    static catalogList(data) {

        let prod = require('../../products.json');
        return new Promise((resolve, reject) => {
            console.log('testing request api')

            const api = new SquareConnect.CatalogApi();

            // let body = new SquareConnect.ListCatalogRequest(); // CreateOrderRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.

            // body.batches = [{ objects : data}];
            // body.idempotency_key = uuidv4();
            api.listCatalog().then((data) => {
            // api.listCatalog(body).then((data) => {
                console.log('API called successfully. Returned data: ' + data);
                // console.log(Object.keys(data.objects))
                return resolve(data.objects);
            }, (error) => {
                console.log('error occurred while creating catalog square connect')
                console.error(error);
                return reject(error);
            });

        })
    }

    static BatchDeleteCatalog(data) {

        let prod = require('../../products.json');
        return new Promise((resolve, reject) => {
            console.log('testing request api')

            const api = new SquareConnect.CatalogApi();

            let body = new SquareConnect.BatchDeleteCatalogObjectsRequest(); // CreateOrderRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.
            body.object_ids = data;
            api.batchDeleteCatalogObjects(body).then((data) => {
            // api.listCatalog(body).then((data) => {
                console.log('API called successfully. Returned data: ' + data);
                // console.log(Object.keys(data.objects))
                return resolve(data.objects);
            }, (error) => {
                console.log('error occurred while creating catalog square connect')
                console.error(error);
                return reject(error);
            });

        })
    }







    static BatchInventoryChange(data) {

        let prod = require('../../products.json');
        return new Promise(async (resolve, reject) => {
            console.log('testing request api')

            const api = new SquareConnect.InventoryApi();

            let body = new SquareConnect.BatchChangeInventoryRequest(); // CreateOrderRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.
            body.idempotency_key = uuidv4();
            body.changes = data;
            // body.changes = data;
            api.batchChangeInventory(body).then((data) => {
            // api.listCatalog(body).then((data) => {
                console.log('API called successfully. Returned data: ' + data);
                // console.log(Object.keys(data.objects))
                return resolve(data.objects);
            }, (error) => {
                console.log('error occurred while creating catalog square connect')
                console.error(error);
                return reject(error);
            });

        })
    }






















    static addCategoryCatalog(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let objects = data.map(item => {
                    return {
                        type: 'CATEGORY',
                        id: `#${item.name}`,
                        present_at_all_locations: true,
                        category_data: {
                            name: item.name
                        }
                    }
                });

                const result = await this.createBatchCatalog(objects);
                console.log(result);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    static addBrandCatalog(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let objects = data.map(item => {
                    return {
                        type: 'CATEGORY',
                        id: `#${item.name}`,
                        present_at_all_locations: true,
                        category_data: {
                            name: item.name
                        }
                    }
                });

                const result = await this.createBatchCatalog(objects);
                console.log(result);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    static addProductCatalog(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let objects = data.map(item => {
                    let object = {

                        type: 'ITEM',
                        id: `#${item.slug}`,
                        present_at_all_locations: true,
                        item_data: {
                            name: item.name,
                            description: item.description,
                            category_id: item.category_id,
                            // category_id: `#${item.category_id}`,
                            // tax_ids: [
                            //     '#SalesTax'
                            // ],
                            variations: [
                                {
                                    type: 'ITEM_VARIATION',
                                    id: `#${item.slug}1`,
                                    present_at_all_locations: true,
                                    item_variation_data: {
                                        item_id: `#${item.slug}`,
                                        name: item.name,
                                        pricing_type: 'FIXED_PRICING',
                                        price_money: {
                                            amount: item.price,
                                            currency: process.env.currency
                                        }
                                    }
                                }
                            ]
                        }


                        // type: 'ITEM',
                        // id: `#${item.name}`,
                        // present_at_all_locations: true,
                        // category_data: {
                        //     name: item.name
                        // }
                    }
                    // if (_.isUndefined) {
                    //     item.variations
                    // }

                    return object;
                });

                const result = await this.createBatchCatalog(objects);
                console.log(result);
                resolve(result);
            } catch (error) {
                // console.log(error)
                reject(error);
            }

        });
    }

    static addCategoryInventory(data) {
        return new Promise((resolve, reject) => {

        });
    }

    static addBrandInventory(data) {
        return new Promise((resolve, reject) => {


        });
    }

    static addProductInventory(data) {
        return new Promise(async (resolve, reject) => {

            let obj = {
                changes: [
                    {
                        type: "PHYSICAL_COUNT",
                        physical_count: {
                            reference_id: data.reference_id,
                            catalog_object_id: data.object_id,
                            state: "IN_STOCK",
                            location_id: locationId,
                            quantity: data.quantity,
                            occurred_at: new Date()
                        }
                    }
                ],
                ignore_unchanged_counts: true
            }

            try {
                const result = await this.BatchInventoryChange(obj);
                console.log(result);
                resolve(result);
                // this.BatchInventoryChange(obj);

            } catch (error) {
                console.log(error);
                reject(error)
            }


        });
    }

    static syncUpInventory() {
        return new Promise((resolve, reject) => {


        });
    }

}

module.exports = Square;






