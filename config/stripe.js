const { getStripeKeyUsingSettings } = require('../app/services/Others');

/**
 * Create Customer on Stripe
 * @param {Object} data - data object
 */
exports.createCustomer = async data => {
  return new Promise(async (resolve, reject) => {
    const stripe = require('stripe')(await getStripeKeyUsingSettings());
    stripe.customers.create(
      {
        name: `${data.name}`,
        email: data.email,
        description: `Customer (${data.email})`
      },
      (err, customer) => {
        if (err) {
          reject(err);
        } else {
          resolve(customer);
        }
      }
    );
  });
};

/**
 * Create Source on Stripe (e.g. Credit/Debit Card, Bank Account)
 * @param {string} token - stripe token
 * @param {string} customerId - stripe customer id
 */
exports.createSource = async (token, customerId) => {
  return new Promise(async (resolve, reject) => {
    const stripe = require('stripe')(await getStripeKeyUsingSettings());
    stripe.customers.createSource(
      customerId,
      {
        source: token
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};

/**
 * Create External using Bank Account token on Stripe
 * @param {string} token - stripe token
 * @param {string} connectedAccountId - stripe connected Account Id
 */
exports.createExternalAccount = async (token, connectedAccountId) => {
  return new Promise(async (resolve, reject) => {
    const stripe = require('stripe')(await getStripeKeyUsingSettings());
    stripe.accounts.createExternalAccount(
      connectedAccountId,
      {
        // eslint-disable-next-line camelcase
        external_account: token
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};

/**
 * Create Connected Account for the Stripe
 */
exports.createConnectedAccount = async data => {
  return new Promise(async (resolve, reject) => {
    const stripe = require('stripe')(await getStripeKeyUsingSettings());
    stripe.accounts.create(
      {
        type: 'custom',
        country: process.env.STRIPE_COUNTRY,
        // eslint-disable-next-line camelcase
        business_type: 'individual',
        // eslint-disable-next-line camelcase
        default_currency: process.env.STRIPE_CURRENCY,
        ...data,
        // eslint-disable-next-line camelcase
        requested_capabilities: ['card_payments', 'transfers']
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

/**
 * Update Source on Stripe (e.g. Credit/Debit Card, Bank Account)
 * @param {string} token - stripe card token
 * @param {string} customerId - stripe customer id
 */
exports.updateDefaultSource = async (token, customerId) => {
  return new Promise(async (resolve, reject) => {
    const stripe = require('stripe')(await getStripeKeyUsingSettings());
    // eslint-disable-next-line camelcase
    stripe.customers.update(customerId, { default_source: token }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Delete Source on Stripe (e.g. Credit/Debit Card, Bank Account)
 * @param {string} token - stripe token
 * @param {string} customerId - stripe customer id
 */
exports.deleteSource = async (token, customerId) => {
  return new Promise(async (resolve, reject) => {
    const stripe = require('stripe')(await getStripeKeyUsingSettings());
    stripe.customers.deleteSource(customerId, token, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Charge from the user on Stripe
 * @param {string} customerId - stripe customer Id
 * @param {Number} amount - amount to be deducted
 * @param {string} transactionId - transactionId from our database
 * @param {Object} metadata - metadata object
 */
exports.charge = async (customerId, amount, transactionId, metadata = {}) => {
  return new Promise(async (resolve, reject) => {
    const stripe = require('stripe')(await getStripeKeyUsingSettings());
    stripe.charges
      .create({
        amount: amount * 100, // Converting to dollars
        currency: process.env.STRIPE_CURRENCY,
        customer: customerId,
        // eslint-disable-next-line camelcase
        transfer_group: transactionId,
        metadata
      })
      .then(charge => {
        resolve(charge);
      })
      .catch(err => {
        reject(err);
      });
  });
};

/**
 * Refund the user amount on Stripe
 * @param {string} chargeId - stripe charge Id
 * @param {Object} metadata - metadata object
 */
exports.refund = async (chargeId, metadata = {}) => {
  return new Promise(async (resolve, reject) => {
    const stripe = require('stripe')(await getStripeKeyUsingSettings());
    stripe.refunds.create({ charge: chargeId, metadata }, (err, refund) => {
      if (err) {
        reject(err);
      } else {
        resolve(refund);
      }
    });
  });
};

/**
 * Transfer amount to user account on Stripe
 * @param {Number} amount - amount
 * @param {string} chargeId - chargeId of stripe transaction
 * @param {string} stripeConnectedAccountId - stripe stripeConnectedAccountId
 * @param {Object} metadata - metadata object
 */
exports.transfer = async (amount, chargeId, stripeConnectedAccountId, metadata = {}) => {
  return new Promise(async (resolve, reject) => {
    const stripe = require('stripe')(await getStripeKeyUsingSettings());
    stripe.transfers.create(
      {
        amount: amount * 100, // Converting to dollars
        currency: process.env.STRIPE_CURRENCY,
        // eslint-disable-next-line camelcase
        source_transaction: chargeId,
        destination: stripeConnectedAccountId,
        metadata
      },
      (err, refund) => {
        if (err) {
          reject(err);
        } else {
          resolve(refund);
        }
      }
    );
  });
};

/**
 * Transfer amount to user account on Stripe
 * @param {stripe} txnId - balance transaction Id
 */
exports.getBalanceTransaction = async txnId => {
  return new Promise(async (resolve, reject) => {
    const stripe = require('stripe')(await getStripeKeyUsingSettings());
    stripe.balanceTransactions.retrieve(txnId, (err, balanceTransaction) => {
      if (err) {
        reject(err);
      } else {
        resolve(balanceTransaction);
      }
    });
  });
};


/** Create a new invoice item
 * @param  {string} customerId - stripe customer id
 * @param  {number} amount amount in usd - default is $15 for one driver
 */
exports.createInvoiceItem = async (customerId, amount) => {
  return new Promise(async (resolve, reject) => {
    const stripe = require('stripe')(await getStripeKeyUsingSettings());
    stripe.invoiceItems.create({
      customer: customerId,
      amount: amount * 100, // amount in cents
      currency: process.env.STRIPE_CURRENCY,
      description: `Customer (${customerId}) invoice created`
    }, (err, invoiceItem) => {
      if (err) {
        reject(err);
      } else {
        resolve(invoiceItem);
      }
    });
  })
}



// /** Create invoice item for upaid invoice of monthyl billing
//  * @param  {string} customerId - stripe customer id
//  * @param  {number} amount - amount in cents
//  * @param  {string} description ='Previousmonthpendingbilladdedtoupcomminginvoice'
//  */
// exports.createInvoiceItemForArrears = async (customerId, amount, description = 'Previous month pending bill added to upcoming invoice') => {
//   return new Promise(async (resolve, reject) => {
//     stripe.invoiceItems.create({
//       customer: customerId,
//       amount: amount * 100, // amount in cents
//       currency: process.env.STRIPE_CURRENCY,
//       description: `Customer (${customerId}) invoice created`
//     }, (err, invoiceItem) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(invoiceItem);
//       }
//     });
//   })
// }



/** Get invoice item 
 * @description Retrieve the invoice item details by id 
 * @param  {string} id - Invoice item id
 * @returns {object} - Contains details of invoice item 
 */
exports.getInvoiceItem = async (id) => {
  return new Promise(async (resolve, reject) => {
    stripe.invoiceItems.retrieve(id, (err, invoiceItem) => {
      if (err) {
        reject(err);
      } else {
        resolve(invoiceItem);
      }
    })
  })
}



/** 
 * @description Delete an invoice item
 * @param  {string} id - inovice item id
 */
exports.deleteInvoiceItem = async (id) => {
  // console.log('\n ----- inside delete invoice item payment helper  \n')
  return new Promise(async (resolve, reject) => {
    stripe.invoiceItems.del(id, (err, confirmation) => {
      console.log('\n\n  inside delete inoivce item payment helper  --  err   ', err, '   confirmation   ', confirmation, '    **\n')
      if (err) {
        reject(err);
      } else if (!confirmation.deleted) {
        resolve(confirmation);
      } else {
        resolve(confirmation);
      }
    });
  })
}





/** Update amount and description of inovice item
 * @param  {string} id - invoice item id
 * @param  {string} amount - amount in usd
 * @param  {string} description='Amountsubtractedfrominoviceitemondeletedriver'
 */
exports.updateInvoiceItem = async (id, amount, description = 'Amount subtracted from inovice item on delete driver') => {
  return new Promise(async (resolve, reject) => {
    stripe.invoiceItems.update(id,
      {
        amount: amount * 100,
        description: description
      }, (err, invoiceItem) => {
        if (err) {
          reject(err);
        } else {
          resolve(invoiceItem);
        }
      });
  })
}








/** Update amount and description of inovice item
 * @param  {string} customerId - stripe customer id
 * @param  {string} planId - stripe plan id
 */
exports.createSubscription = async (planId, customerId) => { 
  const items = new Array({ plan: planId });
  return new Promise(async (resolve, reject) => {
      stripe.subscriptions.create({
          customer: customerId,
          items: items,
          trial_from_plan: true // apply trial days
      }, (err, subscription) => {
          //console.log('\n\n   stripe create subscription method   ----    err    ',err,'   subscription    ',subscription,'    ---\n');
          if (err || !subscription || !subscription.id) {
              reject(err);
          } else {
              if (subscription.items && Object.keys(subscription.items).length > 2 && subscription.items.data && Array.isArray(subscription.items.data) && subscription.items.data.length > 0) {
                  const result = {
                      subscriptionItemId: subscription.items.data[0].id,
                      subscriptionId: subscription.id,
                      subscription: subscription
                  }
                  resolve(result);
              } else {
                  reject(err || subscription);
              }
          }
      });
  })
}





/** Get subscription data
 * @description Get subscription data by id
 * @param  {string} id - stripe subscription id
 * @returns {array} - Array of cards info
 */
exports.getSubscription = (id) => {
  return new Promise((resolve, reject) => {
    stripe.subscriptions.retrieve(id, (err, result) => {
      err ? reject(err) : resolve(result);
    })
  })
}




/** Update amount and description of inovice item
 * @param  {string} subscriptionId - stripe subscription id
 */
exports.cancelSubscription = (subscriptionId) => {
  return new Promise(async (resolve, reject) => {
    stripe.subscriptions.del(subscriptionId, (err, confirmation) => {
      console.log('\n  in cancel subscriptin method     err   ', err, '   confirmation    ', confirmation, '    \n')
      err ? reject(err) : resolve(confirmation);
    });
  })
}


/** Update amount and description of inovice item
 * @param  {string} subscriptionItemId - stripe subscription item id
 */
exports.cancelSubscriptionItem = (subscriptionItemId) => {
  return new Promise(async (resolve, reject) => {
    stripe.subscriptionItems.del(subscriptionItemId, (err, confirmation) => {
      console.log('\n\n   cancel subscription item    errr    ', err, '   confirmation    ', confirmation)
      err ? reject(err) : resolve(confirmation)
    });
  })
}


// /** Update amount and description of inovice item
//  * @param  {string} subscriptionItemId - stripe subscription item id
//  */
// exports.createPlan_live = (productId, nickName = '', interval = 'month', amount = 150, currency = 'usd') => {
//   return new Promise(async (resolve, reject) => {
//       const obj = {
//           currency: currency,
//           interval: interval,
//           product: productId,
//           nickname: nickName,
//           interval_count: 1, // bill at the end of each month
//           trial_period_days: 14,
//           amount: amount * 100 // in cents
//       }

//       stripe.plans.create(obj, function (err, plan) {
//           if (err || !plan || !plan.id) {
//               reject(err);
//           } else {
//               resolve(plan);
//           }
//       });

//   })
// }



/** Format cards data
 * @description Format stripe get customer api response
 * @param  {object} customer - stripe customer object
 * @returns {array} - Array of cards info
 */
exports.formatCardsDetails = (customer) => {
  const default_source = customer.default_source;
  const cards = customer.sources.data;
  let arr = new Array();
  if (cards.length > 0) {
    for (let i = 0; i < cards.length; i++) {
      let obj = {
        brand: cards[i].brand,
        exp_year: cards[i].exp_year,
        exp_month: cards[i].exp_month,
        last4: cards[i].last4,
      }
      obj['default'] = default_source == cards[i].id ? true : false;
      arr.push(obj);
      obj = {};
    }
  }
  if (arr.length == 1) {
    arr[0].default = true;
  }

  return arr;
}



