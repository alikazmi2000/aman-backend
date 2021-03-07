const db = require('../middleware/db');
const Brands = require('../models/brands');
const _ = require('lodash');

/**
 ***********************************************************
 * Public Functions
 ***********************************************************
 */

/**
 * Map Image data
 */

 const mapImages = (data) => {
	return data.map(item => {
		let obj = { name: item.name };
		obj.image = item.brand_image && item.brand_image.name ? item.brand_image.name : process.env.ASSET_IMG_DEFAULT_BRAND;
		return obj
	});
 }





 const boItemConversion = (data) => {
	return data
		return data.map(item => {
			let obj = {
				name: item.name,
				sku: item.sku,
				stock_quantity: Number(item.stock_quantity),
				price: item.price,
				// category_name: item.categories[0].name || '',
				category_name: !_.isUndefined(item.categories[0].name) ? item.categories[0].name : '',
				brand_name: (!_.isEmpty(item.brands) && !_.isUndefined(item.brands[0].name)) ? item.brands[0].name : ''
	
			}
			// if (item.variations != [] && item.stock_quantity === null) {
			//     // console.log(item.variations)
			//     let stock = 0;
			//     item.variations.map(i => {
			//         stock += Number(i.stock_quantity);
			//     });
			//     console.log(stock)
			//     obj.stock_quantity = stock;
			// }
			return obj;
		})
	}
	



 module.exports  = {
	mapImages,
	boItemConversion
 }