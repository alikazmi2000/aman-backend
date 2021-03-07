const mongoose = require('mongoose');
const { Status } = require('../enums');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const UserCardSchema = new mongoose.Schema(
  {
    onModel: {
      type: String,
      required: true,
      enum: ['User', 'Customers']
    },
    userId: { type: Schema.Types.ObjectId, required: true, refPath: 'onModel' }, // User Id from User's or customers  Collection
    stripeCard: { type: String, required: true }, // Will get from the stripe response
    cardBrand: { type: String, required: true }, // Will get from the stripe response
    cardLastFour: { type: String, required: true }, // Will get from the stripe response
    isDefault: { type: Boolean, default: false }, // Is Default Card would be used for the transactions e.g. deduct amount
    status: { type: String, enum: Object.values(Status) } // Status for Future Use - active or inactive
  },
  {
    versionKey: false,
    timestamps: true
  }
);

UserCardSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('UserCard', UserCardSchema);
