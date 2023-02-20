
const jwt               = require("jsonwebtoken");
const secret            = require("../../../config/jwt_secret");

let token = {

    // Generate user token.
    generateAdminToken: (req, res, userId, userScope, userName, userEmail) => {
        
        // Setup the scope for this user based on their access
        let scope               = ["client"];
        if(userScope == "super") {
            scope               = ["superadmin","admin","client"];
        } else if(userScope == "admin") {
            scope               = ["admin","client"];
        } 
        
        // Pass userId, scope and expire the token in 2 hour from iat.
        const new_token   = jwt.sign({"sub": userId, "scope": scope}, secret, {expiresIn: '2 days'});

            return res.status(200).send(
                {
                    "status": "success",
                    "message": "Token Generation successful",
                    "data": {
                        "token": new_token,
                        "userId": userId,
                        "userScope": userScope,
                        "userName": userName,
                        "userEmail": userEmail
                    }
                }
            );

    }
}

module.exports   =   token;

