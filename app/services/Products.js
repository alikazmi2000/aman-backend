const _ = require('lodash');

const Products = require('../models/products');
const Variations = require('../models/variations');
const Categories = require('../models/categories');
const Taxes = require('../models/taxes');
const Crud = require('./Crud');
const Shippings = require('../models/shipping');

exports.resProduct = (req) => {
  return {
    id: req._id,
    categoryId: req.wp_id,
    name: req.name,
    //oldPrice: req.price,
    newPrice: req.price,
    //discount: req.sale_price,
    ratingsCount: 2,
    ratingsValue: req.average_rating,
    description: req.short_description,
    availibilityCount: req.stock_quantity,
    stockStatus: req.stock_status,
    manageStock: req.manage_stock,
    cartCount: 0,
    color: [],
    size: [],
    weight: 150,
    images: req.images,
    featured: req.featured,
    availibilityCount: req.stock_quantity,
  };
};

exports.resSingleProduct = (req) => {
  return {
    id: req._id,
    name: req.name,
    images: req.images,
    //oldPrice: req.regular_price,
    newPrice: req.price,
    //discount: null,
    ratingsCount: req.rating_count,
    ratingsValue: 350,
    shortDescription: req.short_description,
    description: req.description,
    availibilityCount: req.stock_quantity,
    stockStatus: req.stock_status,
    attributes: req.attributes,
    variations: req.variations,
    type: req.type,
    cartCount: 0,
    weight: req.weight,
    categoryId: 100,
  };
};

// "manage_stock": false,
// "rating_count": 0,

// "related_ids": [
//   31,
//   22,
//   369,
//   414,
//   56
// ],
// "upsell_ids": [],

// "featured": false,
// "stock_quantity": null,
// "stock_status": "instock",

//     "date_created": "2017-03-23T17:03:12",

//       [
//         {
//           "id": 1,
//           "name": "Keyboard",
//           "images": [
//             {
//               "src": "assets/images/products/keyboard/1-small.png",
//               "name": "",
//               "alt": ""

//             }
//           ],
//           "oldPrice": null,
//           "newPrice": 175,
//           "discount": null,
//           "ratingsCount": 5,
//           "ratingsValue": 350,
//           "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut congue eleifend nulla vel rutrum. Donec tempus metus non erat vehicula, vel hendrerit sem interdum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae.",
//           "availibilityCount": 5,
//           "cartCount": 0,
//           "color": [],
//           "size": [],
//           "weight": 0,
//           "categoryId": 100
//         }
//       ]


exports.placeCondition = (data, cond, zipFlag = false) => {

  // let rates = {};
  if (!_.isUndefined(data.country)) cond["rates.country"] = data.country;
  if (!_.isUndefined(data.state)) cond["rates.state"] = data.state;

  if (zipFlag)
    if (!_.isUndefined(data.zip_code) && !_.isEmpty(data.zip_code)) cond["rates.zip_code"] = data.zip_code;

  // if (!_.isUndefined(data.country) || !_.isUndefined(data.state) || !_.isUndefined(data.zip_code)) {
  //   // cond.rates = rates;
  //   // cond = { ...cond, ...rates };
  // }
}


exports.getShippingCondition = (data, cond) => {
  if (!_.isUndefined(data.country)) cond['country'] = data.country;
  if (!_.isUndefined(data.state)) cond['state'] = data.state;
  if (!_.isUndefined(data.zip_code) && !_.isEmpty(data.zip_code)) cond['zip_code'] = data.zip_code;
}

exports.getShippingCondition2 = (data, cond) => {
  if (!_.isUndefined(data.country)) cond['country'] = data.country.code;
  if (!_.isUndefined(data.state)) cond['state'] = data.state.code;
  if (!_.isUndefined(data.zip_code) && !_.isEmpty(data.zip_code)) cond['zip_code'] = data.zip_code;
}

exports.gettaxCondition = (data, cond) => {
  // cond['rates'] = {};
  if (!_.isUndefined(data.country)) cond['rates.country'] = data.country.code;
  if (!_.isUndefined(data.state)) cond['rates.state'] = data.state.code;
  if (!_.isUndefined(data.zip_code) && !_.isEmpty(data.zip_code)) cond['rates.zip_code'] = data.zip_code;
}



// exports.getSkuCondition = async () => {
//   const skyExists = await db.getItemByQuery({ sku: data.sku }, Products, false, false, { sku: 1 });
//         // Delete all previous OTPs against this number
//         if (skyExists) {
// 			utils.handleError(
// 				req,
// 				res,
// 				utils.buildErrObject({ ...ErrorCodes.ITEM_ALREADY_EXISTS, message: 'PRODUCT.ALREADY_EXISTS_SKU' })
// 			);
// 			return;
//         }
// }



exports.calculateTaxes = (data, tax, cond, address) => {
  console.log('calculateTaxes')
  console.log('data', data)
  console.log('tax', tax)
  console.log('cond', cond)
  let value = 0;
  if (!_.isNil(tax)) {
    // tax = 
    tax.rates.map(item => {
      console.log('filtered')
      console.log(item)
      console.log(address.country === item.country)
      console.log(address.state === item.state)
      console.log(item.zip_code.includes(address.zip_code))

      if (address.country === item.country && address.state === item.state) {
        if (_.isEmpty(_.compact(item.zip_code))) {
          console.log('empty')
          value = item.rate;
        }
        else if (item.zip_code.includes(cond.zip_code)) {
          console.log('zipcode is included')
          value = item.rate
        }
        // else if (_.isEmpty(_.compact(item.zip_code))) {
        //   console.log('empty')
        //   console.log('filtered')
        //   value = item.rate
        // } 
        else value = 0;
      } else {
        value = 0;
      }

    })

    console.log(tax)
    if (!_.isNull(data)) {
      if (['', 'standard'].includes(data.tax_class)) {
        console.log('standard')
        console.log(value)
        console.log(typeof value)
        console.log(data.price)
        console.log(typeof data.price)
        value = value * Number(data.price) * 0.01;

      } else if (data.tax_class === 'reduced-rate') {
        console.log('reduced-rate')
        value = value * Number(data.price) * 0.01;

      } else if (data.tax_class === 'zero-rate') {
        console.log('zero-rate')

      }
    }
  }
  console.log(value)
  Number(value.toFixed(2))
  return Number(value.toFixed(2)) || 0;
}



exports.shippingFilter = (data, free = false) => {
  console.log('shippingFilter')
  console.log(data)
  let result = {}
  if (free) {

  } else {
    data.map(item => {
      console.log(item.method_id)
      if (item.method_id === 'flat_rate') {

        result.method_id = item.method_id;
        result.cost = item.settings.cost.value;
        console.log('item.title')
        console.log(item.settings.title)
        if (!_.isUndefined(item.settings.title) && !_.isUndefined(item.settings.title.value)) {
          result.title = {};
          result.title = item.settings.title.value;

        }
        // result.cost = item.settings.cost.value;
      }
    })
  }

  if (_.isUndefined(result.cost)) {
    result.service = 'No delivery'
  }
  return result;
}


exports.getShippingDetails = async data => {
  try {

    console.log('value of item =>  ', data);
    let cond = {};
    this.getShippingCondition2(data.shipping, cond, true);
    console.log('value of condition')
    console.log(cond)

    // cond.method_id = "flat_rate";
    let projection = {
      'shipping_methods.method_id': 1,
      'shipping_methods.settings': 1,
    };
    let coupon;
    let items = await Crud.getOne(Shippings, cond, projection);
    if (_.isNil(items)) {
      console.log('remove zip code')
      delete cond.zip_code;
      cond['zip_code'] = { $exists: false };
      console.log(cond)
      items = await Crud.getOne(Shippings, cond, projection);
    }
    console.log('items after zip code')
    console.log(items)
    if (_.isNil(items)) {
      console.log('remove state')
      delete cond.state;
      cond['state'] = { $exists: false };
      console.log(cond)
      items = await Crud.getOne(Shippings, cond, projection);
    }

    console.log(items)
    // return res.send({ items })
    let result = {};
    // console.log(!_.isNil(items))
    // console.log(!_.isUndefined(items.shipping_methods))
    // console.log(!_.isNil(items.shipping_methods))
    // console.log(!_.isEmpty(items.shipping_methods))
    if (!_.isNil(items))
      // if (!_.isNil(items) && !_.isEmpty(items.shipping_methods))
      result = this.shippingFilter(items.shipping_methods, false);
    else {
      result.service = 'No delivery'
    }
    // return res.send({result ,items})
    // if(!_.isUndefined(data.coupon) && !_.isEmpty(data.coupon)) {
    // 	coupon = await Crud.getOne(Coupons, { code: data.coupon }, {});
    // 	console.log('coupon')
    // 	console.log(coupon)
    // 	// Coupons
    // }
    return result;
  } catch (error) {
    console.error('getShippingDetails => ERROR =>');
    console.error(error)
    return false
  }
}



exports.getTaxDetails = async data => {

  try {
    let Model;
    let cond = {};
    if (!_.isUndefined(item.variation_id) && !_.isEmpty(item.variation_id)) {
      console.log('Variations')
      Model = Variations;
      cond._id = item.variation_id;
    } else {
      Model = Products;
      cond._id = item.product_id;
      console.log('products')
      console.log(cond)
    }

    let query = {};
    let result = await Crud.getOne(Model, cond, { sale_price: 1, tax_status: 1, tax_class: 1, price: 1 });
    console.log(result)
    // return res.send(result);
    if (!_.isNull(result)) {
      let tax_cond = {};
      if (['', 'standard'].includes(result.tax_class)) {
        tax_cond = {
          value: 'standard'
        }
      } else if (result.tax_class === 'reduced-rate') {
        tax_cond = {
          value: 'reduced-rate'
        }

      } else if (result.tax_class === 'zero-rate') {
        //ignore
        tax_cond = {
          value: 'zero-rate'
        }
      }
      this.placeCondition(data.address, tax_cond);
      console.log(tax_cond)
      let tax = await Crud.getOne(Taxes, tax_cond, { value: 1, 'rates.rate': 1, 'rates.country': 1, 'rates.state': 1, 'rates.zip_code': 1 });
      console.log('valur of tax 250tax')
      console.log(tax)
      let value = this.calculateTaxes(result, tax, item, data.address);
      return { ...item, value };
    }
    return { ...item, value: 0 };
  } catch (error) {
    console.log(error);
    return { ...item, value: 0, err: true };
  }
}


exports.purchaseStock = async (data, queries) => {
  return new Promise(async (resolve, reject) => {

    try {
      let vr_flag = false;
      let pr = await Crud.getOne(Products, { _id: data.product_id }, { stock_quantity: 1, name: 1 });
      if (_.isNil(pr)) 
        return reject({ error: 'Product doesn\'t exists' })

      let vr = null
      data.name = pr.name

      if (!_.isUndefined(data.variation_id)) {
        vr = await Crud.getOne(Variations, { _id: data.variation_id }, { stock_quantity: 1 });
        vr_flag = true;
      }
      
      if (!_.isNil(pr) && pr.stock_quantity === 0) pr = null;
      if (!_.isNil(vr) && vr.stock_quantity === 0) vr = null;

      if (!_.isNil(pr)) {
        // if(pr.stock_quantity === 0) throw 'invalid quantity';
        let pr_qty = 0;
        // pr_qty = (Number(pr.stock_quantity) - data.quantity >= 0) ? Number(pr.stock_quantity) - data.quantity : 0;
        pr_qty = Number(pr.stock_quantity) - data.quantity;
        
        if (pr_qty < 0) reject({ httpStatus: 400, message: 'Sorry, one or more product is out of stock.' });
        let updateObj = { _id: data.product_id, query: { stock_quantity: pr_qty } };
        if (pr_qty === 0) {
          updateObj.query.stock_status = 'outofstock';
        }
        queries.products.push(updateObj);
      } else {
        // resolve(true);
        // console.log('issue in product')
        reject({ httpStatus: 400, message: `${pr.name} is out of stock, please remove this from the list` });
      }

      // console.log('variations test')
      // console.log(flag)
      if (!_.isNil(vr)) {
        // if(vr.stock_quantity === 0) throw 'invalid quantity';
        let vr_qty = 0;
        // vr_qty = (Number(vr.stock_quantity) - data.quantity >= 0) ? Number(vr.stock_quantity) - data.quantity : false;
        vr_qty = Number(vr.stock_quantity) - data.quantity;
        if (vr_qty < 0) reject({ httpStatus: 400, message: 'Sorry, one or more product is out of stock.' });

        let updateObj = { _id: data.variation_id, query: { stock_quantity: vr_qty } };
        if (vr_qty === 0) {
          updateObj.query.stock_status = 'outofstock';
        }
        queries.variations.push(updateObj);
      } 
      else if (vr_flag) {
        // resolve(true);
        // console.log('variation not found')
        reject({ httpStatus: 400, message: `${pr.name} is out of stock, please remove this from the list` });
      }
      resolve(data);
      // resolve(true);
    } catch (error) {
      // console.log('come here');
      // console.log(error);
      // if(error.type === 'pr') {
      //   let pr = await Crud.updateOne(Products, { _id: data.product_id, stock_status: 'instock', stock_quantity: { $ne: 0 } }, { stock_quantity: 1 });
      // }
      // if(error.type === 'vr') {
      // }
      reject({ error });
    }
  })

}


exports.updateStock = async data => {
  try {
    let products = data.products;
    let variations = data.variations;


    let [pr, vr] = await Promise.all([
      await Promise.all(products.map(async product => {
        return await Crud.updateOne(Products, { _id: product._id }, product.query);
      })),
      await Promise.all(variations.map(async variation => {
        return await Crud.updateOne(Variations, { _id: variation._id }, variation.query);
      }))
    ])

    // console.log(pr)
    // console.log(vr)
    // await Promise.all(products.map(product => {
    //   await Crud.updateOne(Products, { _id: product._id }, product.query);
    // }))

    // await Promise.all(variations.map(variation => {
    //   await Crud.updateOne(Variations, { _id: variation._id }, variation.query);
    // }));


    return [pr, vr];
  } catch (error) {
    console.log(error)
    throw error;
  }
}

exports.getProductAvailability = async data => {

  try {

    let obj = {};
    if (!_.isUndefined(item.variation_id)) {
      console.log('find by variations id')
      obj = await Crud.getOne(Variations, { _id: item.variation_id }, { stock_quantity: 1 });
    }

    if (!_.isUndefined(item.product_id)) {
      console.log('find by product id')
      obj = await Crud.getOne(Products, { _id: item.product_id }, { stock_quantity: 1 });

    }
    console.log(obj)
    if (!_.isNull(obj)) {
      if (Number(obj.stock_quantity) === item.quantity) {
        // if (Number(obj.stock_quantity) >= item.quantity) {
        return { id: item.product_id, flag: true };
      } else return { id: item.product_id, flag: false, quantity: obj.stock_quantity };
    }
    return { flag: false };

  } catch (error) {
    console.log(error);
    return { flag: false };
  }

};



exports.getTaxCalculation = async (data) => {
  let tax_cond = {};

  // ProductServices.placeCondition(data.address, tax_cond);
  // let tax = await Crud.getOne(Taxes, tax_cond, { value: 1, 'rates.rate': 1, 'rates.country': 1, 'rates.state': 1, 'rates.zip_code': 1 });
  // return res.send(tax)


  let items = await Promise.all(data.line_items.map(async item => {
    try {
      let Model;
      let cond = {};
      let option = false; // flag for variation, true if variation exist , else false
      if (!_.isUndefined(item.variation_id) && !_.isEmpty(item.variation_id)) {
        console.log('Variations')
        Model = Variations;
        cond._id = item.variation_id;
        option = true;
      } else {
        console.log('products');
        Model = Products;
        cond._id = item.product_id;
        console.log(cond);
      }

      let query = {};
      let result = await Crud.getOne(Model, cond, { sale_price: 1, tax_status: 1, tax_class: 1, price: 1, sku: 1, attributes: 1 });
      console.log(result)
      // return res.send(result);
      if (!_.isNull(result)) {
        let tax_cond = {};
        if (['', 'standard'].includes(result.tax_class)) {
          tax_cond = {
            value: 'standard'
          }
        } else if (result.tax_class === 'reduced-rate') {
          tax_cond = {
            value: 'reduced-rate'
          }

        } else if (result.tax_class === 'zero-rate') {
          //ignore
          tax_cond = {
            value: 'zero-rate'
          }
        }
        this.gettaxCondition(data.shipping, tax_cond);
        console.log(tax_cond)
        let tax = await Crud.getOne(Taxes, tax_cond, { value: 1, 'rates.rate': 1, 'rates.country': 1, 'rates.state': 1, 'rates.zip_code': 1 });
        console.log('value of tax 250 tax')
        console.log(tax)
        let address = this.convertAddress(data.shipping);
        let value = this.calculateTaxes(result, tax, item, address);
        let variation_name = ''
        if (option) {
          variation_name = result.attributes[0].option;
        }
        return { ...item, value, ...{ price: result.price, tax_class: result.tax_class, sku: result.sku, variation_name } };
      }
      return { ...item, value: 0 };

    } catch (error) {
      console.log(error);
      return { ...item, value: 0, err: true };
    }
  }));
  return items;
};




exports.convertAddress = data => {
  let address = {}
  if (!_.isUndefined(data.country)) address.country = data.country.code;
  if (!_.isUndefined(data.state)) address.state = data.state.code;
  if (!_.isUndefined(data.zip_code) && !_.isEmpty(data.zip_code)) address.zip_code = data.zip_code;
  return address;
}


exports.boItemConversion = data => {

  return data.map(item => {
    let obj = {
      _id: item._id,
      name: item.name,
      date_created: item.date_created,
      sku: item.sku,
      status: item.status,
      stock_quantity: Number(item.stock_quantity),
      price: item.price,
      stock_status: item.stock_status,
      category_name: '',
      brand_name: ''

    }

    if (!_.isEmpty(item.brands)) {
      item.brands.map(j => {
        if (obj.brand_name === '') obj.brand_name = j.name;
        else obj.brand_name += `, ${j.name}`;
      })
    }

    if (!_.isEmpty(item.categories)) {
      item.categories.map(j => {
        if (obj.category_name === '') obj.category_name = j.name;
        else obj.category_name += `, ${j.name}`;
      })
    }

    if (item.variations != [] && item.stock_quantity === null) {
      let stock = 0;
      item.variations.map(i => {
        stock += Number(i.stock_quantity);
      });
      obj.stock_quantity = stock;
    }
    return obj;
  })
}

exports.relatedItemConversion = data => {



  return data.map(item => {
    let obj = {
      id: item._id,
      name: item.name,
      ratingsCount: 0,
      ratingsValue: 0,
      description: item.short_description,
      availibilityCount: item.stock_quantity,
      stockStatus: item.stock_status,
      manageStock: item.manage_stock,
      cartCount: 0,
      color: [],
      size: [],
      weight: item.weight,
      images: item.images,
      featured: item.featured,
      newPrice: item.price,


    }

    return obj;
  })
}





exports.SquareCatalogConversion = async (data, type = 'simple', object) => {

  if (_.isUndefined(object)) {
    let object = {
      // _id: data._id,
      name: data.name,
      // var_name: data.var_name,
      // slug: data.slug,
      description: data.description,
      sku: data.sku,
      // status: data.status,
      price: data.price,
      // category_id: data.categories[0],
      // variation
    }
    try {
      if (!_.isEmpty(data.categories)) {

        let category = await Crud.getOne(Categories, { _id: data.categories[0] }, { square_id: 1 });
        if (!_.isEmpty(category)) {
          object.category_id = category.square_id;
        }
      }
    } catch (error) {
      console.log(error)
    }
    console.log(object)
    return object;
  } else {

    if (!_.isUndefined(data.name))
      object.objects[0].item_variation_data.name = data.name;

    if (!_.isUndefined(data.description))
      object.objects[0].item_variation_data.description = data.description;

    if (!_.isUndefined(data.short_description))
      object.objects[0].item_variation_data.short_description = data.short_description;

    if (!_.isUndefined(data.price))
      object.objects[0].item_variation_data.price_money.amount = Number(data.price) * 100;

    if (!_.isUndefined(data.stock_quantity))
      object.objects[0].item_variation_data.stock_quantity = data.stock_quantity;

    // object.objects[0].item_variation_data
    // if(!_.isUndefined(data.))
    // if(!_.isUndefined(data.))
    //   {
    //     objects: [
    //       {
    //         type: "ITEM_VARIATION",
    //         id: "QQDF6NKZA4BE6SZHT5PQKNOJ",
    //         updated_at: "2020-07-05T12:15:14.508Z",
    //         version: 1593951314508,
    //         is_deleted: false,
    //         present_at_all_locations: true,
    //         item_variation_data: {
    //           item_id: "LK5PJNNJYI7KBTB2Y4WIC7DE",
    //           name: "newPlus+",
    //           sku: "20003",
    //           ordinal: 0,
    //           pricing_type: "FIXED_PRICING",
    //           price_money: {
    //             amount: 9,
    //             currency: "USD"
    //           }
    //         }
    //       }
    //     ],
    //       latest_time: "2020-07-07T09:18:54.769Z"
    //   }
    return object;
  }
}
