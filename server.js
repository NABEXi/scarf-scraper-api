const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Scarf scraper API is running");
});

app.get("/search-ebay", async (req, res) => {
  const query = req.query.q || "Hermes scarf";

  let browser;

  try {
    browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage();

    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0`;

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    const listings = await page.$$eval(".s-item", items =>
  items.slice(0, 10).map(item => {
    const title =
      item.querySelector(".s-item__title")?.innerText?.trim() || "";

    const price =
      item.querySelector(".s-item__price")?.innerText?.trim() || "";

    const link =
      item.querySelector(".s-item__link")?.href || "";

    return { title, price, link };
  }).filter(x => x.title && x.price && x.link)
);

    await browser.close();

    res.json({
      query,
      count: listings.length,
      listings
    });
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Scarf scraper API running on port ${PORT}`);
});
