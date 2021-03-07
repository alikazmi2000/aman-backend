const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseDelete = require('mongoose-delete');

const Schema = new mongoose.Schema({
    // name: String,
    // country: String,
    // state: String,
    // zip_code: [{ type: String }],
    // shipping_fee: Number,
    // shipping_name: String,
    // order: String,



    shiping_zone_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shipping'
    },
    wp_id: String, 
    instance_id : Number, 
    title : String,
    order : Number, 
    enabled : Boolean, 
    method_id : String,
    method_title : String,
    method_description : String,
    settings : {
        title : {
            id : String,
            label : String,
            description : String,
            type : String,
            value : String,
            default : String,
            tip : String,
            placeholder : String,
        }, 
        tax_status : {
            id :String,
            label :String,
            description :String,
            type :String,
            value :String,
            default :String,
            tip :String,
            placeholder :String,
            options : {
                taxable :String,
                none :String
            }
        }, 
        cost: {
            id :String,
            label :String,
            description :String,
            type :String,
            value :String,
            default :String,
            tip :String,
            placeholder :String
        }
        
    }
    
});

Schema.plugin(mongoosePaginate);
Schema.plugin(mongooseDelete, { overrideMethods: true });
module.exports = mongoose.model('shipping_zone_methods', Schema);
