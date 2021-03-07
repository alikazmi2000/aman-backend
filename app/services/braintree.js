const braintree = require('braintree');
// const { Customers } = require('.');
const Customers = require('./../models/customers');

class BraintreeHelper {

    static getBraintreeRef(){
        let publicKey = process.env.braintree_public_key;
        let privateKey = process.env.braintree_private_key;
        let merchantId = process.env.braintree_merchant_id;
        let environment = braintree.Environment.Sandbox;
        const braintreeEnv = process.env.braintree_env;

        
        if (braintreeEnv != 'sandbox') {
            // publicKey = process.env.braintree_public_key_prod;
            // privateKey = process.env.braintree_private_key_prod;
            // merchantId = process.env.braintree_merchant_id_prod;
            environment = braintree.Environment.Production;
        }
        
        // console.log('getBraintreeRef())
        // console.log(publicKey);
        // console.log(privateKey);
        // console.log(merchantId);
        // console.log(environment);
        const gateway = braintree.connect({
            environment: environment,
            merchantId: merchantId,
            publicKey: publicKey,
            privateKey: privateKey
        });

        return gateway;

    }

    static generateClientToken(customerId = '') {
        const gateway = BraintreeHelper.getBraintreeRef();

        return new Promise((resolve, reject) => {
            let obj = new Object();
            if (customerId != '')
                obj.customerId = customerId;

            gateway.clientToken.generate(obj, (err, result) => {
                if (err || !result.clientToken) {
                    reject(err);
                } else {
                    resolve(result.clientToken);
                }
            });
        })
    }

    static createPaymentMethod(token, customerId) {
        const gateway = BraintreeHelper.getBraintreeRef();
        const obj = {
            customerId: customerId,
            paymentMethodNonce: token,
            options: {
                makeDefault: true,
                // verifyCard: true
            }
        }

        return new Promise((resolve, reject) => {
            gateway.paymentMethod.create(obj, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        })

    }

    static createCustomer(user, token) {
        const gateway = BraintreeHelper.getBraintreeRef();
        const obj = {
            firstName: user.fname,
            lastName: user.lname,
            email: user.email,
            phone: user.phone,
            paymentMethodNonce: token,
            creditCard: {
                options: {
                    // verifyCard: true
                }
            }
        }

        return new Promise((resolve, reject) => {
            gateway.customer.create(obj, (err, result) => {
                err || !result.success ? reject(err || result) : resolve(result);
            })
        })

    }

    static getCustomer(customerId) {
        const gateway = BraintreeHelper.getBraintreeRef();

        return new Promise((resolve, reject) => {
            gateway.customer.find(customerId, (err, customer) => {
                //console.log('\n braintree   customer retrieved    err    ', err, '   result  ', customer, '   ***\n\n')
                err ? reject(err) : resolve(customer);
            });
        })
    }


    /*  Add driver account by creating a submerchant   */
    static createMerchantAccount(cid, data) {
        console.log('\n braintree create merchant data    ', data, '   ***\n\n')
        const gateway = BraintreeHelper.getBraintreeRef();

        const descriptor = process.env.braintree_descriptor;
        if (!descriptor || descriptor == '') {
            descriptor = 'CSN';
        }

        console.log('what does it says??')
        console.log(braintree.MerchantAccount.FundingDestination.Bank);

        const merchantAccountParams = {
            individual: {
              firstName: "Jane",
              lastName: "Doe",
              email: "jane@14ladders.com",
              phone: "5553334444",
              dateOfBirth: "1981-11-19",
              ssn: "456-45-4567",
              address: {
                streetAddress: "111 Main St",
                locality: "Chicago",
                region: "IL",
                postalCode: "60622"
              }
            },
            business: {
              legalName: "Jane's Ladders",
              dbaName: "Jane's Ladders",
              taxId: "98-7654321",
              address: {
                streetAddress: "111 Main St",
                locality: "Chicago",
                region: "IL",
                postalCode: "60622"
              }
            },
            funding: {
              descriptor: "Blue Ladders",
              destination: braintree.MerchantAccount.FundingDestination.Bank,
              email: "funding@blueladders.com",
              mobilePhone: "5555555555",
              accountNumber: "1123581321",
              routingNumber: "071101307"
            },
            tosAccepted: true,
            masterMerchantAccountId: "shaheenairlines"
            // ,
            // id: "blue_ladders_store"
          };
        // const merchantAccountParams = {
        //     individual: {
        //         firstName: data.fName,
        //         // firstName: data.fName,
        //         lastName: data.lName,
        //         email: data.email,
        //         phone: data.phone,
        //         dateOfBirth: data.dob,
        //         // ssn: data.ssn
        //         // ,
        //         address: { streetAddress: "111 Main St", locality: "Chicago", region: "IL", postalCode: "60622" }
        //     },
        //     funding: {
        //         descriptor: descriptor,
        //         destination: braintree.MerchantAccount.FundingDestination.Bank,
        //         email: data.email,
        //         mobilePhone: data.phone,
        //         accountNumber: data.aNo,
        //         routingNumber: data.iban
        //     },
        //     tosAccepted: true,
        //     masterMerchantAccountId: 'shaheenairlines'
        //     // masterMerchantAccountId: 'shaheenairlines'
        //     // masterMerchantAccountId: 'wcd372wk379sjq6j'
        //     // masterMerchantAccountId: 'csn_cloud_updated'
        //     // masterMerchantAccountId: 'ft9wqg'
        //     // masterMerchantAccountId: process.env.braintree_merchant_id
        //     // masterMerchantAccountId: process.env.braintree_merchant
        //     // masterMerchantAccountId: 'CSN'
        //     // masterMerchantAccountId: 'driverTest'
        //     // braintree_merchant
        // };
        console.log('process.env.braintree_merchant');
    console.log('after creating data   ')
    console.log(merchantAccountParams);
        return new Promise((resolve, reject) => {
            gateway.merchantAccount.create(merchantAccountParams, (err, customer) => {
                console.log('\n  create braintree merchant  err  -- ', err, '  ---     customer      ', customer, '  \n')

                if(customer) {
                    console.log('response customer')
                    console.log(customer.errors.errorCollections.merchantAccount)
                    // console.log(Object.keys(customer.errors.errorCollections).merchantAccount)

                }
                err ? reject(err) : resolve(customer);
            });
        })
    }



    /* Update driver account  */
    static updateMerchantAccount(cid, data) {
        const gateway = BraintreeHelper.getBraintreeRef();
        const descriptor = process.env.braintree_descriptor;
        // if(!descriptor || descriptor == '') {
        //     descriptor = 'Cabstartup';
        // }
        let params = {
            funding: {
                descriptor: descriptor,
                destination: braintree.MerchantAccount.FundingDestination.Bank,
                routingNumber: data.routing_num,
                accountNumber: data.acc_num
            },
            tosAccepted: true,
            masterMerchantAccountId: merchandId
        };
        if (data.email || data.phone || data.ssn || data.fName || data.lName) {
            params['individual'] = {};
            if (data.email) {
                params['individual']['email'] = data.email;
                params['funding']['email'] = data.email;
            }
            if (data.phone) {
                params['individual']['phone'] = data.phone;
                params['funding']['mobilePhone'] = data.phone;
            }
            if (data.ssn) {
                params['individual']['ssn'] = data.ssn;
            }
            if (data.email) {
                params['individual']['firstName'] = data.fName;
            }
            if (data.email) {
                params['individual']['lastName'] = data.lName;
            }
        }

        return new Promise((resolve, reject) => {
            gateway.merchantAccount.update(data.mId, params, (err, customer) => {
                //console.log('\n braintree   customer updated    err    ', err, '   result  ', customer, '   ***\n\n')
                err ? reject(err) : resolve(customer);
            });
        })
    }


/*  Set a default credit card   */
    static setDefault(cid, token) {
        const gateway = BraintreeHelper.getBraintreeRef();

        return new Promise((resolve, reject) => {
            gateway.paymentMethod.update(token, {
                options: {
                    makeDefault: true
                }
            }, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        })
    }

/*  Delete a card and handle multiple cards scenario if default one is deleted + if there was just one card ,,,  */
    static deleteCard(cid, token) {
        const gateway = BraintreeHelper.getBraintreeRef();

        return new Promise((resolve, reject) => {
            gateway.paymentMethod.delete(token, function (err, deleted) {
                err ? reject(err) : resolve(result);
            });
        })

    }




    /* create braintree market place transaction */
    static createTransaction(cid, id, mId, amount, driverPayout) {
        const gateway = BraintreeHelper.getBraintreeRef();

        return new Promise((resolve, reject) => {

            gateway.transaction.sale({
                customerId: id,
                amount: amount.toString(),
                serviceFeeAmount: driverPayout.toString(),
                merchantAccountId: mId,
                options: {
                    submitForSettlement: true
                }
            }, function (err, result) {
                if (result && result.success) {
                    resolve(result);
                    // return cb({ success: true, result: result });
                } else {
                    reject(err)
                }
                // if (result && result.success) {
                //     resolve(result);
                //     return cb({ success: true, result: result });
                // } else if (result.success == false) {
                //     err ? reject(err) : resolve(result);
                //     return cb({ success: false, result: result });
                // } else {
                //     err ? reject(err) : resolve(result);
                //     return cb({ success: false, result: err });
                // }
            });


            // gateway.paymentMethod.delete(token, function (err, deleted) {
            //     err ? reject(err) : resolve(result);
            // });
        })


    }




    /* create braintree market place transaction */
    static createNormalTransaction(cid, id, amount, description = '') {
        const gateway = BraintreeHelper.getBraintreeRef();

        return new Promise((resolve, reject) => {
            gateway.transaction.sale({
                customerId: id,
                amount: amount.toString(),
                options: {
                    submitForSettlement: true
                }
            }, function (err, result) {
                if (result && result.success) {
                    // resolve(result)
                    resolve({ success: true, transaction: result, message: 'Payment succeeded' });
                } else if (result.success == false) {
                    resolve({ success: false, transaction: result, message: 'Payment did not succeed' });
                } else {
                    reject(err)
                    // return cb({ success: false, result: err });
                }
            });
        });
    }



    static formatCardsDetails(customer) {
        let result = new Array();
        if (customer.paymentMethods.length > 0) {
            for (var i = 0; i < customer.paymentMethods.length; i++) {
                let obj = {
                    token: customer.paymentMethods[i].token,
                    default: customer.paymentMethods[i].default,
                    last4: customer.paymentMethods[i].last4,
                    // maskedNumber: customer.paymentMethods[i].maskedNumber,
                    default: customer.paymentMethods[i].default,
                    brand: customer.paymentMethods[i].cardType,
                    exp_year: customer.paymentMethods[i].expirationYear,
                    exp_month: customer.paymentMethods[i].expirationMonth
                }
                result.push(obj);
                obj = {};
            }

        }
        return result;
    }



    static async addCard(user, token) {
        return new Promise(async (resolve, reject) => {
            if (!token || token == '')
                reject('Credit card information is missing');

            try {
                let customerId;
                if (user.paypal_customer_id && user.paypal_customer_id != '') {
                    customerId = user.paypal_customer_id;

                    // Get customer information
                    const customer = await this.getCustomer(customerId);

                    // Create payment method
                    const paymentMethod = await this.createPaymentMethod(token, customerId);

                } else {
                    const customer = await this.createCustomer(user, token);
                    customerId = customer.customer.id;
                    const updated = await services.CrudService.update(Customers, { _id: user._id }, { paypal_customer_id: customerId });
                }

                const response = await this.getCustomer(customerId);
                const result = this.formatCardsDetails(response);

                resolve({ success: true, code: 200, message: 'Card added successfully', data: result, payment_type: user.payment_type })

            }
            catch (err) {
                console.log('exception caught in braintree add card api   ', err);
                reject({ success: false, code: 400, message: 'Something wrong occurred. Please try again' });
            }
        })
    }

}

module.exports = BraintreeHelper;