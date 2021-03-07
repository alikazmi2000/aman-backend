const mongoose = require('mongoose');

const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseDelete = require('mongoose-delete');
const { Roles, Status } = require('../enums');
const { address } = require('../middleware/db');

const Schema = mongoose.Schema;

// - addAddress API parameters

const addressObject = Schema({
    address: { type: String },
    title: { type: String },
    floor: { type: String },//optional
    description: { type: String },  //optional
    loc: {
        type: [Number],  // [<longitude>, <latitude>]	
        index: '2d'      // create the geospatial index
    },
    is_selected: { type: Boolean, default: false }
});


const billing = Schema({
    first_name: { type: String },
    last_name: { type: String },
    company: { type: String },
    address_1: { type: String },
    address_2: { type: String },
    city: { type: String },
    state: { type: String },
    zip_code: { type: String },
    country: {
        code:{type :String},
        name:{type:String}
     },
    email: { type: String },
    phone: { type: String }
});

const shipping = Schema({
    first_name: { type: String },
    last_name: { type: String },
    company: { type: String },
    address_1: { type: String },
    address_2: { type: String },
    city: { type: String },
    state: { type: String },
    zip_code: { type: String },
    country: {
        code:{type :String},
        name:{type:String}
     },


});


const CustomerSchema = new mongoose.Schema({
    first_name: { type: String, required: true }, // First Name of the User
    last_name: { type: String, required: true }, // Last Name of the User
    phone: { index: true, type: String },
    country_code: { type: String },
    email: { index: true, type: String },
    password: { type: String },
    img: { type: String },
    token: { type: String },
    address: [addressObject],
    reg_id: { type: String },
    device_type: { type: String },
    phone_verification_code: { type: String },
    is_blocked: { type: Boolean, default: false },
    is_phone_verified: { type: Boolean, default: false },
    stripe_customer_id: String, // Stripe Customer Id Used for the Customers for the credit cards and payment deductions
    is_email_verified: { type: Boolean, default: false }, // Either Email is verified or not
    email_confirmation_code: String, // Email Confirmation Code to Verify Email Address
    email_confirmation_code_expiry: Date, // Email Confirmation Code Expiry when requested to Verify Email Address
    loc: {
        type: [Number],  // [<longitude>, <latitude>]	
        index: '2dsphere'      // create the geospatial index
    },
    paypal_customer_id: String,
    socket_id: String, // User's Socket Id
    access_token: String, // JWT Access token that is required to authentication
    access_token_expiration: String, // JWT Access token expiry
    billing: billing,
    shipping: shipping
},
    {
        versionKey: false,
        timestamps: true
    }
);


const hash = (user, salt, next) => {
    bcrypt.hash(user.password, salt, null, (error, newHash) => {
        if (error) {
            return next(error);
        }
        user.password = newHash;
        return next();
    });
};

const genSalt = (user, SALT_FACTOR, next) => {
    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
        if (err) {
            return next(err);
        }
        return hash(user, salt, next);
    });
};

CustomerSchema.pre('save', function (next) {
    const that = this;
    const SALT_FACTOR = 5;
    if (!that.isModified('password')) {
        return next();
    }
    return genSalt(that, SALT_FACTOR, next);
});

CustomerSchema.pre('update', function (next) {
    // var user = this.getUpdate().$set.password
    const user = this.getUpdate();
    bcrypt.genSalt(5, (err, salt) => {
        if (err) {
            return next(err);
        }

        return bcrypt.hash(user.$set.password, salt, null, (error, newHash) => {
            if (error) {
                return false;
            }
            user.$set.password = newHash;
            this.update({}, { $set: { password: user.$set.password } });
            return next();
        });
    });
});

CustomerSchema.methods.comparePassword = function (passwordAttempt, cb) {
    bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
        err ? cb(err) : cb(null, isMatch)
    );
};


CustomerSchema.methods.comparePassword = function (passwordAttempt, cb) {
    bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
        err ? cb(err) : cb(null, isMatch)
    );
};



CustomerSchema.plugin(mongoosePaginate);
CustomerSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('Customers', CustomerSchema);