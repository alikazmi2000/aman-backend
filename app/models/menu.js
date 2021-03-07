const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const { Status } = require('../enums');
const Schema = mongoose.Schema;

const option = [{
  label: { type: String, required: true },
  slug: { type: String }
}]

const MenuSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // Menu Name
    slug: { type: String, required: true }, // URL End point
    child: option
  },
  {
    versionKey: false,
    timestamps: true
  }
);
MenuSchema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('Menu', MenuSchema);
