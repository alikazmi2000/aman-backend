const db = require('../middleware/db');
const Setting = require('../models/setting');

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


/**
 * Get stripe key using settings
 */
exports.getStripeKeyUsingSettings = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const settings = await this.getSettingsObject();
      let stripeKey = process.env.STRIPE_SECRET_KEY;
      if (
        typeof settings.stripeTestPayment !== 'undefined' &&
        process.env.STRIPE_SECRET_KEY_PROD &&
        settings.stripeTestPayment === false
      ) {
        stripeKey = process.env.STRIPE_SECRET_KEY_PROD;
      }
      resolve(stripeKey);
    } catch (err) {
      reject(err);
    }
  });
};

