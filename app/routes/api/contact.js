const ContactCtrl = require('../../controllers/contact');
const express = require('express');
const router = express.Router();
const contactValidate = require('../../validations/contact.validate');
const trimRequest = require('trim-request');


router.post(
    '/',
    //requireAuth,
    //userCtrl.roleAuthorization([Roles.Admin]),
    trimRequest.all,
    contactValidate.createItem,
    ContactCtrl.createItem
  );



module.exports = router;
