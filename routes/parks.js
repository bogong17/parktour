var express = require("express");
var router  = express.Router();
var Park = require("../models/park");
var middleware = require("../middleware");

var request = require("request");
    
var geocoderProvider = 'google';
var httpAdapter = 'http';
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);
var SunCalc = require('suncalc');
var Weather = require('weather-js');

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Park.find({}, function(err, allParks){
       if(err){
            req.flash("error", err.message);
       } else {
          res.render("parks/index",{parks:allParks});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    // var name = req.body.name;
    // var image = req.body.image;
    // var state = req.body.state;
    // var rates = req.body.rates;
    // var desc = req.body.description;
    // var author = {
    //     id: req.user._id,
    //     username: req.user.username
    // };
    // var newPark = {name: name, image: image, state: state, rates: rates, description: desc, author: author};
    // // Create a new campground and save to DB
    
    Park.create(req.body.park, function(err, park){
           if(err){
                req.flash("error", err.message);
           } else {
               //add username and id to comment
               park.author.id = req.user._id;
               park.author.username = req.user.username;
               park.name = req.body.park.name;
               park.image = req.body.park.image;
               park.state = req.body.park.state;
               park.description = req.body.park.description;
               //save comment
               park.rates.push(req.body.park.rate);
               park.save();
               req.flash("success", "SUCCESSFULLY ADDED A NEW PARK");
               res.redirect('/parks/');
               console.log(park);
           }
        });
    
    
    
    // Park.create(newPark, function(err, newlyCreated){
    //     if(err){
    //       req.flash("error", err.message);
    //     } else {
    //         //redirect back to campgrounds page
    //         req.flash("success", "SUCCESSFULLY CREATED A NEW CAMP");
    //         res.redirect("/parks");
    //     }
    // });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("parks/new"); 
});


// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Park.findById(req.params.id).populate("comments").exec(function(err, foundPark){
        if(err){
            req.flash("error", err.message);
        } else {
            
            geocoder.geocode(foundPark.name, function(err2, res2) {
                if(err2) {
                    console.log(err2);
                } else { 
                    
                    
                     // get today's sunlight times for London
                    var times = SunCalc.getTimes(new Date(), res2[0].latitude, res2[0].longitude);
                    // format sunrise time from the Date object
                    var sr = times.sunrise.toUTCString();
                    var ss = times.sunset.toUTCString();
                    console.log(times.sunrise);
                    
                    Weather.find({search: foundPark.name, degreeType: 'F'}, function(err, result) {
                      if(err) console.log(err);
                      var temp = result[0].current.temperature;
                      var wind = result[0].current.winddisplay;
                      //render show template with that campground
                     res.render("parks/show", {park: foundPark, sunriseStr: sr, sunsetStr: ss, temp: temp, wind: wind});  
                      console.log(result);
                    });
                     
                }
            });
            

        }
    });
});

//edit
router.get("/:id/edit", middleware.checkCampOwnership, function(req, res){
    
        Park.findById(req.params.id, function(err, foundPark){
           if(err){
                req.flash("error", err.message);
               res.redirect("/parks");
           } else{
                req.flash("success", "SUCCESSFULLY EDITTED");
               res.render("parks/edit", {park: foundPark});              
           }
        });

   

});

//update
router.put("/:id", middleware.checkCampOwnership, function(req, res){
    Park.findByIdAndUpdate(req.params.id, req.body.park, function(err, updatedCamp){
        if(err){
            req.flash("error", err.message);
            res.redirect("/parks");
        } else{
            console.log(req.body.park);
            req.flash("success", "SUCCESSFULLY UPDATED");
            res.redirect("/parks/" + req.params.id);
        }
    });
});



//destroy
router.delete("/:id", middleware.checkCampOwnership, function(req, res){
    Park.findByIdAndRemove(req.params.id, function(err){
       if(err){
            req.flash("error", err.message);
            res.redirect("/parks");
       } 
       req.flash("success", "SUCCESSFULLY DELETED");
       res.redirect("/parks");
    });

});




module.exports = router;

