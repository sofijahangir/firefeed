//code 2000
// modules
const async                         = require("async");
const https                         = require('https');

// model

// auth

// io
const io                            = require('../../socket');

// POST | /adminlogin | Authenticate a BO user
exports.sendMessage = async function(req, res, next) {

  const db                          = req.con.database();
  const fcm                         = req.con.messaging();
  const { userId, hubId, username, message }  = req.body;
  const auth                        = req.headers.authorization;

  function sendMessageToApi(callback) {
    
    var data = JSON.stringify(message);
  
    var options = {
      hostname: 'spokehub-177618.appspot.com',
      port: 443,
      path: '/hubs/' + hubId + '/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': auth
      }
    };

    const resp = https.request(options, (res) => {
      let data = '';
  
      console.log('Status Code:', res.statusCode);
  
      res.on('data', (chunk) => {
        data += chunk;
      });
  
      res.on('end', () => {
        // console.log('Body: ', JSON.parse(data));        
      });
  
    }).on("error", (err) => {
      // console.log(err);
      console.log("Error: ", err.message);
      callback(err.message, null);
    });
  
    resp.write(data);
    resp.end();
    // console.log(resp);
    callback(null, res.statusCode);

  } 

  sendMessageToApi(function(err, msg) {
    if(err) {
      return res.status(500).send({"status": "failure", "code": 2002, "error" : err, "message" : "Couldn't send a message"});
    } else {
      
      if(msg == 200) {

        const ref                       = db.ref("v2/users/" + userId);
        ref.on('value', (snapshot) => {
      
          let fcm_token                 = snapshot.val().fcmToken;
          let dm = {
            notification: {
              title: "New Message from " + username,
              body: message.message
            }
          }

          fcm.sendToDevice(fcm_token, dm).then( response => {

            console.log(response);
    
            return res.status(200).send({ "status": "success", "fcmToken": fcm_token });
            // res.status(200).send("Notification sent successfully")
           
          }).catch( error => {
            console.log(error);
            return res.status(500).send({"status": "failure", "code": 2002, "error" : err, "message" : "Couldn't send a message"});
          });
  
          
  
        }, (errorObject) => {
          console.log('The read failed: ' + errorObject.name);
        });
      } else if (msg == 401) {
        return res.status(500).send({"status": "failure", "code": 2002, "error" : err, "message" : "Unauthorized"});
      } else {
        return res.status(500).send({"status": "failure", "code": 2002, "error" : err, "message" : "Couldn't send a message"});
      }
      
      
    }
  });

  // try {

    

      

    
  //   // const administrator             = await Administrator.fetchByEmail(db, email);

  //   // if ( administrator.length == 0 ) {
  //   //   return res.status(401).send({"status": "failure", "message": "Invalid Login Credentials", "code": 2001});
  //   // }
  //   // const adminDetails              = administrator[0];
    
  //   // const compare                   = await new Promise((resolve, reject) => {
  //   //   bcrypt.hash(password, adminDetails['password'], function(err, compare) {
  //   //     if (err) reject(err);
  //   //     resolve(compare);
  //   //   });
  //   // });
   
  //   // if(compare) {
  //   //   return admin.generateAdminToken(req, res, adminDetails['id'], adminDetails['user_scope'], adminDetails['name'], adminDetails['email']);
  //   // }
  // } catch(err) {
  //   // return error
  //   return res.status(500).send({"status": "failure", "code": 2002, "error" : err, "message" : "Invalid Login Credentials."});
  // }

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