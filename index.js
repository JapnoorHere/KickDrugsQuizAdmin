const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const session = require('express-session');

const PORT = 3000;

mongoose.connect("mongodb://localhost:27017/KickDrugsQuiz");
const db = mongoose.connection;

db.on('error',(error)=>{
    console.log("DB error : ", error);
})
db.once('open',()=>{
    console.log("Connected to database");
    
});

app.use(session({
    secret : "My secret key",
    saveUninitialized : true,
    resave : false
}));

app.use((req,res,next)=>{
    res.locals.message = req.session.message
    delete req.session.message;
    next()
});

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.set('view engine', "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('views'))

app.use(require('./routes/routes'));

app.listen(PORT,()=>{
    console.log("Listening");
});