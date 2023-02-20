const pageScraper = require('./pageScraper');
async function scrapeAll(browserInstance, req) {
  let browser;
  try {
    
    browser = await browserInstance;
    return await pageScraper.scraper(browser, req);

  }
  catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}

module.exports = (browserInstance, req) => scrapeAll(browserInstance, req)