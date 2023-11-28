const userModel = require("../models/user");

 
async function login(data){
    try{
        const userChecked = await userModel.findOne({userName:data.data.userName});
    if(!userChecked){
        return "wrongUsername";
    }
    else if(data.data.password == userChecked.password){
        await userModel.updateOne({userName:data.data.userName},{$set:{id:data.socketId}});
        return userChecked;
    }
    else{
        return "wrongPassword";
    }
    }catch(error){
        console.error(error);
    }
    
}

module.exports = {
    login:login
};