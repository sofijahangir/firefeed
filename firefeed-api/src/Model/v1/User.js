module.exports = class User {

    // fetch user by email id
    static fetchByEmail(db, email) {
        return new Promise(function (resolve, reject) {
            db.query("SELECT * FROM users WHERE email = ?", [email], function (err, row) {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    }

   // fetch user by id
   static fetchById(db, id) {
        return new Promise(function (resolve, reject) {
            db.query("SELECT * FROM users WHERE id = ?", [id], function (err, row) {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    }

    // create a user
    // used in register
    static createUser(db, firstName, lastName, email, password) {
        return new Promise(function (resolve, reject) { 
         db.query("INSERT INTO users(first_name, last_name, email, password) VALUES (?, ?, ?, ?)", [firstName, lastName, email, password], function (err, row) {
             if (!err) {
                 resolve(row);
             } else {
                 reject(err);
             }
         });
      });
    }

};