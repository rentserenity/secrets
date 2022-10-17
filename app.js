require('dotenv').config();
const express = require('express');
const port = 3000;
const md5 = require('md5');


const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: true
}));

console.log(process.env.API_KEY);

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
            const newUser = new User({
                email: req.body.username,
                password: md5(req.body.password)
            });
            newUser.save((err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render("secrets");
                }
            });
        });

    app.post("/login", async (req, res) => {
        const username = req.body.username;
        const password = md5(req.body.password);

        const foundUser = await User.findOne({
            email: username
        });
        if (foundUser.password === password) {
            res.render("secrets");
        } else {
            console.log("There was an error");
        }
    })



    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}

main();