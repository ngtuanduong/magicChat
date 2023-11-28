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
        if(data.sender == data.receiver){
            socket.emit("selfAdd");
        }
        else{
            const result = await addFriend.addFriend(data);
            if(typeof result == 'object'){
                socket.emit("sendAddSuccess"),
                socket.to(result.receiver.id).emit("sendAddFrriendtoFriend",{requests:result.receiver.friendsRequest.length,firstReqUser:result.firstReqUser});
            }
            else if(result){
                socket.emit("alreadyAdd");
            }else{
                socket.emit("sendAddFailed",data.receiver);
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
    socket.on("takeFriendReq",(data) => takeFriendReq(data));
    async function takeFriendlist (data){
        const currentUser = await userModel.findOne({userName:data});
        
        
        for(let i = 0;i < currentUser.friends.length;i++){
            let chatRoom = await chats.findOne(
                {users:[data ,currentUser.friends[i]]});
            if(!chatRoom){
                chatRoom = await chats.findOne(
                    {users:[currentUser.friends[i] ,data]});
            }
            await socket.emit("sendFriendList",[await userModel.findOne(
                {userName:currentUser.friends[i]}),chatRoom]);
        }
    }

    socket.on("takeFriendlist",(data)=> takeFriendlist (data));


    socket.on("accept",async (data)=>{ //data:senderName,receiverName
        try{
            const bothUser =await addFriend.accept(data);
            socket.emit("deleteFriendlist");
            for(let i = 0;i < bothUser.sender.friends.length;i++){
                await socket.emit("sendFriendList",await userModel.findOne(
                    {userName:bothUser.sender.friends[i]}));
            }
            socket.to(bothUser.receiver.id).emit("deleteFriendlistOther",data.sender);
            for(let i = 0;i < bothUser.sender.friends.length;i++){
                await socket.to(bothUser.receiver.id).emit("sendFriendList",await userModel.findOne(
                    {userName:bothUser.receiver.friends[i]}));
            }
            await takeFriendReq(data.sender);
        }catch(error){
            console.error(error);
        }
    });

    socket.on("friendchoose",async (data)=>{
        console.log(data);
        let chatRoom = await chats.findOne(
            {users:[data.sender ,data.receiver]});
        if(!chatRoom){
            chatRoom = await chats.findOne(
                {users:[data.receiver ,data.sender]});
        }
        const receiver = await userModel.findOne({userName:data.receiver})
        socket.emit("updateHeadName",receiver);
        socket.emit("sendChat",{receiver:receiver,chatRoom:chatRoom});
        
    });
    socket.on("chat",async (data)=>{
        socket.emit("enterSendchat",{receiver:data.receiver,text:data.text});


        let chatDocument = await chats.findOne({
            users: [data.sender , data.receiver]
          });
        if(!chatDocument){
            chatDocument = await chats.findOne({
                users: [data.receiver , data.sender]
              });
        }          
        if (chatDocument) {
        await chats.updateOne(
            { _id: chatDocument._id }, // Assuming you have an _id field for identifying the document
            { $push: { chat: data.text } }
        );
        await chats.updateOne(
            { _id: chatDocument._id }, // Assuming you have an _id field for identifying the document
            { $push: { chatOrder: data.sender} }
            );
        }
        let chatRoom = await chats.findOne(
            {users:[data.sender ,data.receiver]});
        if(!chatRoom){
            chatRoom = await chats.findOne(
                {users:[data.receiver ,data.sender]});
        }
        const receiver =  await userModel.findOne({userName:data.receiver});
        
        socket.to(receiver.id).emit("sendChattoOther",{sender:data.sender,receiver:receiver,chatRoom:chatRoom});
        
    });


});

app.get('/',(req,res)=>{
    res.render("login");
});
app.get('/sign-up',(req,res)=>{
    res.render("signup");
});
