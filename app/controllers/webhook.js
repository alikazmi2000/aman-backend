const moment = require('moment');
const utils = require('../middleware/utils');
const auth = require('../middleware/auth');
const db = require('../middleware/db');
const usersService = require('../services/Users');

exports.cancelRecord = async (req, res) => {
    try {
        console.log('order is cancelled')
        console.log(req.body)
        utils.handleSuccess(res, successMsg, info, token);
    } catch (error) {
        console.log(error)
        utils.handleError(req, res, error, 'USER.SIGNUP_ERROR');
    }
};
/**
 * Verify Phone function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */