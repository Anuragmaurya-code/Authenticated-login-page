const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose =require('mongoose');
mongoose.set('strictQuery', false);

const _ =require('lodash');
require('dotenv').config();
const sessions = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

app.use(sessions({
    secret:'This is Anurag',
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/userDB',
{
useNewUrlParser: true,
useUnifiedTopology: true
});
const userSchema = new mongoose.Schema({
    email:String,
    password:String
});
userSchema.plugin(passportLocalMongoose);//to hash and salt password and to save in mongodb Database    

const User=new mongoose.model('user',userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/',(req,res)=>{
    res.render('home');
});
app.get('/register',(req,res)=>{
    res.render('register');
});
app.get('/login',(req,res)=>{
    res.render('login');
});
app.get('/secrets',(req,res)=>{
    if(req.isAuthenticated()) {
        res.render('secrets');
    }
    else{
        res.redirect('/login');
    }
});
app.get('/logout', function(req, res){
    req.logout(function(err){
        if(err) { return next(err); }
        res.redirect('/');
    });
});

app.post('/register',(req,res)=>{
    User.register({username:req.body.username},req.body.password,(err,user)=>{
        if(err)
        {
            console.log(err);
            res.redirect('/register');
        }
        else
        {
            passport.authenticate('local')(req,res,()=>{
                res.redirect('/secrets');
        });
    }
    
    });
});

app.post('/login',(req,res)=>{
    const user = new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,(err)=>{
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate('local')(req,res,()=>{
                res.redirect('/secrets');
        })};
});
});

app.listen(3000,function(){
console.log('Server running ar port 3000');
});