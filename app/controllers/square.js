const _ = require('lodash');
const mongoose = require('mongoose');
const squareConfig = require('../../config/square');

const Products = require('../models/products');
const Categories = require('../models/products');
const Brands = require('../models/brands');
const Variations = require('../models/variations');
const Taxes = require('../models/taxes');
const Shippings = require('../models/shipping');


// const { v4: uuidv4 } = require('uuid');
// uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'


// const SquareConnect = require('square-connect');
// const defaultClient = SquareConnect.ApiClient.instance;
// // Set sandbox url
// defaultClient.basePath = 'https://connect.squareupsandbox.com';
// // Configure OAuth2 access token for authorization: oauth2
// const oauth2 = defaultClient.authentications['oauth2'];
// // Set sandbox access token
// oauth2.accessToken = "EAAAEKoGlw-KANh06uRSgGnuj6MZzV7ztGTjqSVpSphZCanvshMC--uRBJ3oIXul";


const services = require('../services');
// const { Categories } = require('../services');



const config = () => {
    // Pass client to API
    // switch(option) {
    //     case: Order

    // }
    const api = new SquareConnect.LocationsApi();
    return api;
}


const listLocations = (req, res) => {
    console.log('listLocations')
    // Create a new Locations API Client
    // const locationsApi = new SquareConnect.LocationsApi();
    const api = new SquareConnect.LocationsApi();
    // const locationsApi = config();

    // Make an API call to the listLocations endpoint
    api.listLocations()
        .then((response) => {
            console.log('API called successfully, returned data: ' +
                response);
            return res.send(response)
        });

        
}



const createOrder = async (req, res) => {
  console.log('createOrder');
  console.log('heres come request taht will exploede');

  try {
    let result = await services.Squares.createOrder(req.body['square-order'].order, req.body.order.shipping);
    console.log(result)
    return res.send(result);
  } catch (error) {
    console.error(Object.keys(error));
        console.error(error);
    return res.send(error)
  }
}
    // const api = new SquareConnect.OrdersApi();


    
    // let payload = {
    //     "idempotency_key": "lasdjfolskjflaksdjf2",
    //     "order": {
    //         "reference_id": "my-order-0001",
    //           "line_items": [
    //       {
    //         "name": "New York Strip Steak",
    //         "quantity": "1",
    //         "variation_name": "Re",
    //         "base_price_money": {
    //           "amount": 100,
    //           "currency": "USD"
    //         }
    //       }
    //     ],
    //     "fulfillments": [
    //       {
    //         "type": "PICKUP",
    //         "status": "PROPOSED",
    //         "pickup_details": 
    //         {
    //           "is_square_pickup_order": true,
    //           "recipient": 
    //           {
    //             "display_name": "Jack Dorsyss",
    //             "email_address": "recipient email address",
    //             "phone_number": "1 (234) 567 8900"
    //           },
    //           "schedule_type": "ASAP",
    //           "pickup_at": "2019-02-23T01:02:05+00:01",
    //           "pickup_window_duration": "P1W3D",
    //           "prep_time_duration": "P1W3D",
    //           "note": "OPTIONAL NOTE ABOUT THE ORDER"
    //         }
    //       }
    //      ]
    //     }
    //   }


    // // Make an API call to the listLocations endpoint
  
    // var locationId = "2M1320321ERXA"; // String | The ID of the business location to associate the order with.

    // var body = new SquareConnect.CreateOrderRequest(); // CreateOrderRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.

    // body.order = payload.order;
    // body.idempotency_key = uuidv4();

    // api.createOrder(locationId, body).then((data) => {
    //     console.log('API called successfully. Returned data: ');
    //     console.log(data)
    // }, function (error) {
    //     console.error(Object.keys(error));
    //     console.error(error);
    //     // console.error(Object.keys(error.response));
    //     // console.error(error.response.req);
    //     // console.error(error.response.text);

    // });
        
// }


const createCatalog = async (req, res) => {
  console.log('createCatalog');
  console.log('heres come request taht will exploede');

  try {
    let result = await services.Squares.createCatalog({})
    console.log(result)
    return res.send(result);
  } catch (error) {
    console.error(Object.keys(error));
        console.error(error);
    return res.send(error)
  }
}


const createBatchCatalog = async (req, res) => {
  console.log('createBatchCatalog');
  console.log('heres come request taht will exploede');

  try {
    let result = await services.Squares.createBatchCatalog({})
    console.log(result)
    return res.send(result);
  } catch (error) {
    console.error(Object.keys(error));
        console.error(error);
    return res.send(error)
  }
}



const catalogRemoveItems = async (req, res) => {
  console.log('createBatchCatalog');
  console.log('heres come request taht will exploede');

  try {
    let result = await services.Squares.catalogList({});

    result = result.map(item => {
      if(item.type === 'ITEM' && !['VLFDHIC5OOMG4BXPQZEVAAPF', 'NIFNCM3RMASKN6UPVD6BIEY5'].includes(item.id))
          return item.id; 
      
    })

    result = _.compact(result);

    // result = await services.Squares.BatchDeleteCatalog(result);


    // console.log(result)
    return res.send(result);
  } catch (error) {
    console.error(Object.keys(error));
        console.error(error);
    return res.send(error)
  }
}





const catalogMigration = async (req, res) => {
  console.log('catalogMigration');
  console.log('running migration of catalogs with variations.');

  try {
    let data = await services.Crud.getWithPopulate(Products, { Variations: { $ne: [] } }, {},
      [
        {
          path: 'categories', model: Categories, select: 'name slug'
        },
        {
          path: 'brands', model: Brands, select: 'name slug description'
        },
        {
          path: 'variations', model: Variations
          // , select: 'name'
        },
      ]);


    // let obj = {
    //   type: 'ITEM',
    //   "present_at_all_locations": true,
    // };
    data = await Promise.all(
      data.map(item => {
        let obj = {
          type: 'ITEM',
          "present_at_all_locations": true,
        };
        obj.id = `#${item.slug}`;
        obj.sku = item.sku;
        obj.item_data = {
          "name": item.name,
          "description": item.description,
          // "tax_ids": [
          //   "#SalesTax"
          // ],
        }
        // if(item.tax_status === 'taxable')
        // obj.item_data.tax_ids = [
        //   "#SalesTax"
        // ]

        if(item.type === 'variable') {
          obj.item_data.variations = [];

          obj.item_data.variations = item.variations.map(i => {
            // let variation_obj =
            return  {
              "type": "ITEM_VARIATION",
              "id": `#${i.wp_id}`,
              "present_at_all_locations": true,
              "item_variation_data": {
                "item_id": `#${item.slug}`,
                "name": i.attributes[0].name,
                // "name": i.name,
                "name": i.sku,
                "pricing_type": "FIXED_PRICING",
                "price_money": {
                  "amount": parseInt(i.price),
                  "currency": "USD"
                }
              }
            }

            // if (!_.isEmpty(item.images)) {
            //   obj.image_data = {
            //     caption: item.images[0].alt,
            //     url: item.images[0].src,
            //     name: item.images[0].name
            //   }
            // }

          })

        }
        
        // "category_id": "#Beverages",

        if (!_.isEmpty(item.categories)) {
          obj.category_data = {
            name: `#${item.categories[0].name}`
          }
        }

        // if (!_.isEmpty(item.images)) {
        //   obj.image_data = {
        //     caption: item.images[0].alt,
        //     url: item.images[0].src,
        //     name: item.images[0].name
        //   }
        // }

        return obj;

      })
    )


      // return res.send(data);

    let result = await services.Squares.catalogMigration(data);
    console.log(result)
    return res.send(result);
  } catch (error) {
    console.error(Object.keys(error));
        console.error(error);
    return res.send(error)
  }
}


const addCategoryCatalog = async (req, res) => {
  console.log('addCategoryCatalog');

  try {
    let data = req.body;
    let result = await services.Squares.addCategoryCatalog(data);
    console.log(result)
    return res.send(result);
  } catch (error) {
    // console.error(Object.keys(error));
    // console.error(error);
    return res.send(error)
  }
}

// const 

module.exports = {
    listLocations,
    createOrder,
    createCatalog,
    createBatchCatalog,









    catalogRemoveItems,
    catalogMigration,
    addCategoryCatalog
};
