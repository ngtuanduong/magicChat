const userModel = require('../models/user'); 
const fs = require('fs');
const cloudinary = require('./cloudinary');

async function signUp (data){
    try{
        const userChecked = await userModel.findOne({userName:data.userName});               
        if (userChecked) {
            return true;
        }
        else {
            const fileName = `${Date.now()}_image.png`;
            fs.writeFileSync(fileName, data.avatarData, 'base64');
            const cloudinaryResponse = await cloudinary.uploader.upload(fileName);
            const user =  new userModel({userName:data.userName,password:data.password,avatarUrl:cloudinaryResponse.secure_url,friend:data.friend});
            user.save();
            fs.unlinkSync(fileName);
            return false;
        }
    }catch(error){
        console.error(error);
    }
    
}

module.exports = {
    signUp : signUp
}
