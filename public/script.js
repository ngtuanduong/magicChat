// const socket = io("http://localhost:3000");
const socket = io("https://chatwithmongo-9adb3ba69bcd.herokuapp.com/");


function displayImage() {
    var input = document.getElementById('fileInput');
    var img = document.getElementById('selectedImage');
    
    var file = input.files[0];

    if (file) {
    var reader = new FileReader();

    reader.onload = function(e) {
        img.src = e.target.result;
        img.alt = reader.result.split(',')[1];
    };
    reader.readAsDataURL(file);
    }

}

socket.on("usernameExisted",(data)=>{
    alert("Username had been taken: " + data );
    $("#loadingSignup").hide();

})


socket.on("SignupSuccess",()=>{
    alert("Account created successfully!")
    $("#loadingSignup").hide();
});

socket.on("loginSuccess",(data)=>{
    $("#loadingLogin").hide();
    $("#chatForm").show(500);
    $("#loginPage").hide(500);
    $("#userName").html(data.userName);
    $("#userAvatar").attr('src',data.avatarUrl);
    socket.emit("takeFriendlist",$("#userName").text());
    socket.emit("takeFriendReq",$("#userName").text());



});
socket.on("wrongUsername",()=>{
    alert("Please check your username again");
    $("#loadingLogin").hide();
});
socket.on("wrongPassword",()=>{
    alert("Please check your password again");
    $("#loadingLogin").hide();
});
socket.on("selfAdd",()=>{
    alert("Don't try to add yourself!!!");  
})

socket.on("sendAddSuccess",()=>{
    alert("Send add friend successfully!")
});
socket.on("sendAddFailed",(data)=>{
    alert("There is no one have name: " + data)
});

socket.on("alreadyAdd",()=>{
    alert("You are already friend!");
});




socket.on("sendFriendReq",(data)=>{
    $("#friendReqBox").html(
        "<span class='friendReqHeader'>Friend requests: "+ data.requests +"</span><div class='friendReq' ><div class='leftReq' ><img class='avatarFriend'  src='"+ data.firstReqUser.avatarUrl +"' ></div><div class='rightReq' ><span id='requestName'><b>"+ data.firstReqUser.userName +"</b></span><div class='reqButton' ><button type='button' class = ' reqBtn ' id='acceptBtn' >Accept</button><button type='button' class = ' reqBtn ' id='cancelBtn'>Cancel</button></div></div></div");
});
socket.on("sendAddFrriendtoFriend",(data)=>{
    $("#friendReqBox").html(
        "<span class='friendReqHeader'>Friend requests: "+ data.requests +"</span><div class='friendReq' ><div class='leftReq' ><img class='avatarFriend'  src='"+ data.firstReqUser.avatarUrl +"' ></div><div class='rightReq' ><span id='requestName'><b>"+ data.firstReqUser.userName +"</b></span><div class='reqButton' ><button type='button' class = ' reqBtn ' id='acceptBtn'>Accept</button><button type='button' class = ' reqBtn ' id='cancelBtn'>Cancel</button></div></div></div>");
});
socket.on("deleteFriendlist",()=>{
    $("#friend-list").html('');
});
socket.on("deleteFriendlistOther",(data)=>{
    alert(data + " accepted your addfriend request!")
    $("#friend-list").html('');
});
socket.on("sendFriendList",(data)=>{
    $("#friendLoading").show();
    setTimeout(function() {
        $("#friendLoading").hide();
      }, 1000);
    if(data[1].chat.length == 0){
        if(data[1].chatOrder[data[1].chatOrder.length -1] == $("#userName").text()){
            $("#friend-list").append(
                "<div class='friend'><img class='avatar' src='"+ data[0].avatarUrl +"' alt='friend'><div class='rightReq'><span class='friendName'>"+ data[0].userName +"</span><p class='demoText' id='"+ "demoText" + data[0].userName + "'>" + "</p></div><div class='newChatnoti' id='"+ "newChatnoti" + data[0].userName +"'></div></div>"
            )
        }else{
            $("#friend-list").append(
                "<div class='friend'><img class='avatar' src='"+ data[0].avatarUrl +"' alt='friend'><div class='rightReq'><span class='friendName'>"+ data[0].userName +"</span><p class='demoText' id='"+ "demoText" + data[0].userName + "'>" + "</p></div><div class='newChatnoti' id='"+ "newChatnoti" + data[0].userName +"'></div></div>"
            )
        }
    }
    else{
        if(data[1].chatOrder[data[1].chatOrder.length -1] == $("#userName").text()){
            $("#friend-list").append(
                "<div class='friend'><img class='avatar' src='"+ data[0].avatarUrl +"' alt='friend'><div class='rightReq'><span class='friendName'>"+ data[0].userName +"</span><p class='demoText' id='"+ "demoText" + data[0].userName +"'>"+ "You: " + data[1].chat[data[1].chat.length -1] +"</p></div><div class='newChatnoti' id='"+ "newChatnoti" + data[0].userName +"'></div></div>"
            )
        }else{
            $("#friend-list").append(
                "<div class='friend'><img class='avatar' src='"+ data[0].avatarUrl +"' alt='friend'><div class='rightReq'><span class='friendName'>"+ data[0].userName +"</span><p class='demoText' id='"+ "demoText" + data[0].userName +"'>"+ data[1].chat[data[1].chat.length -1] +"</p></div><div class='newChatnoti' id='"+ "newChatnoti" + data[0].userName +"'></div></div>"
            )
        }
    }
    
});

socket.on("sendChattoOther",(data)=>{
    if(data.sender.userName == $("#currentFriendname").text()){
        $(".messages-box").html("");
        for(let i = 0 ; i < data.chatRoom.chatOrder.length;i++){
                if (data.chatRoom.chatOrder[i] == $("#userName").text()) {
                    $(".messages-box").append(
                      "<div class='message-reverse'><span class = 'chatTextBlue'>" +
                        data.chatRoom.chat[i] +
                        " </span></div>"
                    );
                    $(".messages-box").scrollTop(100000000000000);
                  } else {
                    $(".messages-box").append(
                      "<div class='message'><img class = 'avatar' src='" +
                        data.sender.avatarUrl +
                        "'>" +
                        "<span class = 'chatText'>" +
                        data.chatRoom.chat[i] +
                        " </span></div>"
                    );
                    $(".messages-box").scrollTop(100000000000000);
                  }
        }

    }
    console.log(data.receiver.userName);
    $("#demoText"+data.sender.userName).text(data.chatRoom.chat[data.chatRoom.chat.length-1]);
    $("#demoText"+data.sender.userName).css({
        "font-weight":"bold",
        "font-size":"13px"
    });

    $("#newChatnoti"+data.sender.userName).css({
        "display":"block"
    });
    
    });
    socket.on("sendChat",(data)=>{
            $(".messages-box").html("");
            for(let i = 0 ; i < data.chatRoom.chatOrder.length;i++){
                    if (data.chatRoom.chatOrder[i] == $("#userName").text()) {
                        $(".messages-box").append(
                          "<div class='message-reverse'><div class='message-block><span class = 'chatTextBlue'>" +
                            data.chatRoom.chat[i] +
                            " </span></div></div>"
                        );
                        $(".messages-box").scrollTop(100000000000000);
                      } else {
                        $(".messages-box").append(
                          "<div class='message'><img class = 'avatar' src='" +
                            data.receiver.avatarUrl +
                            "'>" +
                            "<div class='message-block'><span class = 'chatText'>" +
                            data.chatRoom.chat[i] +
                            " </span></div></div>"
                        );
                        $(".messages-box").scrollTop(100000000000000);
                      }
                }
        
        });
socket.on("updateHeadName",(data)=>{
    console.log(data);
    $("#left-head-main").html(
        "<img id='currentFriendAvt' class='avatar' src='"+ data.avatarUrl +"' alt='friend'><span id='currentFriendname'>"+ data.userName +"</span>"
)});

socket.on("enterSendchat",(data)=>{
    $(".messages-box").append(
        "<div class='message-reverse'><span class = 'chatTextBlue'>" +
          data.text +
          " </span></div>"
      );
      $(".messages-box").scrollTop(100000000000000);
    
      $("#demoText"+data.receiver).text("You: " + data.text);
});


$(document).ready(function(){
    $("#friendLoading").hide()
    $("#loadingSignup").hide();
    $("#btnSignup").click(()=>{
        const userName = $("#userNameSignup").val();
        console.log($("#userNameSignup").val());
        const password = $("#passwordSignup").val();
        console.log($("#passwordSignup").val());
        const passwordConfirm = $("#passwordConfirmSignup").val();
        console.log($("#passwordConfirmSignup").val());
        const avatarData = $("#selectedImage").attr('alt');
        if(password !== passwordConfirm || userName == "" || password == ""|| passwordConfirm == "" || avatarData == "" ){
            alert("Password correction false!")
        }
        else{
            socket.emit("client-send-signUp",{userName:userName,password:password,avatarData:avatarData,friend:[]});
            $("#loadingSignup").show();
        }
    });


    $("#chatForm").hide();
    $("#loadingLogin").hide();
    $("#btnLogin").click(()=>{
        const userName = $("#userNameLogin").val();
        const password = $("#passwordLogin").val();
        if(password == ""){
            alert("Please enter your password!")
        }else if(userName == ""){
            alert("Please enter your userName!")
        }
        else{
            socket.emit("client-send-login",{userName:userName,password:password});
            $("#loadingLogin").show();
        }       
    });

    $("#logOutButton").click(()=>{
        location.reload();
        
    })

    


    $("#search").keypress(function (e) {
        var key = e.which;
        if (key == 13) {
            // the enter key code
            socket.emit("addFriend", {
            sender:$("#userName").text(),
            receiver:$("#search").val()
            });
          return false;
        }
    });

    $("#friendReqBox").on('click',"#acceptBtn",()=>{
        console.log("button clicked");
        socket.emit("accept",{
            sender:$("#userName").text(),
            receiver:$("#requestName").text()
        });
        $("#friendReqBox").html("");
    });
    $("#friend-list").on('click',".friend",function(){
        console.log("button clicked");
        const receiver = $(this).find(".friendName").text();
        $("#demoText"+ receiver).css({
            "font-weight":"200",
            "font-size":"12px"
        });
        $("#newChatnoti"+receiver).css({
            "display":"none"
        });
        socket.emit("friendchoose",{
            sender:$("#userName").text(),
            receiver: receiver
        });
        
    });
    $("#chat-box").keypress(function (e){
        const key = e.which;
        if(key == 13){
            console.log("key pressed");
            const text = $("#chat-box").val();
            const sender = $("#userName").text();
            const receiver = $("#currentFriendname").text();
            if(receiver == ""){
                alert("Please add friends and chat to them!");
            }
            else if(text == ""){
                return false;
            }
            else{
                console.log(sender);
                console.log(receiver);
                socket.emit("chat",{
                    sender:sender,
                    receiver:receiver,
                    text:text
                });
            $("#chat-box").val("");
            }
            e.preventDefault();
            return false;
        }
    });
    $("#send-button").click(()=>{
        console.log("key pressed");
        const text = $("#chat-box").val();
        const sender = $("#userName").text();
        const receiver = $("#currentFriendname").text();
        if(receiver == ""){
            alert("Please add friends and chat to them!");
        }
        else if(text == ""){
            return false;
        }
        else{
            console.log(sender);
            console.log(receiver);
            socket.emit("chat",{
                sender:sender,
                receiver:receiver,
                text:text
            });
        $("#chat-box").val("");
        }
        
        return false;
    });


    

})
