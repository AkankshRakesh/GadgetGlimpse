const express = require('express');
const puppeteer = require('puppeteer-extra'); // Use puppeteer-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');
const cors = require('cors');

puppeteer.use(StealthPlugin()); // Use the StealthPlugin

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Browser configuration
const browserConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu'
  ],
  timeout: 60000, // Increase timeout to 60 seconds
};

// Helper function to get a random delay
const getRandomDelay = () => Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);

// Function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Scraper for Amazon to get product details and reviews
const scrapeAmazon = async (query, retries = 3) => {
  const browser = await puppeteer.launch(browserConfig);
  const page = await browser.newPage();

  try {
    await page.setUserAgent(randomUseragent.getRandom());
    await page.setViewport({ width: 1920, height: 1080 });

    // Encode the query for the URL
    const encodedQuery = encodeURIComponent(query);
    const amazonSearchUrl = `https://www.amazon.in/s?k=${encodedQuery}`;

    console.log(`Search URL: ${amazonSearchUrl}`);

    // Go to the search page
    await page.goto(amazonSearchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Check if the page was redirected (e.g., to a "Did you mean?" page)
    const currentUrl = page.url();
    if (!currentUrl.includes('/s?')) {
      console.log('Redirected to a different page. Trying to handle it...');

      // Extract the corrected query (if available)
      const correctedQuery = await page.evaluate(() => {
        const correctionElement = document.querySelector('.a-spacing-small .a-color-state');
        return correctionElement ? correctionElement.textContent.trim() : null;
      });

      if (correctedQuery) {
        console.log(`Corrected query: ${correctedQuery}`);
        return scrapeAmazon(correctedQuery, retries); // Retry with the corrected query
      }
    }

    await delay(getRandomDelay());

    // Get the first non-sponsored Amazon product link
    const amazonLink = await page.evaluate(() => {
      const results = document.querySelectorAll('.s-main-slot .s-result-item');

      for (const result of results) {
        // Skip sponsored products
        const isSponsored = result.querySelector('.s-sponsored-label') || result.innerText.includes('Sponsored');
        if (!isSponsored) {
          const link = result.querySelector('a.a-link-normal');
          if (link) {
            return link.href;
          }
        }
      }

      return null; // No non-sponsored product found
    });

    if (!amazonLink) {
      throw new Error('No non-sponsored Amazon product found');
    }

    console.log(`Product URL: ${amazonLink}`);

    // Visit the product page
    await page.goto(amazonLink, { waitUntil: 'networkidle2', timeout: 60000 });

    // Check if the page was redirected to a search results page or captcha page
    const productPageUrl = page.url();
    if (productPageUrl.includes('/s?') || productPageUrl.includes('/errors/')) {
      if (retries > 0) {
        console.log('Redirected to search results or captcha page. Retrying...');
        return scrapeAmazon(query, retries - 1); // Retry the search
      } else {
        throw new Error('Failed to navigate to the product page after multiple retries.');
      }
    }

    // Wait for the product title to load
    await page.waitForFunction(() => document.querySelector('#productTitle'), { timeout: 60000 });

    // Extract product details
    const productDetails = await page.evaluate(() => {
      const titleElement = document.querySelector('#productTitle');
      const priceElement = document.querySelector('.a-price .a-offscreen');
      const ratingElement = document.querySelector('.a-icon-alt');
      const specificationElements = document.querySelectorAll('#productOverview_feature_div .a-spacing-small');

      const title = titleElement ? titleElement.textContent.trim() : 'No title found';
      const price = priceElement ? priceElement.textContent.trim() : 'No price found';
      const rating = ratingElement ? ratingElement.textContent.trim() : 'No rating found';

      // Extract specifications
      const specifications = {};
      specificationElements.forEach((element) => {
        const key = element.querySelector('.a-text-bold')?.textContent.trim().replace(':', '');
        const value = element.querySelector('.po-break-word')?.textContent.trim();
        if (key && value) {
          specifications[key] = value;
        }
      });

      return { title, price, rating, specifications };
    });

    // Wait for the reviews section to load
    await page.waitForSelector('.review', { timeout: 60000 });

    // Extract reviews with ratings
    const reviews = await page.evaluate(() => {
      const reviewElements = document.querySelectorAll('.review');
      const reviews = [];

      reviewElements.forEach((element, index) => {
        if (index < 5) { // Limit to top 5 reviews
          const reviewText = element.querySelector('.review-text-content')?.textContent.trim();
          const reviewRating = element.querySelector('.a-icon-alt')?.textContent.trim();
          if (reviewText && reviewRating) {
            reviews.push({ review: reviewText, rating: reviewRating });
          }
        }
      });

      return reviews;
    });

    return { ...productDetails, reviews };
  } catch (error) {
    console.error('Error in scrapeAmazon:', error);
    if (retries > 0) {
      console.log(`Retrying... Attempts left: ${retries - 1}`);
      return scrapeAmazon(query, retries - 1); // Retry the search
    } else {
      throw new Error(`Failed to scrape Amazon: ${error.message}`);
    }
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
    const result = await scrapeAmazon(query);

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