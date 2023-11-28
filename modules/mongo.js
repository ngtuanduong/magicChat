
const mongoose = require('mongoose');

const uri = "mongodb+srv://duo11:duo11@cluster0.ywlit7z.mongodb.net/chat?retryWrites=true&w=majority";


async function connect(){
    try{
        await mongoose.connect(uri);
        console.log("Connected to mongodb");
    }catch(error){
        console.log('error');
    }
}
 connect();

module.exports = connect();