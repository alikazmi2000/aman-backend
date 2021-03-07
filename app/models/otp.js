const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const OTPSchema = new mongoose.Schema(
  {
    // country_code: { type: String, required: true }, // User's Phone Number County Code
    phone: { type: String, required: true }, // User's Phone Number
    code: { type: String, required: true }, // OTP Code for verification
    expiry: { type: Date, required: true }, // OTP Code Expiry
    token: String, // Token Generated by the system to verify at signup after verification of OTP code
  },
  {
    versionKey: false,
    timestamps: true
  }
);

OTPSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('OTP', OTPSchema);
