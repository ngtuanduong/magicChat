const chats = require("../models/chats");
const userModel = require("../models/user");


async function addFriend(data) {
    try{
        const sender = await userModel.findOne({ userName: data.senderName });
        const receiver = await userModel.findOne({ userName: data.receiverName });
        if (receiver) {
            if(sender.friends.indexOf(receiver.userName)){
                await userModel.updateOne(
                { userName: data.receiverName },
                { $addToSet: { friendsRequest: data.senderName } }
                );
                const receiver = await userModel.findOne({ userName: data.receiverName });
                const firstReqUserName = receiver.friendsRequest[0];
                const firstReqUser = await userModel.findOne({
                userName: firstReqUserName,
                });
                return {
                receiver: receiver,
                firstReqUser: firstReqUser,
                };
            }
            else{
                return true ;
            }
        } else {
            return false;
        }
    }catch(error){
        console.error(error);
    }
}

async function takeFriendReq(data) {
    const sender = await userModel.findOne({ userName: data });
    const friReqOldest = await userModel.findOne({
    userName: sender.friendsRequest[0],
    });
    if (friReqOldest != null) {
        return friReqOldest;
    }
}

async function accept(data) {
    await userModel.findOne(
        { userName: data.senderName }).updateOne(
            { },
            { $pull: { friendsRequest: data.receiverName } }
        );
    await userModel.updateOne(
            { userName: data.senderName },
            { $addToSet: { friends: data.receiverName } }
    );
    await userModel.updateOne(
        { userName: data.receiverName },
        { $addToSet: { friends: data.senderName } }
    );
    const chat =  new chats({ users: [data.senderName,data.receiverName],chatOrder:[], chat:[] });
    chat.save();

    return {
        sender: await userModel.findOne({userName:data.senderName}),
        receiver: await userModel.findOne({userName:data.receiverName})
    } 
    


}
module.exports = {
  takeFriendReq: takeFriendReq,
  addFriend: addFriend,
  accept: accept
};

