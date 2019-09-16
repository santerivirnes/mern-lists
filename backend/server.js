const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Data = require('./data');
const User = require('./User');
const UserSession = require('./UserSession');
const bcrypt = require('bcrypt');
const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

// this is our MongoDB database
const dbRoute =
  'mongodb://localhost:27017/login_test';

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// this is our get method for data
// this method fetches all available data in our database
router.get('/getData', (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// this is our get method for users
// this method fetches all available data in our database
router.get('/getUser', (req, res) => {
  User.find((err, user) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, user: user });
  });
});


// this is our update method
// this method overwrites existing data in our database
router.post('/updateData', (req, res) => {
  const { id, update } = req.body;
  Data.findByIdAndUpdate(id, update, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our delete method
// this method removes existing data in our database
router.delete('/deleteData', (req, res) => {
  const { id } = req.body;
  Data.findByIdAndRemove(id, (err) => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

// this is our create methid
// this method adds new data in our database
router.post('/putData', (req, res) => {
  let data = new Data();

  const { id, message } = req.body;

  if ((!id && id !== 0) || !message) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }
  data.message = message;
  data.id = id;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

//Create new user method
router.post('/putUser', (req, res) => {
  let user = new User();

  const { id, email, password, firstName, lastName } = req.body;

  // if ((!id && id !== 0) || !message) {
  //   return res.json({
  //     success: false,
  //     error: 'INVALID INPUTS',
  //   });
  // }
  user.email = email;
  user.password = password;
  user.firstName = firstName;
  user.lastName = lastName;
  user.id = id;
  user.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// POST ACCOUNT FROM ANOTHER TUTORIAL
router.post("/signup", (req, res, next) => {
  const { body } = req;
  const {
      firstName,
      lastName,
      password
  } = body;
  let {
    email
  } = body;

  if(!firstName){
      return res.send({
          success: false,
          message: 'Error: First name cannot be blank'
      });
  }

  if(!lastName){
    return res.send({
       success: false,
       message: 'Error: Last name cannot be blank'
       });
   }
   if(!email){
    return res.send({
           success: false,
           message: 'Error: email cannot be blank'
       });
   }
   if(!password){
    return res.send({
           success: false,
           message: 'Error: Password cannot be blank'
       });
   }

   console.log("here");

   email = email.toLowerCase();


   // STEPS:
   // 1. Verify email doesnt exist
   // 2. Save
   User.find({
       email: email
   }, (err, previousUsers) => {
       if (err) {
        return res.send({
               success: false,
               message: "Error: server error"
           });
       } else if (previousUsers.length > 0) {
        return res.send({
               success: false,
               message: "Error: Account already exist"
           });
       }
   })

   // Save the new user
   const newUser = new User();

   newUser.email = email;
   newUser.firstName = firstName;
   newUser.lastName = lastName;
   newUser.password = newUser.generateHash(password);
   newUser.save((err, user) => {
       if(err){
        return res.send({
               success: false,
               message: "Error: server error"
           })
       }
       return res.send({
           success: true,
           message: "Signed up"
       })
   })


})


router.post("/signin", (req, res, next) => {
  const { body } = req;
  const {
      password
  } = body;
  let {
    email
  } = body;

  if(!email){
    return res.send({
           success: false,
           message: 'Error: email cannot be blank'
       });
   }
   if(!password){
    return res.send({
           success: false,
           message: 'Error: Password cannot be blank'
       });
   }

   email = email.toLowerCase();

   User.find({
     email: email
   }, (err, users) => {
     if (err) {
       return res.send({
         success: false,
         message: "Error: server error"
       });
     }
     if (users.length != 1){
       return res.send({
         success: false,
         message: "Error: Invalid"
       });
     }

     const user = users[0];
     if(!user.validPassword(password)){
       return res.send({
         success: false,
         message: "Error: Invalid"
       });
     }

     const userSession = new UserSession();
     userSession.userId = user._id;
     userSession.save((err, doc) => {
       if (err) {
         return res.send({
           success: false,
           message: "Error: server error"
         });
       }

       return res.send({
         success: true,
         message: "Valid sign in",
         token: doc._id
       })
     })
   })

})

router.get("/verify", (req, res, next) => {
  const { query } = req;
  const { token } = query;
  //?token=test

  // Verify the token is one of a kind and its not deleted.

  UserSession.find({
    _id: token,
    isDeleted: false
  }, (err, session) => {
    if (err) {
      return res.send({
        success: false,
        message: "Error: Server error"
      })
    }
    if (session.length != 1) {
      return res.send({
        success: false,
        message: "Error: Invalid"
      })
    } else {
      return res.send({
        success: true,
        message: "Good"
      })
    }
  })
})

router.get("/logout", (req, res, next) => {
  const { query } = req;
  const { token } = query;
  //?token=test

  // Verify the token is one of a kind and its not deleted.

  UserSession.findOneAndUpdate({
    _id: token,
    isDeleted: false
  }, 
    {$set:{isDeleted:true}}
  , null, (err, session) => {
    if (err) {
      return res.send({
        success: false,
        message: "Error: Server error"
      })
    } return res.send({
        success: true,
        message: "Good"
      })
    
  })
})

// append /api for our http requests
app.use('/api', router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));