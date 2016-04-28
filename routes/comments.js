var express = require("express");
var router  = express.Router({mergeParams: true});
var Park = require("../models/park");
var Comment = require("../models/comments");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by id
    console.log(req.params.id);
    Park.findById(req.params.id, function(err, park){
        if(err){
              res.flash("error", "SOMETHING WENT WRONG");
            console.log(err);
        } else {
             res.render("comments/new", {park: park});
        }
    })
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
   //lookup campground using ID
   Park.findById(req.params.id, function(err, park){
       if(err){
            req.flash("error", err.message);
           res.redirect("/parks");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
                req.flash("error", err.message);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username
               //save comment
               comment.save();
               
               park.comments.push(comment);
               park.save();
               req.flash("success", "SUCCESSFULLY ADDED COMMENT");
               res.redirect('/parks/' + park._id);
           }
        });
       }
   });
});

//edit
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else{
            res.render("comments/edit", {park_id: req.params.id, comment:foundComment});
        }
    })
});


router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else{
            req.flash("success", "SUCCESSFULLY EDITTED COMMENT");
            res.redirect("/parks/" + req.params.id);
        }
    });
});

//delete
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else{
            req.flash("success", "SUCCESSFULLY DELETE COMMENT");
            res.redirect("/parks/" + req.params.id);
        }
    });
});



module.exports = router;