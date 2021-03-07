const db = require('../middleware/db');
const Categories = require('../models/categories');
const _ = require('lodash');
/**
 ***********************************************************
 * Public Functions
 ***********************************************************
 */

/**
 * Get settings data
 */
exports.getSettingsObject = () => {
	return new Promise(async (resolve, reject) => {
		try {
			const settings = await db.getAllItems({}, Setting);
			let item = {};
			if (settings.length && settings.hasOwnProperty(0)) {
				item = settings[0];
			} else {
				item = await db.createItem({}, Setting); // {} means It will create setting by default params
			}
			resolve(item);
		} catch (err) {
			reject(err);
		}
	});
};


// aggregate

/**
 * Get settings data
 */
exports.parentAggregateGraphLookup = () => {
	return {
		$graphLookup: {
			from: "categories",
			startWith: "$_id",
			connectFromField: "_id",
			connectToField: "parent",
			as: "child"
		}
	}
};

exports.parentAggregateGraphLookup = () => {
	return {
		$projection: {
			_id: 1,
			name: 1,
			date_created: 1,
			sku: 1,
			status: 1,
			// stock_quantity: 1,
			// price: 1,
			// stock_status: 1,
			// category_name: 1,
			// brand_name: 1
		}
	}
};


/**
 * Get settings data
 */
exports.AggregateMatch = (data) => {
	return {
		$match: data
	}
};

  exports.resCategoryDropDown= req => {
	return {
	id: req._id,
	name: req.name,
	hasSubCategory : req.hasSubCategory,
	parentId: (req.parent) ? req.parent : 0,
	};
};





exports.boItemConversion = (data) => {
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
