//code 2000
// modules
const bcrypt                        = require('bcrypt');
const async                         = require("async");

// model
const Administrator                 = require("../../src/Model/v1/Administrator");
const User                          = require("../../src/Model/v1/User");

// auth
const token                         = require("../../src/Auth/token.js");
const admin                         = require("../../src/Auth/adminToken.js");

// io
const io                            = require('../../socket');

// POST | /adminlogin | Authenticate a BO user
exports.adminLogin = async function(req, res, next) {

  const db                          = req.con;
  const { email, password }         = req.body;

  try {
    const administrator             = await Administrator.fetchByEmail(db, email);

    if ( administrator.length == 0 ) {
      return res.status(401).send({"status": "failure", "message": "Invalid Login Credentials", "code": 2001});
    }
    const adminDetails              = administrator[0];
    
    const compare                   = await new Promise((resolve, reject) => {
      bcrypt.hash(password, adminDetails['password'], function(err, compare) {
        if (err) reject(err);
        resolve(compare);
      });
    });
   
    if(compare) {
      return admin.generateAdminToken(req, res, adminDetails['id'], adminDetails['user_scope'], adminDetails['name'], adminDetails['email']);
    }
  } 
  catch(err) {
     // return error
     return res.status(500).send({"status": "failure", "code": 2002, "error" : err, "message" : "Invalid Login Credentials."});
  }

};

// POST | /login | Authenticate a Client user
exports.login = async function(req, res, next) {

  const db                          = req.con;
  const { email, password }         = req.body;

  try {
    const user                      = await User.fetchByEmail(db, email);

    if ( user.length == 0 ) {
      return res.status(401).send({"status": "failure", "message": "Invalid Login Credentials", "code": 2003});
    }

    const userDetails               = user[0];
  
    const compare = await new Promise((resolve, reject) => {
      bcrypt.hash(password, userDetails['password'], function(err, compare) {
        if (err) reject(err);
        resolve(compare);
      });
    });

    if(compare) {

      // test socket.io 
      // io.getIO().emit('userDetails', {
      //   user: userDetails
      // });

      return token.generateToken(req, res, userDetails['id'], userDetails.first_name, userDetails.last_name, userDetails['email']);
    }
    
  } 
  catch(err) {
     // return error
     return res.status(500).send({"status": "failure", "code": 2004, "error" : err, "message" : "Invalid Login Credentials."});
  }

};

// POST | /register | Register a Client user
exports.register = async function(req, res, next) {

  const db                          = req.con;
  const { firstName, lastName, email, password }  = req.body;

  try {

    const user                      = await User.fetchByEmail(db, email);
    
    if ( user.length == 0 ) {
      
      const hashedPassword          = await new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, function(err, hash) {
          if (err) reject(err);
          resolve(hash);
        });
      });


      const newUser                 = await User.createUser(db, firstName, lastName, email, hashedPassword);
      const userId                  = newUser["insertId"];

      console.log("here2  ");
      console.log(newUser);

      return token.generateToken(req, res, userId, firstName, lastName, email, null);
    } else {
      return res.status(200).send({"status": "alreadyExists", "message": "User already registered", "code": 2005});
    }
    
  } 
  catch(err) {
     // return error
     return res.status(500).send({"status": "failure", "code": 2006, "error" : err, "message" : "Please do it again."});
  }

};