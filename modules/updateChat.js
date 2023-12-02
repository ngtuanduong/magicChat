const userModel = require("../models/user");
const chats = require("../models/chats");

async function updateChat(data){
    try{
        
        console.log(data);
        let chatDocument = await chats.findOne({
            users: [data.senderName , data.receiverName]
          });
        if(!chatDocument){
            chatDocument = await chats.findOne({
                users: [data.receiverName , data.senderName]
              });
        }
        if (chatDocument) {
        await chats.updateOne(
            { _id: chatDocument._id }, // Assuming you have an _id field for identifying the document
            { $push: { chat: {text:data.text,image:data.image} } }
        );
        await chats.updateOne(
            { _id: chatDocument._id }, // Assuming you have an _id field for identifying the document
            { $push: { chatOrder: data.senderName} }
            );
        }
        let chatRoom = await chats.findOne(
            {users:[data.senderName ,data.receiverName]});
        if(!chatRoom){
            chatRoom = await chats.findOne(
                {users:[data.receiverName ,data.senderName]});
        }
        return{
            receiver : await userModel.findOne({userName:data.receiverName}),
            sender :  await userModel.findOne({userName:data.senderName}),
            chatRoom: chatRoom
        }
    }catch(error){
        console.log(error);
    }
    
}
module.exports = {
    updateChat:updateChat
}