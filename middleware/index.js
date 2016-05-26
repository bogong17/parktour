var Park = require("../models/park");
var Comment = require("../models/comments");

var middlewareObj = {};


middlewareObj.checkCommentOwnership = function(req, res, next){
      if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           } else{
              //does user own the comment
              if(foundComment.author.id.equals(req.user._id)){
                next();            
              }
              else{
                req.flash("error", "YOU DON'T HAVE PERMISSION TO DO THAT");
                res.redirect("back");
              }
           }
        });
    } else{
        req.flash("error", "YOU HAVE TO LOG IN");
        res.redirect("back");
    };  
};

middlewareObj.checkCampOwnership = function(req, res, next){
      if(req.isAuthenticated()){
        Park.findById(req.params.id, function(err, foundPark){
           if(err){
               res.redirect("back");
           } else{
              //does user own the campground
              if(foundPark.author.id.equals(req.user._id)){
                next();            
              }
              else{
                req.flash("error", "YOU DON'T HAVE PERMISSION TO DO THAT");
                res.redirect("back");
              }
           }
        });
    } else{
        req.flash("error", "YOU NEED TO LOG IN TO DO THAT");
        res.redirect("back");
    }
};



//middleware
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "YOU HAVE TO LOG IN");
    res.redirect("/login");
};

middlewareObj.caseInsensitive = function(req, res, next) {
    console.log(req.body.username.toLowerCase());
    next();
};

module.exports = middlewareObj;