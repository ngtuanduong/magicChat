const express = require('express');
const app = express();
const userModel = require('./models/user'); 
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const signUp = require('./modules/signup');
const login = require('./modules/login');
const mongodb = require('./modules/mongo');
const addFriend = require('./modules/addFriend');
const chats = require('./models/chats');
const updateChat = require('./modules/updateChat');




cloudinary.config({ 
    cloud_name: 'dvxjor75z', 
    api_key: '251248981277238', 
    api_secret: '7FyMgpt5T0HG4byhpnzATjl-tVo' 
});


// const mongoose = require('mongoose');
// const uri = "mongodb+srv://duo11:duo11@cluster0.ywlit7z.mongodb.net/chat?retryWrites=true&w=majority";

// async function connect(){
//     try{
//         await mongoose.connect(uri);
//         console.log("Connected to mongodb");
//     }catch(error){
//         console.log(error);
//     }
// }
// connect();





app.use(express.static("public"));  

app.set('view engine','ejs');
app.set("views", "./views");


const http = require('http').Server(app);
const io = require('socket.io')(http);
http.listen(process.env.PORT || 3000,()=>{    
    console.log("server start on port 3000")});
// app.listen(3000,()=>{
//     console.log("server start on port 3000");
// })




io.on('connection',function(socket){
    socket.on("client-send-signUp",async (data)=>{
        try{
            const result = await signUp.signUp(data);
            console.log("SignUp Request Success");
            if(result) socket.emit("usernameExisted",data.userName);
            else socket.emit('SignupSuccess');
        }
        catch(error){
            console.error(error);
        }
    });
    socket.on("client-send-login",async (data)=>{
        try{
            socket.userName = data.userName;
            const result = await login.login({data:data,socketId:socket.id});           
            if(result == "wrongUsername"){
                socket.emit("wrongUsername");
            }else if(result){
                socket.emit("loginSuccess",result);
            }
            else{
                socket.emit("wrongPassword");
            }
        }catch(error){
            console.error(error);
        }
    });

    socket.on("addFriend",async (data)=>{
        if(data.senderName == data.receiverName){
            socket.emit("selfAdd");
        }
        else{
            const result = await addFriend.addFriend(data);
            console.log(result);
            if(typeof result == 'object'){
                socket.emit("sendAddSuccess"),
                socket.to(result.receiver.id).emit("sendAddFrriendtoFriend",{requests:result.receiver.friendsRequest.length,firstReqUser:result.firstReqUser});
            }
            else if(result){
                socket.emit("alreadyAdd");
            }else{
                socket.emit("sendAddFailed",data.receiverName);
            }
        }
    });
    async function takeFriendReq (data){ //data:senderName
        try{
            const result = await addFriend.takeFriendReq(data);
            if(result){
                const currentUser = await userModel.findOne({userName:data});
                socket.emit("sendFriendReq",{requests:currentUser.friendsRequest.length,firstReqUser:result});
            }
        }catch(error){
            console.log(error);
        }
    }
    
    socket.on("takeFriendReq",(userName) => takeFriendReq(userName));
    async function takeFriendlist (userName){
        const currentUser = await userModel.findOne({userName:userName});
        for(let i = 0;i < currentUser.friends.length;i++){
            let chatRoom = await chats.findOne(
                {users:[userName ,currentUser.friends[i]]});
            if(!chatRoom){
                chatRoom = await chats.findOne(
                    {users:[currentUser.friends[i] ,userName]});
            }
            if(currentUser.id == socket.id){
                await socket.emit("sendFriendList",[await userModel.findOne(
                    {userName:currentUser.friends[i]}),chatRoom]);
            }
            else{
                await socket.to(currentUser.id).emit("sendFriendList",[await userModel.findOne(
                    {userName:currentUser.friends[i]}),chatRoom]);
            }
        }
    }

    socket.on("takeFriendlist",(data)=> takeFriendlist (data));


    socket.on("accept",async (data)=>{ //data:senderName,receiverName
        try{
            const bothUser =await addFriend.accept(data);
            socket.emit("deleteFriendlist");
            await takeFriendlist(bothUser.sender.userName);
            socket.to(bothUser.receiver.id).emit("deleteFriendlistOther",data.senderName);
            await takeFriendlist(bothUser.receiver.userName);
            await takeFriendReq(data.senderName);
        }catch(error){
            console.error(error);
        }
    });

    socket.on("friendchoose",async (data)=>{
        let chatRoom = await chats.findOne(
            {users:[data.senderName ,data.receiverName]});
        if(!chatRoom){
            chatRoom = await chats.findOne(
                {users:[data.receiverName ,data.senderName]});
        }
        const receiver = await userModel.findOne({userName:data.receiverName})
        socket.emit("updateHeadName",receiver);
        socket.emit("sendChat",{receiver:receiver,chatRoom:chatRoom});
        
    });
    socket.on("chat",async (data)=>{
        console.log(data.image);
        socket.emit("enterSendchat",{receiverName:data.receiverName,text:data.text,image:data.image});
        const result = await updateChat.updateChat(data);
        console.log("result: " +result.sender);
        console.log("result: " +result.receiver);
        console.log("result: " +result.chatRoom);
        socket.to(result.receiver.id).emit("sendChattoOther",result);
        
    });
    socket.on("");

 

});

app.get('/',(req,res)=>{
    res.render("login");
});
app.get('/sign-up',(req,res)=>{
    res.render("signup");
});
