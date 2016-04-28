var express = require("express");
var router  = express.Router();
var Park = require("../models/park");
var middleware = require("../middleware")

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
    var name = req.body.name;
    var image = req.body.image;
    var state = req.body.state;
    var rate = req.body.rate;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newPark = {name: name, image: image, state: state, rate: rate, description: desc, author: author};
    // Create a new campground and save to DB
    Park.create(newPark, function(err, newlyCreated){
        if(err){
           req.flash("error", err.message);
        } else {
            //redirect back to campgrounds page
            req.flash("success", "SUCCESSFULLY CREATED A NEW CAMP");
            res.redirect("/parks");
        }
    });
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
            console.log(foundPark)
            //render show template with that campground
            res.render("parks/show", {park: foundPark});
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

