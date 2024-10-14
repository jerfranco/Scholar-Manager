const express = require('express');
const pasth = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config');
const cookieParser = require('cookie-parser');


const app = express();
// const PORT = process.env.PORT || 5000;

// app.listen (PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(function(req, res, next) {
    console.log(req.cookies);
    next();
});

// app.use(function(req, res, next) {
//     var cookie = req.cookies;
//     console.log(cookie);
// });
    

// app.use(express.static("public"));
app.use(express.static("images"));
app.use(express.static("styles"));
app.use(express.static("scripts"));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/index", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/finances", (req, res) => {
    res.render("finances");
});


app.post("/signup", async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            password: req.body.password
        };

        // Check if user already exists
        const existingUser = await collection.findOne({ name: data.name });
        if (existingUser) {
            return res.send("User already exists. Please choose a different username.");
        }

        // Hash the password and store it in the database
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        // Insert the new user data into the collection
        await collection.insertMany([data]);

        // Redirect to login page with a success message
        res.redirect('/login?success=Account created successfully! Please log in.');
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).send('An error occurred during signup. Please try again.');
    }
});


app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({name: req.body.username});
        if(!check) {
            res.send("User not found");
        }
        console.log(check);

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch) {
            res.cookie("userID", check._id.toString(), {maxAge: 100000000, httpOnly: true});
            res.render("index")
        }
        else {
            req.send("Invalid username or password");
        }
    }
    catch {
        console.error('Login error:', error);
        res.status(500).send('An error occurred during login. Please try again.');
    }
})

app.post("/logout", (req, res) => {
    res.clearCookie("userID");
    res.redirect("/index");
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});