var mongoose = require('mongoose');
var schema = mongoose.Schema;

var userKeys = new schema({
    email: {
        type:String
    },
    password: {
        type:String
    },
    confirmPassword: {
        type:String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    userName: {
        type:String
    },
    otp:{
        type:Number
    },
    otpTime:{
        type:Number
    },
    userToken:{
        type:String
    },
    secretBase32:{
        type:String
    },
    otpVerification:{
        type:Boolean,
        default:false
    },
    emailVerification:{
        type:Boolean,
        default:false
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
    userType: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    },



},
{
    timestamps: true
});

module.exports = mongoose.model("user", userKeys)