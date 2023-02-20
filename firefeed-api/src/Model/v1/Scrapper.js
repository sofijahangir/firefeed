module.exports = class Scrapper {
  static websitesList(db) {
    return new Promise(function (resolve, reject) {
      db.query("SELECT * from websites", function (err, row) {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  }

  // get Wenbsite ID 
  static getWebsiteId(db, website_url) {
    return new Promise(function (resolve, reject) {
      console.log('Query: ')
      console.log(`SELECT id from websites where website_url =  ${website_url}`)
      db.query(`SELECT id from websites where website_url =  ${website_url}`, function (err, row) {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  }

  static getUrlId(db, url) {
    return new Promise(function (resolve, reject) {
      console.log(`SELECT id from websites_urls where url =  ${url}`)
      db.query(`SELECT id from websites_urls where url =  ${url}`, function (err, row) {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  }


  static insertEmails(db, website_id, url_id, email, first_name, last_name, job_title) {
    return new Promise(function (resolve, reject) {
      db.query("INSERT INTO websites_urls_contacts (website_id, url_id, email, first_name, last_name, job_title) VALUES (?, ?, ?, ?, ?, ?)", [website_id, url_id, email, first_name, last_name, job_title], function (err, row) {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  }
};
