require('dotenv').config();

const mongoose = require('mongoose');
const dbUsername = 'MrAdoboMan';
const dbPassword = process.env.DB_PASSWORD;
const dbCluster = 'scholarmanagercluster.6ucrp.mongodb.net';
const uri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbCluster}/`;

const connect = mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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


