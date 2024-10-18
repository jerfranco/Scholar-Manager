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


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

//! Finance Schema
const FinanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    transactions: [{
        amount: Number,
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

const userModel = new mongoose.model("Users", UserSchema);
const financeModel = new mongoose.model("Finance", FinanceSchema);

// module.exports = collection;
// module.exports = financeCollection;

module.exports = {
    userModel,
    financeModel
};


