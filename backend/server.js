const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');
const cors = require('cors');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Browser configuration
const browserConfig = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu'
  ]
};

// Helper function to get a random delay
const getRandomDelay = () => Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);

// Function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Scraper for Amazon
const scrapeAmazon = async (url) => {
  const browser = await puppeteer.launch(browserConfig);
  const page = await browser.newPage();

  try {
    await page.setUserAgent(randomUseragent.getRandom());
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    await delay(getRandomDelay());

    const data = await page.evaluate(() => {
      const productName = document.querySelector('#productTitle')?.innerText.trim();
      const rating = document.querySelector('span[data-hook="rating-out-of-text"]')?.innerText;
      const reviewElements = Array.from(document.querySelectorAll('div[data-hook="review"]'));

      const reviews = reviewElements.map(review => ({
        rating: review.querySelector('i[data-hook="review-star-rating"]')?.innerText,
        title: review.querySelector('a[data-hook="review-title"]')?.innerText,
        text: review.querySelector('span[data-hook="review-body"]')?.innerText,
        date: review.querySelector('span[data-hook="review-date"]')?.innerText,
        verified: review.querySelector('span[data-hook="avp-badge"]') !== null
      })).filter(review => review.text && review.rating);

      return {
        productName,
        overallRating: rating,
        reviews
      };
    });

    if (!data.productName || !data.reviews.length) {
      throw new Error('Failed to extract product data');
    }

    return {
      source: 'Amazon',
      url,
      ...data
    };
  } catch (error) {
    console.error('Error scraping Amazon:', error);
    return {
      source: 'Amazon',
      url,
      error: 'Failed to fetch reviews'
    };
  } finally {
    await browser.close();
  }
};

// Main review fetching endpoint
app.get('/api/reviews', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // Search for Amazon product URL
    const browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();

    await page.setUserAgent(randomUseragent.getRandom());
    await page.setViewport({ width: 1920, height: 1080 });

    const searchQuery = `${query} site:amazon.in product reviews`;
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await delay(getRandomDelay());

    const urls = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .map(link => link.href)
        .filter(url => url.includes('amazon.in/') && (url.includes('/dp/') || url.includes('/p/')))
        .slice(0, 1); // Limit to one Amazon URL
    });

    if (!urls.length) {
      return res.status(404).json({ error: 'No products found. Try a different search term.' });
    }

    const result = await scrapeAmazon(urls[0]);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      query,
      results: [result]
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews. Please try again later.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Review scraper API running on http://localhost:${PORT}`);
});
