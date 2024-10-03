const mongoose = require('mongoose');
const connect = mongoose.connect('mongodb+srv://MrAdoboMan:waFJTryUqCQUbcwn@scholarmanagercluster.6ucrp.mongodb.net/');


connect.then(() => {
    console.log("Database connected successfully");
})
.catch(() => {
    console.log("Database cannot be connected");
});


const LoginScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const collection = new mongoose.model("Users", LoginScheme);

module.exports = collection;
