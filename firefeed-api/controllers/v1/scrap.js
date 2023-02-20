const browserObject = require("./browser");
const scraperController = require("./pageController");


const Scrapper = require("../../src/Model/v1/Scrapper");


exports.test = async function (req, res, next) {
  try {

    let browserInstance = browserObject.startBrowser();

    // Pass the browser instance to the scraper controller
    const output = await scraperController(browserInstance, req);
    console.log("Output: ", output)
    if (output.insertData) {
      // send
      return res.status(200).send({ "status": "success", "message": "Emails inserted successfully", "code": 200 });
    } else {
      // send response as failure
      return res.status(401).send({ "status": "failure", "message": "Emails not inserted", "code": 400 });
    }
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
};


exports.getWebsites = async function (req, res, next) {
  const db = req.con;

  try {

    const websites = await Scrapper.websitesList(db);
    console.log("Websites found: ", websites);

    if (websites.length == 0) {
      return res.status(401).send({ "status": "failure", "message": "No websites found", "code": 2003 });
    }
    req.websites = websites;
    next();


  } catch (err) {
    next();
    console.log("Could not resolve the browser instance => ", err);
  }
}
exports.getIds = async function (req, res, next) {
  const db = req.con;
  let { url } = req
  try {


    console.log("Urls from req: ", url);
    const website_id = await Scrapper.getWebsiteId(db, url);
    console.log("Website Id: ", website_id);

    if (website_id.length == 0) {
      return res.status(401).send({ "status": "failure", "message": "No websites found here", "code": 2003 });
    }

    const url_id = await Scrapper.getUrlId(db, url);

    if (url_id.length == 0) {
      return res.status(401).send({ "status": "failure", "message": "No websites found", "code": 2003 });
    }


    req.website_id = website_id[0].id;
    req.url_id = url_id[0].id;

    next();

  } catch (err) {
    next();
    console.log("Could not resolve the browser instance => ", err);
  }
}




exports.insertEmails = async function (req, scrapedData) {
  const db = req.con;
  const urls = scrapedData;

  try {
    console.log("Scrapped Data: ", scrapedData);
    console.log("DAta Length: ", scrapedData.length);
    let data = [];

    for (let i = 0; i < urls.length; i++) {
      let url = urls[i].url;
      const emails = urls[i].emails;
      const otherData = urls[i].otherData;

      console.log("URL: ", url);
      console.log("Emails: ", emails);
      console.log("Other Data: ", otherData);

      // remove http:// or https:// from url
      if (url.includes('http://')) {
        url = url.replace('http://', '');
      } else if (url.includes('https://')) {
        url = url.replace('https://', '');
      }

      // add '' to url
      url = `'${url}'`;

      console.log("URL : ", url);
      console.log("Emails: ", emails);

      let website_id = await Scrapper.getWebsiteId(db, url);
      let url_id = await Scrapper.getUrlId(db, url);

      console.log("Website Id: ", website_id[0].id);
      console.log("Url Id: ", url_id[0].id);

      if (emails.length === 1) {
        const insert = await Scrapper.insertEmails(db, website_id[0].id, url_id[0].id, emails[0].email, emails[0].firstName, emails[0].lastName, emails[0].jobTitle);
        data.push(insert.rows);
      } else if (emails.length > 1) {
        for (let j = 0; j < emails.length; j++) {
          const insert = await Scrapper.insertEmails(db, website_id[0].id, url_id[0].id, emails[j].email, emails[j].firstName, emails[j].lastName, emails[j].jobTitle);
          data.push(insert.rows);
        }
      }
    }

    if (data.length == 0) {
      return false;
    }

    console.log("Data: ", data);

    if (data.length > 0) {
      console.log("Emails inserted: ", data);
    }

    return true;
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
    return false;
  }
}
