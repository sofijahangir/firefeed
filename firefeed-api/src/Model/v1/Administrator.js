module.exports = class Administrator {

    // fetch Administrator by email id
    // used in adminLogin
    static fetchByEmail(db, email) {

       return new Promise(function (resolve, reject) {
        db.query("SELECT * FROM administrators WHERE email = ?", [email], function (err, row) {
            if (!err) {
                resolve(row);
            } else {
                reject(err);
            }
        });
     });

    }

};