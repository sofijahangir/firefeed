const express = require("express");
const router = express.Router();

const scrapeController = require('../../controllers/v1/scrap');


router.get("/scrape", scrapeController.getWebsites, scrapeController.test);

// router.post("/scrape", scrapeController.insertEmails);


module.exports = router; 