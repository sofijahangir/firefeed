// Import core modules
const express                   = require("express");
const mysql                     = require("mysql");
const cors                      = require("cors");

// Import Logging
const logger                    = require("morgan");

// Import API Routes
const login                     = require("./routes/v1/login.js");
const chat                      = require("./routes/v1/chat.js");
const scrape = require("./routes/v1/scrapper.js");

// Import authentication middleware
const auth                      = require("./src/middleware/validateToken.js");

// Import MySQL DB configuration
const db_credentials            = require("../config/db_credentials.js");

// Start the MySQL DB configuration
var conn                        = mysql.createConnection(db_credentials);
// const { initializeApp }         = require('firebase-admin/app');
// var admin                       = require("firebase-admin");

// var serviceAccount              = require("../config/spokehub-177618-firebase-adminsdk-l8nte-b24bc167b2.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://spokehub-177618.firebaseio.com"
// });

// Connect to the MySQL Database
conn.connect(function(err) {
  if ( err ) {
    console.log("Error connecting to DB");
    return ;
  } 
  console.log("Connection Established");
});


// Start Express app
const app = express();

// Add CORS Support
// To do: Check and update the options
app.use(cors());
app.options('*', cors());

// Get the MySQL db connection
app.use(function(req, res, next) {
  req.con = conn;
  next();
});

// Start the logger
app.use(logger("dev"));

//Set the body parser
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true }));

// Configure passthrough routes which don't need the token
app.use(function(req, res, next) {
  const pass_through      =   [
      "/",
      "/v1/adminlogin",
      "/v1/login",
      "/v1/register",
      "/v1/scrape",
      "/v1/chat",
  ];
  const { url }   =   req;
  if ( pass_through.includes(url) ) {
      next();
  } else {
      auth.validateUser(req, res, next);        
  }
});


// Start the routes
app.use("/v1/", login);
app.use("/v1/", chat);
app.use("/v1/", scrape);

// Start the App
if (module === require.main) {
  // [START server]
  const server = app.listen(process.env.PORT || 3007, () => {
      const port = server.address().port;
      console.log(`App listening on port ${port}`);
  });
  const io = require('./socket').init(server);
  io.on('connection', socket => {
    console.log('Client connected');
  });
  // [END server]
}
