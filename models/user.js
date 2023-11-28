const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    id:{type:String},
    userName:{type:String,required:true},
    password:{type:String,required:true},
    avatarUrl:{type:String,requied:true},
    friends:{type:Array},
    friendsRequest:{type:Array},
    chat:{type:Object}
})



module.exports = mongoose.model('user',userSchema);