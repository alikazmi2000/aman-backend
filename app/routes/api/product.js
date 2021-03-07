const productCtrl = require('../../controllers/product');
const productValidate = require('../../validations/products.validate');
const express = require('express');
const router = express.Router();

/*
 * Get product route
 */
router.get(
  '/',
  productValidate.getAllItems,
  productCtrl.getAllItems
);

router.get(
  '/search-autocomplete',
  productCtrl.getAutoCompleteSearch
);

router.get(
  '/:id',
  productValidate.getItem,
  productCtrl.getItem
);
router.get(
  '/related/:id',
  productValidate.relatedItems,
  productCtrl.relatedItems
);



/*
 * Get product availability route
 */
router.post(
  '/available',
  // trimRequest.all,
  productValidate.getProductAvailability,
  productCtrl.getProductAvailability
);


// /*
//  * Get product availability route
//  */
// router.post(
//   '/variation/available',
//   // trimRequest.all,
//   productValidate.getVariationAvailability,
//   productCtrl.getVariationAvailability
// );



/*
 * Get product availability route
 */
router.post(
  '/tax/verification',
  // trimRequest.all,
  productValidate.getTaxVerification,
  productCtrl.getTaxVerification
);

/*
 * Get product availability route
 */
router.post(
  '/shipping',
  // trimRequest.all,
  productValidate.getShippingInfo,
  productCtrl.getShippingInfo
);


// /*
//  * Get shipping route
//  */
// router.get(
//   '/shipping',
//   // trimRequest.all,
//   // productValidate.getShippingAndZoneInfo,
//   productCtrl.getShippingAndZoneInfo
// );



module.exports = router;
