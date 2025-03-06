/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
*/

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); // Hack for in-memory storage
var jwt = require('jsonwebtoken');
var cors = require('cors');
require('dotenv').config(); // Load environment variables

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

// Function to structure JSON o
function getJSONObjectForMovieRequirement(req) {
    return {
        headers: req.headers || "No headers",
        key: process.env.UNIQUE_KEY,
        body: req.body || "No body",
        query: req.query || "No query"
    };
}

// Signup route
router.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, msg: 'Please include both username and password to signup.' });
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); // No duplicate checking
        res.json({ success: true, msg: 'Successfully created new user.' });
    }
});


router.post('/signin', (req, res) => {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
        if (req.body.password === user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.UNIQUE_KEY, { expiresIn: '1h' }); // Updated key
            res.json({ success: true, token: 'JWT ' + token });
        } else {
            res.status(401).send({ success: false, msg: 'Authentication failed.' });
        }
    }
});


router.route('/movies')
    .get((req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "GET movies";
        res.json(o);
    })
    .post((req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie saved";
        res.json(o);
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie updated";
        res.json(o);
    })
    .delete(authController.isAuthenticated, (req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie deleted";
        res.json(o);
    })
    .all((req, res) => {
        res.status(405).json({ message: 'HTTP method not supported' });
    });


router.route('/testcollection')
    .delete(authController.isAuthenticated, (req, res) => {
        console.log(req.body);
        var o = getJSONObjectForMovieRequirement(req);
        res.status(200).json(o);
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        console.log(req.body);
        var o = getJSONObjectForMovieRequirement(req);
        res.status(200).json(o);
    });


app.use('/', router);
app.listen(process.env.PORT || 8080, () => {
    console.log(`Server running on port ${process.env.PORT || 8080}`);
});

module.exports = app; 
