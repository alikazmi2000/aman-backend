const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseDelete = require('mongoose-delete');
const { Roles, Status } = require('../enums');
const { address } = require('../middleware/db');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true }, // First Name of the User
    last_name: { type: String, required: true }, // Last Name of the User
    email: {
      type: String,
      validate: { validator: validator.isEmail, message: 'EMAIL_IS_NOT_VALID' },
      lowercase: true,
    }, // Email Address of the User
    is_email_verified: { type: Boolean, default: false }, // Either Email is verified or not
    password: { type: String, required: true }, // Password of the User's Account
    country_code: String, // Country Code of User's Phone Number
    phone: String, // User's Phone Number
    phone_number: String, // User's Phone Number
    profile_picture: String, // User's Profile Picture File Name
    role: { type: String, enum: Object.values(Roles) }, // User's Role admin etc
    stripe_customer_id: String, // Stripe Customer Id Used for the Customers for the credit cards and payment deductions
    stripe_connected_account_id: String, // Stripe Connect Account Id Used for the Providers for the bank accounts and payment transfer
    email_confirmation_code: String, // Email Confirmation Code to Verify Email Address
    email_confirmation_code_expiry: Date, // Email Confirmation Code Expiry when requested to Verify Email Address
    is_verified: Boolean, // Is User Verified - Future Use
    login_attempts: { type: Number, default: 0 }, // Login Attempts by the User
    block_expires: { type: Date, default: Date.now }, // Temporary Block Account after too many attempts
    enable_notifications: { type: Boolean, default: true }, // Is Notification Enable or not - Future Use
    socket_id: String, // User's Socket Id
    access_token: String, // JWT Access token that is required to authentication
    access_token_expiration: String, // JWT Access token expiry
    status: { type: String, enum: Object.values(Status) } // Status of the User active, inactive, blocked etc
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

UserSchema.pre('save', function(next) {
  const that = this;
  const SALT_FACTOR = 5;
  if (!that.isModified('password')) {
    return next();
  }
  return genSalt(that, SALT_FACTOR, next);
});

UserSchema.pre('update', function(next) {
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

UserSchema.methods.comparePassword = function(passwordAttempt, cb) {
  bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
    err ? cb(err) : cb(null, isMatch)
  );
};

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('User', UserSchema);
