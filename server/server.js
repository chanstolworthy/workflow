require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const Auth0Strategy = require('passport-auth0')
const createInitialSession = require(`${__dirname}/middleware/session-check`)
const massive = require('massive')
const cors = require('cors')
const session = require('express-session')
const companyController = require('./controllers/company_controller')

const port = 3005;

const app = express();


app.use(bodyParser.json() );
app.use(cors() );

massive(process.env.CONNECTIONSTRING).then(db => {
    app.set('db', db);
})


app.use(session({
    secret:process.env.SECRET, 
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());


//////////////////////////////    Authentication \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

passport.use(new Auth0Strategy({
    domain: process.env.AUTH_DOMAIN,
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK
}, function (accessToken, refreshToken, extraParams, profile, done) {
    // console.log(profile)
    const db = app.get('db');
    console.log('profile: ', profile.id)
    db.users.find_user(profile.id).then(user => {
        if (user[0]) {
            console.log(user[0])
            return done(null, user[0]);
        } else {
            db.users.create_user([profile.displayName, profile.emails[0].value, profile.picture, profile.id])
                .then(user => {
                    return done(null, user[0]);
                })
        }
    })
}))

passport.serializeUser(function (user, done) {
    console.log('serial: ', user);
    done(null, user);
})

//USER COMES FROM SESSION - INVOKED ON EVERY ENDPOINT.
passport.deserializeUser(function (user, done) {
    console.log('userid', user.userid)
    app.get('db').users.find_user(user.auth_id).then(user => {
        return done(null, user);
    })
    // console.log('deserial: ', user);
    // done(null, user)
})
app.get('/login', passport.authenticate('auth0', {
    successRedirect: 'http://localhost:3000/#/dashboard/',
    failureRedirect: 'http://localhost:3000/#/'
}));

app.get('/login/user', (req, res) => {
    console.log('req.user: ', req.user)
    if (!req.user) {
        return res.status(404).send('User not found')
    } else {
        return res.status(200).send(req.user);
    }
})
app.get('/logout', (req, res) => {
    req.logOut();
    return res.redirect(302, 'http://localhost:3000/#/');
})

//
////
//////
////////////////////////////        SERVER GETS         /////////////////////////////////
//////
////
//





////////////////////////////        COMPANY         /////////////////////////////////



app.get('/api/test', (req, res, next) => {
    req.app.get('db').company.all_company().then(response => res.status(200).send(response))
})


app.post('/api/addcompany', companyController.createCompany)


////////////////////////////        TEAM         /////////////////////////////////





app.get('/api/test/team', (req, res, next) => {
    req.app.get('db').team.all_team().then(response => res.status(200).send(response))
})





////////////////////////////        PROJECT         /////////////////////////////////




app.get('/api/test/project', (req, res, next) => {
    req.app.get('db').project.all_project().then(response => res.status(200).send(response))
})



////////////////////////////        TASK         /////////////////////////////////




app.get('/api/test/task', (req, res, next) => {
    req.app.get('db').task.all_task().then(response => res.status(200).send(response))
})




////////////////////////////        USERS         /////////////////////////////////


app.get('/api/test/users', (req, res, next) => {
    req.app.get('db').users.all_users().then(response => res.status(200).send(response))
})



app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})




