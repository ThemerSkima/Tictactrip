require("dotenv").config();
require("./config/database").connect();

//Calling Express
const express = require("express");
//initialisation
const app = express();
const bcrypt = require('bcryptjs');
//Calling Jwt
const jwt = require("jsonwebtoken");
//Define Bodyparser
const bodyParser = require('body-parser');
//calling Auth.js
const authen = require("./middleware/auth");
// importing user context
const User = require("./model/user");


app.use(express.json());
//setup express to use body-parser for split,date etc..
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());


let rateLimit = {};
//API ROUTES
const ExobackApiRoutes = express.Router();

// Register
ExobackApiRoutes.post("/register", async(req, res) => {
    try {
        // Get user input
        const { first_name, last_name, email, password } = req.body;

        // Validate user input
        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email,
            password: encryptedPassword,
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "24h",
            }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
});

//LOGIN
    ExobackApiRoutes.post("/login", async (req, res) => {
        try {
            // Get user input
            const { email, password } = req.body;

            // Validate user input
            if (!(email && password)) {
                res.status(400).send("All input is required");
            }
            // Validate if user exist in our database
            const user = await User.findOne({ email }).select("+password");

            if (user && (await bcrypt.compare(password, user.password))) {
                // Create token
                const token = jwt.sign(
                    { user_id: user._id, email },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "24h",
                    }
                );

                // save user token
                user.token = token;
                rateLimit[token] = { words: 0, date: new Date() };
                res.json({
                    success: true,
                    message: 'Voici le token',
                    token: token
                });
                // user
                //return res.status(200).json(user);
                return true;
            }
            return res.status(400).send("Invalid Credentials");
        } catch (err) {
            console.log(err);
        }
    });


//Token verification after creating middleware for authentication
ExobackApiRoutes.post("/token", authen, (req, res) => {
    res.status(200).send('Welcome');
});

//Get all Users in our DB
ExobackApiRoutes.get('/users', function (req, res) {
    User.find({}, function (err, users) {
        res.json(users);
    });
});

//Textverification
ExobackApiRoutes.post('/justify',authen,function (req, res) {
    let token = req.headers['x-access-token'];
    
    let day = rateLimit[token].date;
    day = day.getDate();
    let currentDate = new Date();
    let currentDay = currentDate.getDate();

    if (currentDay !== day) {
        rateLimit[token].date = currentDay;
        rateLimit[token].words = 0;
    }
    const array = req.body.split(/\n|\s/);

    console.log(rateLimit);
    rateLimit[token].words += array.length;
    if (rateLimit[token].words > 80000)
        res.status(402).json({ success: false, message: '402 Payment Required.' });
    else {
        let index = 0;
        let text = [""];
        array.forEach((str) => {
            if (text[index].length + str.length <= 80) {
                text[index] += str + ' ';
            } else {
                text[index] = text[index].substr(0, text[index].length - 1);
                if (text[index].length !== 80) {
                    let fill = 80 - text[index].length;
                    const re = /\s/g;
                    let spaces = [];
                    while ((match = re.exec(text[index])) !== null) {
                        spaces.push(match.index);
                    }
                    spaces = spaces.reverse();
                    let i = 0;
                    while (fill > 0) {
                        text[index] = text[index].split('');
                        text[index].splice(spaces[i], 0, ' ');
                        text[index] = text[index].join('');
                        i++;
                        fill--;
                    }
                }
                index++;
                text[index] = "";
                text[index] += str + ' ';
            }
        });
        text[index] = text[index].substr(0, text[index].length - 1);
        text = text.join("\n");
        return res.send(text);
    }
});

// ALL routes are proceed by "/api"
app.use('/api', ExobackApiRoutes);

module.exports = app;
