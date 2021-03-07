const braintreeCtrl = require('../../controllers/braintree');
const paypalCtrl = require('../../controllers/paypal');

const paypalValidate = require('../../validations/paypal.validate');
const express = require('express');
const router = express.Router();


require('../../../config/passport');
const passport = require('passport');
const { authorizedCustomer } = require('../../middleware/utils');
const requireAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user) => {
        return await authorizedCustomer(req, res, next, err, user);
    })(req, res, next);
};


// /*
//  * Get product route
//  */
// router.get(
//     '/',
//     productValidate.getAllItems,
//     productCtrl.getAllItems
// );


router.post(
    '/create-payment',
    // isAuthorizedForPayment,
    paypalCtrl.createPayment
);

router.post(
    '/execute-payment',
    paypalCtrl.executePayment
)



// Braintree Api Routes---
router.post(
    '/generate/token',
    // isAuthorizedForPayment,
    braintreeCtrl.generateClientToken
);

router.post(
    '/add-card',
    // isAuthorizedForPayment,
    requireAuth,
    paypalValidate.createCard,
    braintreeCtrl.addCard
);

// router.get(
//     '/getCards',
//     // isAuthorizedForPayment,
//     braintreeCtrl.getCards
// );

// router.post(
//     '/changeCard',
//     // isAuthorizedForPayment,
//     braintreeCtrl.changeDefaultCard
// );

// router.post(
//     '/deleteCard',
//     // isAuthorizedForPayment,
//     braintreeCtrl.deleteCard
// );

// router.post(
//     '/changePaymentMethod',
//     // isAuthorizedForPayment,
//     braintreeCtrl.changePaymentMethod
// );

//----------


module.exports = router;
