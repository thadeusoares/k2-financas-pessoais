if (process.env.NODE_ENV === undefined) {
	require('dotenv').config({path: './env/dev.env'})

}

let createError 	= require('http-errors'),
express 			= require('express'),
session 			= require("express-session"),
flash        		= require("connect-flash"),
path 				= require('path'),
cookieParser 		= require('cookie-parser'),
LocalStrategy 		= require("passport-local"),
logger 				= require('morgan'),
passport    		= require("passport"),
mongoose    		= require("mongoose"),
bodyParser  		= require("body-parser"),
User        		= require("./src/models/user"),
app 				= express(),
methodOverride 		= require("method-override"),
seedDB      		= require("./seed"),
expressSanitizer  = require("express-sanitizer"),
device = require('express-device');

//connect to database
var url = process.env.DATABASEURL || "mongodb://localhost:27017/k2app";
mongoose.connect(url, { useNewUrlParser: true });

// view engine setup
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '/src/views'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use('/static', express.static('./node_modules/@fortawesome'))
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
app.use(device.capture());


//Configura a validação de devices
device.enableDeviceHelpers(app);
//device.enableViewRouting(app);

//seedDB.step1(); //seed the database
//seedDB.step2(); //seed the database

//configure passport
// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   res.locals.info = req.flash('info');
   res.locals.active = req.path.split('/')[1];
   next();
});

// set where the apps works
app.use(require(__dirname+'/src/apps.js'))

app.listen(process.env.PORT, process.env.IP, function(){
	console.log("The server is running... on " + process.env.IP + " over " + process.env.PORT + " port");
});