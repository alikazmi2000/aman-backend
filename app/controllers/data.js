const Country = require('../models/country');
const utils = require('../middleware/utils');
const db = require('../middleware/db');
const { Status } = require('../enums');


/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getCountryList = async (req, res) => {
  try {

    const items = await db.get(Country, {},{_id : 0,name:1,code:1});
    utils.handleSuccess(res, 'DATA.LIST_SUCCESS', items);
  } catch (error) {
    utils.handleError(req, res, error, 'DATA.LIST_ERROR');
  }
};


exports.getStateList = async (req, res) => {
  try {
    
    if(req.query.code){
      const items = await db.get(Country, {code:req.query.code},{_id : 0,name:1,code:1,states:1},1);

        utils.handleSuccess(res, 'DATA.LIST_SUCCESS', items);
    }else{
      utils.handleSuccess(res, 'DATA.LIST_SUCCESS', []);

    }
  } catch (error) {
    utils.handleError(req, res, error, 'DATA.LIST_ERROR');
  }
};