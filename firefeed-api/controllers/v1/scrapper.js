const puppeteer = require('puppeteer');
const async = require("async");


// model
const Scrapper = require("../../src/Model/v1/Scrapper");






exports.startBrowser = async function (req, res, next) {

  console.log("Starting the browser......");
  const db = req.con;


  try {
    const websites = await Scrapper.websitesList(db);
    console.log("Websites found: ", websites);


    if (websites.length == 0) {
      return res.status(401).send({ "status": "failure", "message": "No websites found", "code": 2003 });
    }


    console.log("Opening the browser......");
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
    });

    const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/\?#\[\]@!\$&'\(\)\*\+,;=]+$/;

    for (let website of websites) {
      console.log(`Navigating to website: ${website.website_url}`);

      // validate the website URL
      if (!urlRegex.test(website.website_url)) {
        console.error(`Invalid website URL: ${website.website_url}`);
        continue;
      }

      const page = await browser.newPage();

      // navigate to the first page of the website
      await page.goto(website.website_url);

      let pageNum = 1;
      while (true) {
        // extract data from the current page
        const data = await page.evaluate(() => {
          // your existing data scraping logic here
        });

        console.log(`Found ${data.length} data rows on page ${pageNum}: ${page.url()}`);

        // save the data to the database
        for (let row of data) {
          // your existing database insertion logic here
        }

        // navigate to the next page if possible
        pageNum++;
        const links = await page.$$('a');
        let nextPageLink;
        for (let link of links) {
          const href = await link.getProperty('href');
          if (href && (await href.jsonValue()).trim() !== '' && (await href.jsonValue()).trim() !== '#') {
            nextPageLink = link;
            break;
          }
        }
        if (nextPageLink) {
          await Promise.all([nextPageLink.click(), page.waitForNavigation()]);
        } else {
          break;
        }
      }

      await page.close();
    }



    next();

    return res.json({
      status: "success",
      message: "Scraping completed",
    })
  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
    return res.json({
      status: "failure",
      message: "Could not create a browser instance",
    })
  }
};
