var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    Park  = require("./models/park"),
    Comment     = require("./models/comments"),
    User        = require("./models/user"),
    seedDB      = require("./seed"),
    methodOverride = require("method-override"),
    flash = require("connect-flash");
    
//requring routes
var commentRoutes    = require("./routes/comments"),
    parkRoutes = require("./routes/parks"),
    indexRoutes      = require("./routes/index")
    
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";    
mongoose.connect(url);

//process.env.DATABASEURL mongodb://localhost/yelp_camp


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/parks", parkRoutes);
app.use("/parks/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The ParkTour Server Has Started!");
});