
// /backend/data.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

// this will be our data base's user structure 
const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      default:''
    },
    lastName: {
      type: String,
      default:''
    },
    email: {
      type: String,
      default:''
    },
    password: {
      type: String,
      default:''
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  }
);

UserSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

UserSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password);
}

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("User", UserSchema);