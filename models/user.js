const mongoose = require('mongoose');

const userSchema= new mongoose.Schema({
    firstName:{
        type:String,
        required:[true,'First name is required']},
    lastName:{
        type:String,
    },
    email:{
        type:String,
        required:[true,'Email name is required'],
        unique:true
    },
    password:{
        type:String,
        required:[true,'Password name is required']
    },
    userType:{
        type:String,
        required:true,
        enum:['host','guest'],
        default:'guest'
    },
    favourites:[{
        type:String,
        ref:'Home'
    }]
})

module.exports=mongoose.model('User',userSchema);