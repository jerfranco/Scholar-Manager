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
            // return res.status(401).send("User not logged in.");
            return res.redirect("/login");
        }

        // Query the finance model to find the finance record by userId
        const userFinance = await financeModel.findOne({ userId });

        // If no record is found, set balance to 0
        const balance = userFinance ? userFinance.balance : 0;
        const loanAmount = userFinance && userFinance.loanAmount != null ? userFinance.loanAmount : 0;
        const interestRate = userFinance && userFinance.interestRate != null ? userFinance.interestRate : 0;
        const loanTerm = userFinance && userFinance.loanTerm != null ? userFinance.loanTerm : 0;


        // Calculate monthly payment
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTerm * 12;
        const monthlyPayment =
            loanAmount && interestRate && loanTerm
                ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                (Math.pow(1 + monthlyRate, numPayments) - 1)
                : 0;

        const incomeAmount = userFinance ? userFinance.income : 0;

        const userGoals = await goalModel.find({ userId });
        const userExpenses = userFinance ? userFinance.expenses : [];

        // Render the finances page and pass the balance to the template
        // res.render("finances", { balance, monthlyPayment, incomeAmount, loggedIn, goals: userGoals, expenses: userExpenses });
        res.render("finances", { 
            balance, 
            loanAmount,        // Add this
            interestRate,      // Add this
            loanTerm,          // Add this
            monthlyPayment, 
            incomeAmount, 
            loggedIn, 
            goals: userGoals, 
            expenses: userExpenses 
        });
            
    } catch (error) {
        console.error('Error fetching finance data:', error);
        res.status(500).send('An error occurred while fetching finance data.');
    }
});

app.post("/expenses", async (req, res) => {
    try {
        const userId = req.cookies.userID;
        if (!userId) {
            return res.redirect("/login");
        }

        const { description, amount } = req.body;
        const userFinance = await financeModel.findOne({ userId });

        if (!userFinance) {
            return res.status(404).send("Finance record not found.");
        }

        userFinance.expenses.push({ description, amount: parseFloat(amount) });
        await userFinance.save();

        res.redirect("/finances");
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).send('An error occurred while adding the expense.');
    }
});

app.post("/expenses/:expenseId/delete", async (req, res) => {
    try {
        const userId = req.cookies.userID;
        if (!userId) {
            return res.redirect("/login");
        }

        const userFinance = await financeModel.findOne({ userId });
        if (!userFinance) {
            return res.status(404).send("Finance record not found.");
        }

        userFinance.expenses = userFinance.expenses.filter(
            expense => expense._id.toString() !== req.params.expenseId
        );
        await userFinance.save();

        res.redirect("/finances");
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).send('An error occurred while deleting the expense.');
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
            // return res.status(401).send("User not logged in.");
            
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
            const term = parseInt(req.body.term) || 0;

            userFinance.loanAmount = loan;
            userFinance.interestRate = interest;
            userFinance.loanTerm = term;
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

const { goalModel } = require('./config'); // Ensure goalModel is exported from config.js

app.post('/goals', async (req, res) => {
    try {
        const userId = req.cookies.userID; // Get the user ID from the cookie
        if (!userId) {
            return res.redirect('/login');
        }

        const { description, dueDate } = req.body;

        // Create a new goal record
        const newGoal = new goalModel({
            userId,
            description,
            dueDate: dueDate || undefined, // Optional dueDate
        });

        await newGoal.save();

        // Redirect back to the finances page
        res.redirect('/finances');
    } catch (error) {
        console.error('Error saving goal:', error);
        res.status(500).send('An error occurred while saving the goal.');
    }
});

app.post('/goals/:goalId/complete', async (req, res) => {
    try {
        const userId = req.cookies.userID; // Get the user ID from the cookies
        if (!userId) {
            return res.redirect('/login');
        }

        const goalId = req.params.goalId;

        // Find and remove the goal by its ID
        await goalModel.findOneAndDelete({ _id: goalId, userId });

        // Redirect back to the finances page
        res.redirect('/finances');
    } catch (error) {
        console.error('Error marking goal as completed:', error);
        res.status(500).send('An error occurred while completing the goal.');
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
