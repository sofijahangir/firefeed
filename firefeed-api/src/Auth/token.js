
const jwt       =   require("jsonwebtoken");
const secret    =   require("../../../config/jwt_secret");

let token = {
    
    generateToken: (req, res, userId, userFirstName, userLastName, userEmail) => {
        const scope       = ["client"];
        // Pass userId, scope and expireIn to jwt.

        const newToken   = jwt.sign({ "sub": userId, "scope": scope }, secret, {});
        
        return res.status(200).send(
            {
                "status": "success",
                "message": "Token Generation successful",
                "token": newToken,
                "userId": userId,
                "userScope": scope,
                "userFirstName": userFirstName,
                "userLastName": userLastName,
                "userEmail": userEmail
            }
        );
    },

}

module.exports   =   token;

