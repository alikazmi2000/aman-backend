const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

/*
 * ******** IMPORTANT NOTE *********
 * All of these fields can be updated by the admin from the backoffice except "companyId"
 */

const SettingSchema = new mongoose.Schema(
  {
    currency: { type: String, default: 'usd' }, // Used for the apps to display currency
    currencySymbol: { type: String, default: '$' }, // Used for the apps to display currency symbol
    cardsLimit: { type: Number, default: 5 }, // Used to limit the credit cards of the customers
    bankAccountsLimit: { type: Number, default: 1 }, // Used to limit the bank accounts of the providers
    propertiesLimit: { type: Number, default: 5 }, // Used to limit the properties of the customers
    becomeAProviderUrl: { type: String, default: process.env.DEFAULT_BECOME_A_PROVIDER_URL }, // Become a provider URL is used in the apps - profile screen
    becomeAManagerUrl: { type: String, default: process.env.DEFAULT_BECOME_A_MANAGER_URL }, // Become a manager URL is used in the apps - profile screen
    defaultDesignerEmail: { type: String, default: process.env.DEFAULT_DESIGNER_EMAIL }, // Email Address will used to send when designer needed for a job
    defaultBuyerEmail: { type: String, default: process.env.DEFAULT_BUYER_EMAIL }, // Email Address will used to send when buyer needed for a job
    termsAndConditionUrl: { type: String, default: process.env.TERMS_AND_CONDITION_URL }, // Terms and condition URL for the Apps
    privacyPolicyUrl: { type: String, default: process.env.PRIVACY_POLICY_URL }, // Privacy Policy URL for the Apps
    stripeTestPayment: { type: Boolean, default: true }, // It is important field once it would be disabled it means that system will use production stripe key in staging environment otherwise it will use development stripe key for testing
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' } // This would be used in the future for cloud SAAS
  },
  {
    versionKey: false,
    timestamps: true
  }
);

SettingSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('Setting', SettingSchema);
