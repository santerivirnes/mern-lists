
// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's user structure 
const UserSessionSchema = new Schema(
  {
    userId: {
        type: String,
        default: ""
    },
    timestamp: {
        type: Date,
        default: Date.now()
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  }
);



// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("UserSession", UserSessionSchema);