'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');


const DeviceSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    usage:{
        type:[String],
        required:true
    }
});

const UserSchema = new Schema({
    username:{
        type:String,
        index: true,
        unique: true,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    devices:{
        type:[DeviceSchema],
        required:true
    }
});

/* Will add checks that unique and required are true on adds */
UserSchema.plugin(uniqueValidator);
DeviceSchema.plugin(uniqueValidator);
var UserModel = mongoose.model("UserModel", UserSchema);
var DeviceModel = mongoose.model("DeviceModel", DeviceSchema);

module.exports = {UserModel, DeviceModel};
