require('dotenv').config();
const express = require('express');
const port = 3000;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: true
}));

async function main() {

    const mongoose = require('mongoose');

    app.use(session({
        secret: "Out little secrets.",
        resave: false,
        saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    await mongoose.connect('mongodb://localhost:27017/userDB', {
        useNewURLParser: true,
    });

    const userSchema = new mongoose.Schema({
        email: String,
        password: String
    });

    userSchema.plugin(passportLocalMongoose);

    const User = new mongoose.model("User", userSchema);

    passport.use(User.createStrategy());

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.get("/", (req, res) => {
        res.render("home");
    });

    app.get("/login", (req, res) => {
        res.render("login");
    });

    app.get("/secrets", (req, res) => {
        if (req.isAuthenticated()) {
            res.render("secrets");
        } else {
            res.redirect("/login");
        }
    });

    app.get("/logout", (req, res) => {
        req.logout(function (err) {
            if (err) {
                console.log(err);
            }
        });
        res.redirect("/");
    });

    app.route('/register')
        .get((req, res) => {
            res.render("register")
        })
        .post((req, res) => {
            User.register({
                username: req.body.username
            }, req.body.password, (err, user) => {
                if (err) {
                    console.log(err);
                    res.redirect("/register");
                } else {
                    passport.authenticate("local")(req, res, function () {
                        res.redirect("/secrets");
                    });

                }
            });
        });

    // app.post("/login",
    //     passport.authenticate('local', {
    //         failureRedirect: '/login'
    //     }),

    //     function (req, res) {

    //         res.redirect('/secrets');

    //     });

    app.post("/login", function (req, res) {

        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, function (err) {
            if (err) {
                console.log(err);
                res.redirect("/login");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secrets");
                });
            }
        });

    });

    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}

main();