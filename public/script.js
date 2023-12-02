const socket = io("http://localhost:3000");
// const socket = io("https://chatwithmongo-9adb3ba69bcd.herokuapp.com/");


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

function handleImageUpload() {
    var input = document.getElementById('fileInput');
    var imageArea = document.getElementById('image-area');
 
    // Clear existing images
    imageArea.innerHTML = '';
 
    var files = input.files;
    
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
 
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                // Create a div for each image
                var imageItem = document.createElement('div');
                imageItem.className = 'image-item';
                
                // Create an img element
                var img = document.createElement('img');
                img.alt = 'Uploaded Image';
                img.src = e.target.result;
                img.className = 'imageLoaded';
                $("#image-area").css(
                    {"display":"flex"}
                );
                $("#messages-box").css(
                    {"height" : "60%"}
                );
                // Create a button (SVG) to remove the image
                var closeButton = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                closeButton.setAttribute('class', 'x-button');
                closeButton.setAttribute('width', '15');
                closeButton.setAttribute('height', '15');
                closeButton.setAttribute('fill', 'currentColor');
                closeButton.setAttribute('viewBox', '0 0 17 17');

                var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute('d', 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z');
                
                closeButton.appendChild(path);
                
                // Add the img and closeButton to the imageItem
                imageItem.appendChild(img);
                imageItem.appendChild(closeButton);
 
                // Append the imageItem to the imageArea
                imageArea.appendChild(imageItem);
            };
            reader.readAsDataURL(file);
        }
    }
}

function getImageUrls() {
    let imageUrls = [];
    $('#image-area .image-item .imageLoaded').each(function () {
        imageUrls.push($(this).attr('src'));
    });
    return imageUrls;
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
      console.log(data);
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
    console.log(data);
    console.log(data.sender.userName == $("#currentFriendname").text());
    if(data.sender.userName == $("#currentFriendname").text()){
        $(".messages-box").html("");
        for(let i = 0 ; i < data.chatRoom.chatOrder.length;i++){
            if(data.chatRoom.chat[i].image[0]){
            if (data.chatRoom.chatOrder[i] == $("#userName").text()) {
                $(".messages-box").append(
                  "<div class='message-reverse'><div class='message-block-blue'>" +
                    data.chatRoom.chat[i].text + "<br><img class='image' src='"+ data.chatRoom.chat[i].image[0] +"'>"+
                    "</div></div>"
                );
                $(".messages-box").scrollTop(100000000000000);
              } else {
                $(".messages-box").append(
                  "<div class='message'><img class = 'avatar' src='" +
                    data.receiver.avatarUrl +
                    "'>" +
                    "<div class='message-block'>" +
                    data.chatRoom.chat[i].text + "<br><img class='image' src='"+ data.chatRoom.chat[i].image[0] +"'>"+
                    " </div></div>"
                );
                $(".messages-box").scrollTop(100000000000000);
              }
            }else{
                if (data.chatRoom.chatOrder[i] == $("#userName").text()) {
                    $(".messages-box").append(
                      "<div class='message-reverse'><div class='message-block-blue'>" +
                        data.chatRoom.chat[i].text +
                        "</div></div>"
                    );
                    $(".messages-box").scrollTop(100000000000000);
                  } else {
                    $(".messages-box").append(
                      "<div class='message'><img class = 'avatar' src='" +
                        data.receiver.avatarUrl +
                        "'>" +
                        "<div class='message-block'>" +
                        data.chatRoom.chat[i].text + 
                        " </div></div>"
                    );
                    $(".messages-box").scrollTop(100000000000000);
                  }
            }
        }

    }
    console.log(data.receiver.userName);
    $("#demoText"+data.sender.userName).text(data.chatRoom.chat[data.chatRoom.chat.length-1].text);
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
                if(data.chatRoom.chat[i].image[0]){
                    if (data.chatRoom.chatOrder[i] == $("#userName").text()) {
                        $(".messages-box").append(
                          "<div class='message-reverse'><div class='message-block-blue'>" +
                            data.chatRoom.chat[i].text+ "<br><img class='image' src='" + data.chatRoom.chat[i].image[0] +"'>"+
                            "</div></div>"
                        );
                        $(".messages-box").scrollTop(100000000000000);
                      } else {
                        $(".messages-box").append(
                          "<div class='message'><img class = 'avatar' src='" +
                            data.receiver.avatarUrl +
                            "'>" +
                            "<div class='message-block'>" +
                            data.chatRoom.chat[i].text+ "<br><img class='image' src='" + data.chatRoom.chat[i].image[0] +"'>"+
                            " </div></div>"
                        );
                        $(".messages-box").scrollTop(100000000000000);
                      }
                    }
                    else{
                        if (data.chatRoom.chatOrder[i] == $("#userName").text()) {
                            $(".messages-box").append(
                              "<div class='message-reverse'><div class='message-block-blue'>" +
                                data.chatRoom.chat[i].text+
                                "</div></div>"
                            );
                            $(".messages-box").scrollTop(100000000000000);
                          } else {
                            $(".messages-box").append(
                              "<div class='message'><img class = 'avatar' src='" +
                                data.receiver.avatarUrl +
                                "'>" +
                                "<div class='message-block'>" +
                                data.chatRoom.chat[i].text+
                                " </div></div>"
                            );
                            $(".messages-box").scrollTop(100000000000000);
                          }
                    }
                }
        
        });
socket.on("updateHeadName",(data)=>{
    console.log(data);
    $("#left-head-main").html(
        "<img id='currentFriendAvt' class='avatar' src='"+ data.avatarUrl +"' alt='friend'><span id='currentFriendname'>"+ data.userName +"</span>"
)});

socket.on("enterSendchat",(data)=>{
    console.log( data.image);
    if(data.image.length != 0){
        $(".messages-box").append(
            "<div class='message-reverse'><div class = 'message-block-blue'>" +
              data.text + "<br><img class='image' src='"+ data.image +"'>"+
              " </div></div>"
          );
    }else{
        $(".messages-box").append(
            "<div class='message-reverse'><div class = 'message-block-blue'>" +
              data.text +
              " </div></div>"
          );
    }
    
      $(".messages-box").scrollTop(100000000000000);
    
      $("#demoText"+data.receiverName).text("You: " + data.text);
      
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
            console.log($("#userName").text())
            console.log($("#search").val())
            socket.emit("addFriend", {
            senderName:$("#userName").text(),
            receiverName:$("#search").val()
            });
          return false;
        }
    });

    $("#friendReqBox").on('click',"#acceptBtn",()=>{
        console.log("button clicked");
        socket.emit("accept",{
            senderName:$("#userName").text(),
            receiverName:$("#requestName").text()
        });
        $("#friendReqBox").html("");
    });
    $("#friend-list").on('click',".friend",function(){
        console.log("button clicked");
        const receiverName = $(this).find(".friendName").text();
        $("#demoText"+ receiverName).css({
            "font-weight":"200",
            "font-size":"12px"
        });
        $("#newChatnoti"+receiverName).css({
            "display":"none"
        });
        socket.emit("friendchoose",{
            senderName:$("#userName").text(),
            receiverName: receiverName
        });
        
    });
    $("#chat-box").keypress(function (e){
        const key = e.which;
        if(key == 13){
            console.log("key pressed");
            const text = $("#chat-box").val();
            const senderName = $("#userName").text();
            let image = [];
            const receiverName = $("#currentFriendname").text();
            if ($('#image-area .image-item').length > 0) {
                image =  getImageUrls();
            }   
            if(receiverName == ""){
                alert("Please add friends and chat to them!");
            }
            else if(text == "" && image.length == 0){
                return false;
            }
            else{
                console.log($('#image-area .image-item').length);
                console.log(image);
                socket.emit("chat",{
                    senderName:senderName,
                    receiverName:receiverName,
                    text:text,
                    image:image
                });
                $('#image-area').html("");
                $("#image-area").css(
                    {"display" : "none"}
                );
                $("#messages-box").css(
                    {"height" : "80%"}
                )
                $("#chat-box").val("");
                e.preventDefault();
                return false;
            }
            }
    });
    $("#send-button").click(()=>{
        console.log("key pressed");
        const text = $("#chat-box").val();
        const senderName = $("#userName").text();
        const receiverName = $("#currentFriendname").text();
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
                senderName:senderName,
                receiverName:receiverName,
                text:text
            });
        $("#chat-box").val("");
        }
        
        return false;
    });


    

})
