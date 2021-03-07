const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const validator = require('validator');

const UserAccessSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      validate: { validator: validator.isEmail, message: 'EMAIL_IS_NOT_VALID' },
      lowercase: true,
      required: true
    }, // Email Address of the User
    ip: { type: String, required: true }, // IP Address of the User
    browser: { type: String, required: true }, // Browser of the User
    country: { type: String, required: true } // Country of the User
  },
  {
    versionKey: false,
    timestamps: true
  }
);
UserAccessSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('UserAccess', UserAccessSchema);
