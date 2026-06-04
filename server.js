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

    const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  viewport: { width: 1366, height: 768 },
  locale: "en-US"
});

const page = await context.newPage();

    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0`;

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    await page.waitForTimeout(5000);

const pageTitle = await page.title();
const bodyText = await page.locator("body").innerText().catch(() => "");

const listings = await page.$$eval("li.s-item", items =>
  items.slice(0, 20).map(item => {
    const title =
      item.querySelector(".s-item__title span")?.textContent?.trim() ||
      item.querySelector(".s-item__title")?.textContent?.trim() ||
      "";

    const price =
      item.querySelector(".s-item__price")?.textContent?.trim() || "";

    const link =
      item.querySelector("a.s-item__link")?.href || "";

    return { title, price, link };
  }).filter(x =>
    x.title &&
    x.price &&
    x.link &&
    !x.title.toLowerCase().includes("shop on ebay")
  )
);

    await browser.close();

    res.json({
  query,
  pageTitle,
  bodyPreview: bodyText.slice(0, 500),
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

app.get("/search-etsy", async (req, res) => {
  const query = req.query.q || "";

  res.json({
    website: "Etsy",
    searchUrl: `https://www.etsy.com/search?q=${encodeURIComponent(query)}`
  });
});

app.get("/search-vestiaire", async (req, res) => {
  const query = req.query.q || "";

  res.json({
    website: "Vestiaire",
    searchUrl: `https://www.vestiairecollective.com/search/?q=${encodeURIComponent(query)}`
  });
});

app.get("/search-fashionphile", async (req, res) => {
  const query = req.query.q || "";

  res.json({
    website: "Fashionphile",
    searchUrl: `https://www.fashionphile.com/search?search=${encodeURIComponent(query)}`
  });
});

app.get("/search-therealreal", async (req, res) => {
  const query = req.query.q || "";

  res.json({
    website: "TheRealReal",
    searchUrl: `https://www.therealreal.com/products?keywords=${encodeURIComponent(query)}`
  });
});

app.get("/search-1stdibs", async (req, res) => {
  const query = req.query.q || "";

  res.json({
    website: "1stDibs",
    searchUrl: `https://www.1stdibs.com/search/?q=${encodeURIComponent(query)}`
  });
});

app.get("/search-all", async (req, res) => {
  const query = req.query.q || "";

  const websites = [
    {
      website: "eBay",
      searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0`
    },
    {
      website: "Etsy",
      searchUrl: `https://www.etsy.com/search?q=${encodeURIComponent(query)}`
    },
    {
      website: "Vestiaire",
      searchUrl: `https://www.vestiairecollective.com/search/?q=${encodeURIComponent(query)}`
    },
    {
      website: "Fashionphile",
      searchUrl: `https://www.fashionphile.com/search?search=${encodeURIComponent(query)}`
    },
    {
      website: "TheRealReal",
      searchUrl: `https://www.therealreal.com/products?keywords=${encodeURIComponent(query)}`
    },
    {
      website: "1stDibs",
      searchUrl: `https://www.1stdibs.com/search/?q=${encodeURIComponent(query)}`
    }
  ];

  res.json({
    query,
    count: websites.length,
    websites
  });
});

app.listen(PORT, () => {
  console.log(`Scarf scraper API running on port ${PORT}`);
});
