const express = require('express');
const { Data, User } = require('../model/model');
const router = express.Router();
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();


// const localStorage = require('localStorage');
var cookieParser = require('cookie-parser');
//Post Method
let refreshTokens = []
router.use(cookieParser())



function validateToken1(req, res, next) {
    var token = req.cookies.auth;

    const secretKey = process.env.ACCESS_TOKEN_SECRET;

    jwt.verify(token, secretKey, (err, decodedToken) => {
        if (err) {
            return res.status(403).send("Invalid access token");
        }

        // extract the user ID from the decoded token
        const userId = decodedToken.user;
        if (!token) {
            return res.status(401).send("UNauthorized");

        }

        // attach the user ID to the request object
        req.userId = userId;
        console.log(req.userId)
        next(); // proceed to the next middleware or route handler
    });
}



router.post('/post', validateToken1, async (req, res) => {

    const { name, lat, long, user } = req.body;
    const data = new Data({
        name,
        lat,
        long,
        user
    });
    console.log("data", data)
    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
        console.log("data saved")
    }
    catch (error) {
        console.log('error in /api/post', error);
        res.status(500).json({ message: error.message })
    }
});

router.delete('/delete/:id', validateToken1, (req, res) => {
    const id = req.params.id;
    Data.deleteOne({ _id: mongoose.Types.ObjectId(id) }, (err, result) => {
        if (err) return console.log(err);
        console.log('Deleted data with id ' + id);
        res.send(result);
    });
});

router.get('/get/:id', validateToken1, (req, res) => {
    var token = req.cookies.auth;
    console.log("token", token)
    // console.log(token);
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    console.log(process.env.ACCESS_TOKEN_SECRET)
    jwt.verify(token, secretKey, (err, decodedToken) => {
        if (err) {
            return res.status(403).send("Invalid access token");
        }

        // extract the user ID from the decoded token
        const userId = decodedToken.user;
        if (!token) {
            return res.status(401).send("UNauthorized");

        }
        console.log("from token: ", userId);
    });

    console.log('req.params: ', req.params);
    const id = req.params.id;

    // find the user by username or email
    User.findOne({ _id: mongoose.Types.ObjectId(id) }, (err, user) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
            return;
        }

        if (!user) {
            res.status(404).send('User not found');
            return;
        }

        // find the user's saved locations
        Data.find({ user: user._id }, (err, locations) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal server error');
                return;
            }
            console.log("userid", user._id)

            // send the user to the index page with their ID and locations (or an empty array if no locations were found)
            res.render('index', { userId: user._id, data: locations || [], userId: user._id, username_val: user.userName });
        });
    });
});



router.get('/signup', function (req, res, next) {
    User.find((err, docs) => {

        if (!err) {
            // console.log('No error found!');
            res.render("signup");
        } else {
            console.log('Failed to retrieve the data: ' + err);
            res.status(500).send(err);
        }
    });
});





// REGISTER A USER
router.post("/createUser", async (req, res) => {

    try {
        const { userName, email, password } = req.body;
        console.log("password", password);
        User.findOne({ email }, async (err, user) => {
            if (err) {
                console.log(err);
                console.log("inside if (errr)")
                return res.status(500).send('Internal server error');
            }

            if (user) {
                console.log("inside if user already exist")
                return res.status(200).json({ data: 'User already register, Please try to sign in.' });
            }

            else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = new User({ userName, email, password: hashedPassword });
                console.log("user", user)
                user.save();
                console.log(user)
                return res.status(201).json({ message: 'User registered successfully, You can Sign in now.' });
            }

        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/sign-in', (req, res) => {
    res.render('signin');
});

router.get('/sign-up', (req, res) => {
    res.render('signup');
})

//Route for handling existing user sign in
router.get('/signin-already-exists', (req, res) => {
    console.log("user already exists");

    res.render('signin');
});



router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        const useridval = user._id;
        if (!user) {
            return res.status(409).send('User not found.');
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).send({ data: "Password Incorrect!" });
        }
        const userId = user._id;
        const accessToken = generateAccessToken({ user: userId });
        const refreshToken = generateRefreshToken({ user: userId });
        console.log(user)
        const username = user.userName;
       let _test=await textflow.sendSMS("+919993024884", "Dummy message text...");
console.log("test_",_test)

        // localStorage.setItem("Token",accessToken);
        // const myVariable = localStorage.getItem('Token');
        // console.log(myVariable);
        res.cookie('auth', accessToken);

        res.json({ accessToken, refreshToken, useridval, username });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Generate access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
}

// Generate refresh token
function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "20m" });
    refreshTokens.push(refreshToken);
    return refreshToken;
}

//REFRESH TOKEN API
router.post("/refreshToken", (req, res) => {
    console.log("call refresh token start")

    if (!refreshTokens.includes(req.body.token)) res.status(400).send("Refresh Token Invalid")
    console.log("call refresh token start in if")

    refreshTokens = refreshTokens.filter((c) => c != req.body.token)
    //remove the old refreshToken from the refreshTokens list
    const accessToken = generateAccessToken({ user: req.body.email })
    const NewrefreshToken = generateRefreshToken({ user: req.body.email })
    console.log("refrehtoken generate", NewrefreshToken)
    //generate new accessToken and refreshTokens
    res.json({ accessToken: accessToken, refreshToken: NewrefreshToken })
})

router.delete("/logout", validateToken1, (req, res) => {
    refreshTokens = refreshTokens.filter((c) => c != req.body.token)
    res.clearCookie("auth");
    //remove the old refreshToken from the refreshTokens list
    // res.status(204).send("Logged out!")
    console.log("logged out")
    res.render('signin')
})




module.exports = { router };