var mongoose = require("mongoose");

var parkSchema = new mongoose.Schema({
   name: String,
   image: String,
   state: String,
   rates: new Array(),
   description: String,
   author: {
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Park", parkSchema);