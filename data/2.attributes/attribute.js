const faker = require('faker');
const { Status, Roles } = require('../../app/enums');
const { to24DigitObjectId, leadingObjectId } = require('../../helpers/mocks');
const ObjectID = require('mongodb').ObjectID;
const items = [
  {
    _id: new ObjectID(to24DigitObjectId(leadingObjectId.user, 0)),
    name : "kurtis-size",
    options : [ 
          "small", 
          "medium", 
          "large"
      ],
    status : "active"
  },
 
];

module.exports = items;
