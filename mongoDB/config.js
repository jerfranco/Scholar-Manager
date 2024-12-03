require('dotenv').config();
// DB_PASSWORD = waFJTryUqCQUbcwn

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

// Updated Finance Schema with loan fields
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
    loanAmount: {  // New field to store loan amount
        type: Number,
        default: 0
    },
    interestRate: {  // New field to store interest rate
        type: Number,
        default: 0
    },
    income: {
        type: Number,
        default: 0
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

module.exports = {
    userModel,
    financeModel
};
