
const paypal = require('../services/paypal');
const utils = require('../middleware/utils');
const _ = require('lodash');
/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.createPayment = async (req, res) => {
  try {

    const data = req.value;
    let response = await paypal.purchase(data);

    return res.send(response.result);

  } catch (error) {
    console.log(error);
    utils.handleError(req, res, error, 'ORDER.LIST_ERROR');
  }
};


exports.executePayment = async (req, res) => {
  try {

    let response = await paypal.captureOrder(req.body.paymentID);

    return res.send(response.result);

  } catch (error) {
    console.log(error);
    utils.handleError(req, res, error, 'ORDER.LIST_ERROR');
  }
};


exports.generateClientToken = (req, res) => {

  return res.send({ message: 'method is not implemented yet' })
}

exports.createCard = (req, res) => {


  return res.send({ message: 'method is not implemented yet' })
}