
const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    users:{type:Array,required:true},
    chatOrder:{type:Array},
    chat:{type:Array}
})

module.exports = mongoose.model('chat',chatSchema);