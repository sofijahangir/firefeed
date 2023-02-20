const puppeteer = require('puppeteer');
const async = require("async");
const Scraper = require("../../src/Model/v1/Scrapper");

const getData = require('./scrap');

const scrapeController = require('../../controllers/v1/scrap');



function getURLs(req) {
  if (req.websites && req.websites.length > 0) {
    return req.websites.map(website => {
      const url = website.website_url
      return url.includes('http') ? url : 'http://' + url;
    });
  } else {
    throw new Error('No websites found here');
  }

}




async function getEmailsFromPage(page) {
  const uniqueEmails = await page.evaluate(() => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = [...document.body.innerHTML.matchAll(emailRegex)].map(match => match[0]);
    return [...new Set(emails)];
  });

  const people = await Promise.all(uniqueEmails.map(async email => {
    const person = { email };
    const emailElement = await page.$(`a[href^="mailto:${email}"]`);
    if (emailElement) {
      const adjacentElements = await emailElement.$x('preceding-sibling::* | following-sibling::*');
      for (const element of adjacentElements) {
        const text = await page.evaluate(node => node.textContent.trim(), element);
        const nameMatch = text.match(/(^|\s)([A-Z][a-z]+)$/);
        const jobTitleMatch = text.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+$/);
        if (nameMatch) {
          person.firstName = nameMatch[2];
          if (nameMatch.index > 0) {
            const prevText = text.slice(0, nameMatch.index).trim();
            const lastNameMatch = prevText.match(/[A-Z][a-z]+$/);
            if (lastNameMatch) {
              person.lastName = lastNameMatch[0];
            } else {
              person.lastName = '';
            }
          } else {
            person.lastName = '';
          }
        } else {
          person.firstName = '';
          person.lastName = '';
        }

        if (jobTitleMatch) {
          person.jobTitle = jobTitleMatch[0];
        } else {
          person.jobTitle = '';
        }
      }
    }
    return person;
  }));

  return people;
}


const scraperObject = {
  async scraper(browser, req) {
    let urls = getURLs(req);
    console.log("urls: ", urls);

    let scrapedData = [];

    for (let url of urls) {
      const page = await browser.newPage();
      console.log(`Navigating to ${url}....`);
      await page.goto(url, { timeout: 60000 });

      const emails = await getEmailsFromPage(page);

      const people = emails.map(email => {
        const { firstName, lastName, jobTitle, ...otherData } = email;
        return { email, otherData };
      });

      scrapedData.push({ url, emails, otherData: people });

      await page.close();
    }

    await browser.close();

    console.log("scrapedData: ", scrapedData);

    req.scrapedData = scrapedData;

    const insertData = await scrapeController.insertEmails(req, scrapedData);

    return { scrapedData, insertData };
  }
};






module.exports = scraperObject;
