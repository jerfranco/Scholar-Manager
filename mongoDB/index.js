const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const { userModel, financeModel } = require('./config');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.use(cookieParser());

app.use(function(req, res, next) {
    console.log(req.cookies);
    next();
});

app.use(express.static("images"));
app.use(express.static("styles"));
app.use(express.static("scripts"));

app.get("/", (req, res) => {
    const loggedIn = !!req.cookies.userID;
    res.render("index", { loggedIn });
});

app.get("/about", (req, res) => {
    const loggedIn = !!req.cookies.userID;
    res.render("about", { loggedIn });
});

app.get("/index", (req, res) => {
    const loggedIn = !!req.cookies.userID;
    res.render("index", { loggedIn });
});

app.get("/login", (req, res) => {
    const loggedIn = !!req.cookies.userID;
    res.render("login", { loggedIn });
});

app.get("/signup", (req, res) => {
    const loggedIn = !!req.cookies.userID;
    res.render("signup", { loggedIn });
});

app.post("/signup", async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            password: req.body.password
        };

        // Check if user already exists
        const existingUser = await userModel.findOne({ name: data.name });
        if (existingUser) {
            return res.send("User already exists. Please choose a different username.");
        }

        // Hash the password and store it in the database
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        // Insert the new user data into the collection
        await userModel.insertMany([data]);

        // Redirect to login page with a success message
        res.redirect('/login?success=Account created successfully! Please log in.');
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).send('An error occurred during signup. Please try again.');
    }
});

app.post("/login", async (req, res) => {
    try {
        const check = await userModel.findOne({name: req.body.username});
        if (!check) {
            return res.send("User not found");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            // res.cookie("userID", check._id.toString(), { maxAge: 100000000, httpOnly: true });
            res.cookie("userID", check._id.toString(), { httpOnly: true });
            // res.render("index");
            res.redirect("/index");
        } else {
            res.send("Invalid username or password");
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('An error occurred during login. Please try again.');
    }
});

app.get("/finances", async (req, res) => {
    try {
        const userId = req.cookies.userID; // Get userId from cookies
        const loggedIn = !!userId;

        if (!userId) {
            return res.status(401).send("User not logged in.");
        }

        // Query the finance model to find the finance record by userId
        const userFinance = await financeModel.findOne({ userId });

        // If no record is found, set balance to 0
        const balance = userFinance ? userFinance.balance : 0;

        const loanAmount = userFinance ? userFinance.loanAmount : 0;
        const interestRate = userFinance ? userFinance.interestRate : 0;
        const currentLoan = loanAmount * (1 + interestRate / 100);

        const incomeAmount = userFinance ? userFinance.income : 0;

        // Render the finances page and pass the balance to the template
        res.render("finances", { balance, currentLoan, incomeAmount, loggedIn });
    } catch (error) {
        console.error('Error fetching finance data:', error);
        res.status(500).send('An error occurred while fetching finance data.');
    }
});

// app.post("/finances", async (req, res) => {
//     try {
//         // const { balance, transactionAmount } = req.body;
//         const balance = parseFloat(req.body.balance) || 0;
//         const loan = parseFloat(req.body.loan) || 0;
//         const interest = parseFloat(req.body.interest) || 0;
//         const income = parseFloat(req.body.income) || 0;
//         const userId = req.cookies.userID;

//         if (!userId) {
//             return res.status(401).send("User not logged in.");
//         }

//         //! Create or update a finance record for the logged-in user
//         let userFinance = await financeModel.findOne({ userId });

//         if (userFinance) {
//             //! Update existing finance record
//             // userFinance.balance = balance;
//             // userFinance.transactions.push({ amount: transactionAmount });
//             if (!isNaN(balance)) userFinance.balance = balance;
//             userFinance.loanAmount = loan;
//             userFinance.interestRate = interest;
//             userFinance.income = income;
//         } else {
//             //! Create new finance record
//             // userFinance = new financeModel({
//             //     userId,
//             //     balance,
//             //     transactions: [{ amount: transactionAmount }]
                
//             // });
//             userFinance = new financeModel({
//                 userId,
//                 balance: balance || 0,
//                 loanAmount: loan,
//                 interestRate: interest,
//                 income: income
//             });
//         }

//         await userFinance.save();

//         //! Redirect back to the finances page after saving
//         res.redirect("/finances");
//     } catch (error) {
//         console.error('Finance error:', error);
//         res.status(500).send('An error occurred while saving finance data.');
//     }
// });

app.post("/finances", async (req, res) => {
    try {
        const userId = req.cookies.userID;
        if (!userId) {
            return res.status(401).send("User not logged in.");
        }

        // Find the user's finance record
        let userFinance = await financeModel.findOne({ userId });

        if (!userFinance) {
            userFinance = new financeModel({ userId });
        }

        // Check which form was submitted and update only relevant fields
        if (req.body.formType === 'balanceForm') {
            const balance = parseFloat(req.body.balance);
            if (!isNaN(balance)) userFinance.balance = balance;
        } else if (req.body.formType === 'loanForm') {
            const loan = parseFloat(req.body.loan) || 0;
            const interest = parseFloat(req.body.interest) || 0;
            userFinance.loanAmount = loan;
            userFinance.interestRate = interest;
        } else if (req.body.formType === 'incomeForm') {
            const income = parseFloat(req.body.income) || 0;
            userFinance.income = income;
        }

        await userFinance.save();

        // Redirect back to the finances page after saving
        res.redirect("/finances");
    } catch (error) {
        console.error('Finance error:', error);
        res.status(500).send('An error occurred while saving finance data.');
    }
});


app.post("/logout", (req, res) => {
    res.clearCookie("userID");
    res.redirect("/index");
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
