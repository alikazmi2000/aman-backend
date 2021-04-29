const Products = require("../models/products");
const Variations = require("../models/variations");
const Taxes = require("../models/taxes");
const Shippings = require("../models/shipping");
// const ShippingZoneMethods = require('../models/shippingZoneMethod');
const Coupons = require("../models/coupon");
const Categories = require("../models/categories");
const Brands = require("../models/brands");

const utils = require("../middleware/utils");
const db = require("../middleware/db");
const { Status, ErrorCodes } = require("../enums");
const ProductServices = require("../services/Products");
const Crud = require("../services/Crud");

const _ = require("lodash");
const square = require("./square");
const squareServices = require("../services/Squares");

/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAllItems = async (req, res) => {
  try {
    let data = req.value;
    let query = data.query;

    const items = await db.getItems(req, Products, query);
    const info = utils.setInfo(items, ProductServices.resProduct, true);
    utils.handleSuccess(res, "PRODUCT.LIST_SUCCESS", info);
  } catch (error) {
    utils.handleError(req, res, error, "PRODUCT.LIST_ERROR");
  }
};

//get Single Item detail by Id
exports.getItem = async (req, res) => {
  try {
    const data = req.value;
    const item = await db.getOne(data.id, Products, {}, { path: "variations" });
    console.log(item);
    const info = utils.setInfo(
      item,
      ProductServices.resSingleProduct,
      false,
      false
    );
    console.log(info);
    utils.handleSuccess(res, "PRODUCT.GET_SINGLE_SUCCESS", info);
  } catch (error) {
    utils.handleError(req, res, error, "PRODUCT.GET_SINGLE_ERROR");
  }
};

exports.getAllItemsBO = async (req, res) => {
  try {
    let query = await db.checkQueryString(req.query);
    let items = await db.getItems(req, Products, query, [
      {
        path: "variations",
        model: Variations,
      },
      {
        path: "categories",
        model: Categories,
      },
      {
        path: "brands",
        model: Brands,
      },
    ]);
    items.docs = ProductServices.boItemConversion(items.docs);
    utils.handleSuccess(res, "PRODUCT.LIST_SUCCESS", items);
  } catch (error) {
    utils.handleError(req, res, error, "PRODUCT.LIST_ERROR");
  }
};

exports.relatedItems = async (req, res) => {
  try {
    // validation
    let data = req.value;
    let type = req.query.search.type;
    delete req.query.search;

    let query = await db.checkQueryString(req.query);
    let item = await db.getItem(data.id, Products, false, {
      brands: 1,
      categories: 1,
    });
    if (type === "brand") {
      query.brands = item.brands;
    }

    if (type === "category") {
      query.categories = item.categories;
    }

    console.log(JSON.stringify(query));
    let items = await db.getItems(req, Products, query, [
      {
        path: "variations",
        model: Variations,
      },
      {
        path: "categories",
        model: Categories,
      },
      {
        path: "brands",
        model: Brands,
      },
    ]);

    items.docs = ProductServices.relatedItemConversion(items.docs);
    // const info = utils.setInfo(items, serviceCategoriesService.resDocument, true);
    utils.handleSuccess(res, "PRODUCT.LIST_SUCCESS", items);

    // const orders_data = await services.Crud.get(Orders, {});
    // utils.handleSuccess(res, 'ORDER.LIST_SUCCESS', {message:'', orders_data });
  } catch (error) {
    console.log(error);
    utils.handleError(req, res, error, "PRODUCT.LIST_ERROR");
  }
};

/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.createItem = async (req, res) => {
  try {
    let data = req.value;
    let variation_id = [];

    const skuExists = await db.getItemByQuery(
      { sku: data.sku },
      Products,
      false,
      false,
      { sku: 1 }
    );
    if (skuExists) {
      utils.handleError(
        req,
        res,
        utils.buildErrObject({
          ...ErrorCodes.ITEM_ALREADY_EXISTS,
          message: "PRODUCT.ALREADY_EXISTS_SKU",
        })
      );
      return;
    }

    if (data.type === "variable") {
      let variations = [];

      if (data.variations.length > 0) {
        variations = data.variations.map((currentValue, index) => {
          let stock_status = "";
          if (currentValue.manage_stock) {
            if (currentValue.stock_quantity > 0) stock_status = "instock";
            else stock_status = "outofstock";
          } else {
            stock_status = "instock";
          }

          data.stock_quantity =
            data.stock_quantity + currentValue.stock_quantity;
          data.price = data.variations[0].price;

          return {
            attributes: currentValue.attribute,
            price: currentValue.price,
            weight: currentValue.weight,
            manage_stock: currentValue.manage_stock,
            stock_quantity: currentValue.stock_quantity,
            sku: data.sku + "-" + index,
            status: "publish",
            tax_status: "taxable",
            tax_class: "",
            stock_status: stock_status,
          };
        });
        const item = await db.createItem(variations, Variations);

        item.map((id) => {
          variation_id.push(id._id);
        });
        data.variations = variation_id;
      } else {
        data.variations = [];
      }
    } else {
      if (data.manage_stock) {
        if (data.stock_quantity > 0) data.stock_status = "instock";
        else data.stock_status = "outofstock";
      } else {
        data.stock_status = "instock";
      }
    }
    console.log(data);
    const item = await db.createItem(data, Products);

    // first square api will be hit

    // let squareProduct = await ProductServices.SquareCatalogConversion(data, data.type);

    // let result = await squareServices.addProductCatalog([squareProduct]);
    // console.log(process.env.currency)
    // // return res.send(result)

    // data.square_product_id = result.id_mappings[0].object_id;
    // data.square_variation_id = result.id_mappings[1].object_id;

    // utils.handleSuccess(res, 'PRODUCT.CREATE_SUCCESS', result);
    utils.handleSuccess(res, "PRODUCT.CREATE_SUCCESS", { id: item._id });
  } catch (error) {
    console.log(error);
    // return res.send(error)
    utils.handleError(req, res, error, "PRODUCT.CREATE_ERROR");
  }
};

/**
 * Inventory item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */

exports.inventoryUpdate = async (req, res) => {
  try {
    const data = req.value;

    if (data.type === "simple") {
    } else {
    }

    /* 
		// first square api will be hit
		let squareProduct = await ProductServices.SquareCatalogConversion(data, data.type);
		let result = await squareServices.addProductCatalog([squareProduct]);
		console.log(process.env.currency)
		// return res.send(result)
		data.square_product_id = result.id_mappings[0].object_id;
		data.square_variation_id = result.id_mappings[1].object_id;
 */
    const item = await db.createItem(data, Products);
    // utils.handleSuccess(res, 'PRODUCT.CREATE_SUCCESS', result);
    utils.handleSuccess(res, "PRODUCT.CREATE_SUCCESS", item);
  } catch (error) {
    // console.log(error)
    // return res.send(error)
    utils.handleError(req, res, error, "PRODUCT.CREATE_ERROR");
  }
};

/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.deleteItem = async (req, res) => {
  try {
    const data = req.value;
    const item = await db.deleteItem(data.id, Products);
    utils.handleSuccess(res, "PRODUCT.DELETE_SUCCESS", item);
  } catch (error) {
    utils.handleError(req, res, error, "PRODUCT.DELETE_ERROR");
  }
};

//   /**
//    * Get One item function called by route
//    * @param {Object} req - request object
//    * @param {Object} res - response object
//    */
//   exports.getItem = async (req, res) => {
// 	try {
// 	  const data = req.value;
// 	  const item = await db.getItem(data.id, Brand);

// 	  utils.handleSuccess(res, 'Brand.GET_SINGLE_SUCCESS', item);
// 	} catch (error) {
// 	  utils.handleError(req, res, error, 'Brand.GET_SINGLE_ERROR');
// 	}
//   };

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateItem = async (req, res) => {
  try {
    let data = req.value;


    if (data.manage_stock) {
      if (data.stock_quantity > 0) data.stock_status = "instock";
      else data.stock_status = "outofstock";
    }
    if(data.variations)
    {
      data.variations = await Promise.all(
        data.variations.map(async (row, index) => {
          if (row.id){
            let stock_status = "";
            if (row.manage_stock) {
              if (row.stock_quantity > 0) stock_status = "instock";
              else stock_status = "outofstock";
            } else {
              stock_status = "instock";
            }
  
            data.stock_quantity = data.stock_quantity + row.stock_quantity;
            data.price = data.variations[0].price;
            data.salePrice = data.variations[0].salePrice;
           const status = await db.updateItem(row.id,Variations,row)
           console.log('status',status);
           return row.id
          }
          else {
            let stock_status = "";
            if (row.manage_stock) {
              if (row.stock_quantity > 0) stock_status = "instock";
              else stock_status = "outofstock";
            } else {
              stock_status = "instock";
            }
  
            data.stock_quantity = data.stock_quantity + row.stock_quantity;
            data.price = data.variations[0].price;
            data.salePrice = data.variations[0].salePrice;
  
            let variationObj = {
              attributes: row.attribute,
              price: row.price,
              salePrice: row.salePrice,
              manage_stock: row.manage_stock,
              stock_quantity: row.stock_quantity,
              sku: data.sku + "-" + index,
              status: "publish",
              tax_status: "taxable",
              tax_class: "",
              stock_status: stock_status,
            };
            const item = await db.createItem(variationObj, Variations);
            return item._id;
          }
        })
      );
    }
    
    console.log(data.variations);
    const item = await db.updateItem(data.id, Products, data);
    utils.handleSuccess(res, "PRODUCT.UPDATE_SUCCESS", item);
  } catch (error) {
    console.log(error);
    utils.handleError(req, res, error);
  }
};

exports.getSkuExists = async (req, res) => {
  try {
    const data = req.value;

    const skuExists = await db.getItemByQuery(
      { sku: data.sku },
      Products,
      false,
      false,
      { _id: 0 }
    );
    if (skuExists) {
      utils.handleError(
        req,
        res,
        utils.buildErrObject({
          ...ErrorCodes.ITEM_ALREADY_EXISTS,
          message: "PRODUCT.ALREADY_EXISTS_SKU",
        })
      );
      return;
    }

    utils.handleSuccess(res, "PRODUCT.DOES_NOT_EXISTS_SKU");
  } catch (error) {
    utils.handleError(req, res, error, "ERROR.INTERNAL_SERVER_ERROR");
  }
};

exports.getAutoCompleteSearch = async (req, res) => {
  try {
    if (req.query.search) {
      let Search;
      if (req.query.category)
        Search = await db.get(
          Products,
          {
            name: { $regex: ".*" + req.query.search + ".*", $options: "i" },
            categories: req.query.category,
          },
          { name: 1 },
          10
        );
      else
        Search = await db.get(
          Products,
          { name: { $regex: ".*" + req.query.search + ".*", $options: "i" } },
          { name: 1 },
          10
        );

      console.log(Search);
      utils.handleSuccess(res, "PRODUCT.GET_SINGLE_SUCCESS", Search);
    } else {
      utils.handleSuccess(res, "PRODUCT.GET_SINGLE_SUCCESS", []);
    }
  } catch (error) {
    utils.handleError(req, res, error, "PRODUCT.GET_SINGLE_ERROR");
  }
};

exports.getItemBO = async (req, res) => {
  try {
    const data = req.value;
    const item = await db.getOne(data.id, Products, {}, "variations");
    console.log(item);
    utils.handleSuccess(res, "PRODUCT.GET_SINGLE_SUCCESS", item);
  } catch (error) {
    utils.handleError(req, res, error, "PRODUCT.GET_SINGLE_ERROR");
  }
};

exports.getProductAvailability = async (req, res) => {
  try {
    let data = req.value;

    let result = [];
    result = await Promise.all(
      data.line_items.map(async (item) => {
        try {
          let obj = {};
          if (!_.isUndefined(item.variation_id)) {
            console.log("find by variations id");
            // TODO: update this query - need to take it from products now
            obj = await Crud.getOne(
              Variations,
              { _id: item.variation_id },
              { stock_quantity: 1 }
            );
          }

          if (_.isUndefined(item.variation_id)) {
            console.log("find by product id");
            //TODO: update this query -
            obj = await Crud.getOne(
              Products,
              { _id: item.product_id },
              { stock_quantity: 1 }
            );
          }
          console.log(obj);
          if (!_.isNull(obj)) {
            if (Number(obj.stock_quantity) >= item.quantity) {
              return { id: item.product_id, flag: true };
            } else
              return {
                id: item.product_id,
                flag: false,
                quantity: obj.stock_quantity,
              };
          }
          return { flag: false };
        } catch (error) {
          console.log(error);
          return { flag: false };
        }
      })
    );

    utils.handleSuccess(res, "PRODUCT.LIST_SUCCESS", result);
  } catch (error) {
    utils.handleError(req, res, error, "PRODUCT.LIST_ERROR");
  }
};

exports.getTaxVerification = async (req, res) => {
  try {
    let data = req.value;
    let tax_cond = {};

    // ProductServices.placeCondition(data.address, tax_cond);
    // let tax = await Crud.getOne(Taxes, tax_cond, { value: 1, 'rates.rate': 1, 'rates.country': 1, 'rates.state': 1, 'rates.zip_code': 1 });
    // return res.send(tax)

    let items = await Promise.all(
      data.line_items.map(async (item) => {
        try {
          let Model;
          let cond = {};
          if (
            !_.isUndefined(item.variation_id) &&
            !_.isEmpty(item.variation_id)
          ) {
            console.log("Variations");
            Model = Variations;
            cond._id = item.variation_id;
          } else {
            Model = Products;
            cond._id = item.product_id;
            console.log("products");
            console.log(cond);
          }

          let query = {};
          let result = await Crud.getOne(Model, cond, {
            sale_price: 1,
            tax_status: 1,
            tax_class: 1,
            price: 1,
          });
          console.log(result);
          // return res.send(result);
          if (!_.isNull(result)) {
            let tax_cond = {};
            if (["", "standard"].includes(result.tax_class)) {
              tax_cond = {
                value: "standard",
              };
            } else if (result.tax_class === "reduced-rate") {
              tax_cond = {
                value: "reduced-rate",
              };
            } else if (result.tax_class === "zero-rate") {
              //ignore
              tax_cond = {
                value: "zero-rate",
              };
            }
            ProductServices.placeCondition(data.address, tax_cond);
            console.log(tax_cond);
            let tax = await Crud.getOne(Taxes, tax_cond, {
              value: 1,
              "rates.rate": 1,
              "rates.country": 1,
              "rates.state": 1,
              "rates.zip_code": 1,
            });
            console.log("value of tax 250tax");
            console.log(tax);
            let value = ProductServices.calculateTaxes(
              result,
              tax,
              item,
              data.address
            );
            return { ...item, value };
          }
          return { ...item, value: 0 };
          // console.log()
        } catch (error) {
          console.log(error);
          return { ...item, value: 0, err: true };
          // return { flag: false }
        }
      })
    );

    utils.handleSuccess(res, "PRODUCT.LIST_SUCCESS", items);
  } catch (error) {
    utils.handleError(req, res, error, "PRODUCT.LIST_ERROR");
  }
};

exports.getShippingInfo = async (req, res) => {
  try {
    let data = req.value;

    console.log("value of item =>  ", data);
    let cond = {};

    ProductServices.getShippingCondition(data, cond, true);
    console.log("value of condition");
    console.log(cond);

    // cond.method_id = "flat_rate";
    let projection = {
      // zone_id: 1,
      "shipping_methods.method_id": 1,
      "shipping_methods.settings": 1,
    };
    let coupon;
    let items = await Crud.getOne(Shippings, cond, projection);

    if (_.isNil(items)) {
      console.log("remove zip code");
      delete cond.zip_code;
      cond["zip_code"] = { $exists: false };
      console.log(cond);
      items = await Crud.getOne(Shippings, cond, projection);
    }
    console.log("items after zip code");
    console.log(items);
    if (_.isNil(items)) {
      console.log("remove state");
      delete cond.state;
      cond["state"] = { $exists: false };
      console.log(cond);
      items = await Crud.getOne(Shippings, cond, projection);
    }

    console.log(items);
    // return res.send({ items })
    let result = {};

    if (!_.isNil(items))
      result = ProductServices.shippingFilter(items.shipping_methods, false);
    else {
      console.log("hanslo");
      result.service = "No delivery";
    }
    // return res.send({result ,items})
    // if(!_.isUndefined(data.coupon) && !_.isEmpty(data.coupon)) {
    // 	coupon = await Crud.getOne(Coupons, { code: data.coupon }, {});
    // 	console.log('coupon')
    // 	console.log(coupon)
    // 	// Coupons
    // }

    utils.handleSuccess(res, "PRODUCT.LIST_SUCCESS", result);
  } catch (error) {
    console.log(error);
    utils.handleError(req, res, error, "PRODUCT.LIST_ERROR");
  }
};
