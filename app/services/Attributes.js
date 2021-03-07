const db = require('../middleware/db');
const Attributes = require('../models/attributes');
const _ = require('lodash');

/**
 ***********************************************************
 * Public Functions
 ***********************************************************
 */

const resCreateDocument = (data) => {
	console.log('data')
	console.log(data)
	return {
		_id: data._id,
		name: data.name,
		options: data.options
	}
}




 module.exports  = {
	resCreateDocument
 }