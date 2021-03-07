const faker = require('faker');
const { Status, Roles } = require('../../app/enums');
const { to24DigitObjectId, leadingObjectId } = require('../../helpers/mocks');
const ObjectID = require('mongodb').ObjectID;
const items = [
  {
    _id: new ObjectID(to24DigitObjectId(leadingObjectId.user, 0)),
    first_name: 'Ahmed',
    last_name: 'Admin',
    email: 'test@gmail.com',
    password: '$2a$05$ZrJ7kt//B1lGEqvt8hk8qePL5ZdcyrUsZ6egzpKyDUgZvKpvGmr7.',
    role: Roles.Admin,
    status: Status.Active,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    _id: new ObjectID(to24DigitObjectId(leadingObjectId.user, 1)),
    first_name: 'Ahmed',
    last_name: 'Seeker',
    country_code: '+1',
    phone_number: '3335421471',
    email: 'test+seeker@gmail.com',
    is_email_verified: true,
    password: '$2a$05$ZrJ7kt//B1lGEqvt8hk8qePL5ZdcyrUsZ6egzpKyDUgZvKpvGmr7.',
    role: Roles.Seeker,
    stripe_customer_id: 'cus_G8iwRvF1lr9v7C',
    status: Status.Active,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    _id: new ObjectID(to24DigitObjectId(leadingObjectId.user, 2)),
    first_name: 'Ahmed',
    last_name: 'Giver',
    country_code: '+1',
    phone_number: '3335421473',
    email: 'test+giver@gmail.com',
    is_email_verified: true,
    password: '$2a$05$ZrJ7kt//B1lGEqvt8hk8qePL5ZdcyrUsZ6egzpKyDUgZvKpvGmr7.',
    role: Roles.Giver,
    status: Status.Active,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },

];

module.exports = items;
