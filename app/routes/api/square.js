const squareCtrl = require('../../controllers/square');
// const squareService = require('../../services/Squares');
// const productValidate = require('../../validations/products.validate');
const express = require('express');
const router = express.Router();

/*
 * Get product route
 */

router.get(
    '/list-locations',
    //   productValidate.getAllItems,
    squareCtrl.listLocations
);

/*
 * create Order route
 */

router.post(
    '/create-order',
    //   productValidate.getAllItems,
    squareCtrl.createOrder
);


/*
 * upsert catalog route
 */

router.post(
    '/upsert-catalog',
    //   productValidate.getAllItems,
    squareCtrl.createCatalog
);


/*
 * batch upsert catalog route
 */

router.post(
    '/batch-upsert-catalog',
    //   productValidate.getAllItems,
    squareCtrl.createBatchCatalog
);


/*
 * batch upsert catalog route
 */

router.post(
    '/migration-catalog',
    //   productValidate.getAllItems,
    squareCtrl.catalogMigration
);


/*
 * batch upsert catalog route
 */

router.post(
    '/remove-catalog',
    //   productValidate.getAllItems,
    squareCtrl.catalogRemoveItems
);



/*
 * batch upsert catalog route
 */

router.post(
    '/batch-upsert-catalog',
    //   productValidate.getAllItems,
    squareCtrl.createBatchCatalog
);


//categorys
/*
 * upsert catalog route
 */

router.post(
    '/create-category',
    //   productValidate.getAllItems,
    squareCtrl.addCategoryCatalog
);




module.exports = router;
