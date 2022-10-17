require('dotenv').config();
const express = require('express');
const port = 3000;
const bcryptjs = require('bcryptjs');
const saltRounds = 10;


const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: true
}));

async function main() {

    const mongoose = require('mongoose');

    await mongoose.connect('mongodb://localhost:27017/userDB', {
        useNewURLParser: true,
    });

    const userSchema = new mongoose.Schema({
        email: String,
        password: String
    });

    const User = new mongoose.model("User", userSchema);


    app.get("/", (req, res) => {
        res.render("home");
    });

    app.get("/login", (req, res) => {
        res.render("login");
    });

    app.route('/register')
        .get((req, res) => {
            res.render("register")
        })
        .post((req, res) => {

            bcryptjs.hash(req.body.password, saltRounds, function (err, hash) {
                const newUser = new User({
                    email: req.body.username,
                    password: hash
                });
                newUser.save((err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("secrets");
                    }
                });
            })


        });

    app.post("/login", async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        const foundUser = await User.findOne({
            email: username
        });
        bcryptjs.compare(password, foundUser.password, (err, result) => {
            if (result === true) {
                res.render("secrets");
            }
        });
    });

    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}

main();