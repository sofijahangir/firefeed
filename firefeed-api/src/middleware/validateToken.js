
// code = 1000.

const jwt       =   require("jsonwebtoken");

const secret    =   require("../../../config/jwt_secret");

const validateUser    =   (req, res, next) => {
    
    isTokenValid( req, (error, decoded) => {
        if ( error ) {
            return res.status(401).send(error);
        } else {
            // Store decoded token in jwt key.
            req.jwt =   decoded;
            next();
        }
    });
};

const isTokenValid = ( req, callback ) => {
    let token   =   req.headers["x-access-token"] || req.headers["authorization"];

    if ( typeof token == "string" && token.startsWith("Bearer ")) {
        // Remove Bearer from string.
        token   =   token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, secret, (err , decoded) => {
            if ( err ) {
                const error = { "success": false, "message": "Token is invalid", "code": 1000 };
                return callback(error, null);
            } else {
                return callback(null, decoded);
            }
        });
    } else {
        const error = {success: false, message: "Auth token is not supplied", "code": 1001 };
        return callback(error, null);
    }
}

module.exports  =   { validateUser, isTokenValid };
