const chats = require("../models/chats");
const userModel = require("../models/user");


async function addFriend(data) {
    try{
        const sender = await userModel.findOne({ userName: data.sender });
        const receiver = await userModel.findOne({ userName: data.receiver });
        if (receiver) {
            if(sender.friends.indexOf(receiver.userName)){
                await userModel.updateOne(
                { userName: data.receiver },
                { $addToSet: { friendsRequest: data.sender } }
                );
                const receiver = await userModel.findOne({ userName: data.receiver });
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
        { userName: data.sender }).updateOne(
            { },
            { $pull: { friendsRequest: data.receiver } }
        );
    await userModel.updateOne(
            { userName: data.sender },
            { $addToSet: { friends: data.receiver } }
    );
    await userModel.updateOne(
        { userName: data.receiver },
        { $addToSet: { friends: data.sender } }
    );
    const chat =  new chats({ users: [data.sender,data.receiver],chatOrder:[], chat:[] });
    chat.save();

    return {
        sender: await userModel.findOne({userName:data.sender}),
        receiver: await userModel.findOne({userName:data.receiver})
    } 
    


}
module.exports = {
  takeFriendReq: takeFriendReq,
  addFriend: addFriend,
  accept: accept
};

