var express = require("express"),
    methodOverrdie = require("method-override"),
    sanitizer = require("express-sanitizer"), 
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");

//app config    
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(sanitizer()); //after bodyparser
app.use(methodOverrdie("_method"));


//mongoose/model config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String, // {type: String, default: "placeholderimage.jpg"}
    body: String,
    created: {type: Date, default: Date.now}
});

var Blogs = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Sunyanzi",
//     image: "https://upload.wikimedia.org/wikipedia/en/3/30/It's_Time.jpg",
//     body: "Hello",
// });


//RESTful routes
app.get("/", function(req, res){
    res.redirect("/blogs");
});

//index
app.get("/blogs", function(req, res){
    Blogs.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else{
            res.render("index", {blogs: blogs});
        }
    });
});


//new
app.get("/blogs/new", function(req, res){
        res.render("new");
});

//create
app.post("/blogs", function(req, res){
        //create blog
        req.body.blog.body = req.sanitize(req.body.blog.body);
        Blogs.create(req.body.blog, function(err, newBlog){
            if(err){
                res.render("new");
            } else{
                res.redirect("/blogs");
            }  
        });
        //redirect
});

//show
app.get("/blogs/:id", function(req, res){
        Blogs.findById(req.params.id, function(err, foundBlog){
           if(err){
               res.redirect("/blogs");
           } else{
               res.render("show", {blog: foundBlog});
           }
        });
});

//edit
app.get("/blogs/:id/edit", function(req, res){
        Blogs.findById(req.params.id, function(err, foundBlog){
           if(err){
               res.redirect("/blogs");
           } else{
               res.render("edit", {blog: foundBlog});
           }
        });
});


//update
app.put("/blogs/:id", function(req,res){
        req.body.blog.body = req.sanitize(req.body.blog.body);
        Blogs.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
           if(err){
               res.redirect("/blogs");
           } else{
               res.redirect("/blogs/" + req.params.id);
           }
        });
});

//destroy
app.delete("/blogs/:id", function(req,res){
        Blogs.findByIdAndRemove(req.params.id, function(err, updatedBlog){
           if(err){
               res.redirect("/blogs");
           } else{
               res.redirect("/blogs/");
           }
        });
});



app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is running..."); 
});