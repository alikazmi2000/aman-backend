const faker = require('faker');
const { Status, Roles } = require('../../app/enums');
const { to24DigitObjectId, leadingObjectId } = require('../../helpers/mocks');
const ObjectID = require('mongodb').ObjectID;
const items = [
  {
    _id: new ObjectID(to24DigitObjectId(leadingObjectId.user, 0)),
    first_name: 'Ahmed',
    last_name: 'Admin',
    email: 'devtest@gmail.com',
    password: '$2a$05$ZrJ7kt//B1lGEqvt8hk8qePL5ZdcyrUsZ6egzpKyDUgZvKpvGmr7.',
    role: Roles.Admin,
    status: Status.Active,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    _id: new ObjectID(to24DigitObjectId(leadingObjectId.user, 3)),
    first_name: 'Demo',
    last_name: 'Admin',
    email: 'demoAdmin@gmail.com',
    password: '$2a$05$ZrJ7kt//B1lGEqvt8hk8qePL5ZdcyrUsZ6egzpKyDUgZvKpvGmr7.',
    role: Roles.Admin,
    status: Status.Active,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  

];

module.exports = items;
