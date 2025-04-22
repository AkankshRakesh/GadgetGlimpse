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

const browserConfig = {
  headless: true,
  args: [
    '--disable-features=site-per-process',
  ],
  timeout: 120000,
};

const getRandomDelay = () => Math.floor(Math.random() * (5000 - 2000 + 1) + 2000); // 2-5 seconds

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const scrapeAmazon = async (query, retries = 3) => {
  const browser = await puppeteer.launch(browserConfig);
  const page = await browser.newPage();

  try {
    await page.setUserAgent(randomUseragent.getRandom());
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setJavaScriptEnabled(true);
    await page.setDefaultNavigationTimeout(120000);

    const encodedQuery = encodeURIComponent(query);
    const amazonSearchUrl = `https://www.amazon.in/s?k=${encodedQuery}&i=electronics`;

    console.log(`Search URL: ${amazonSearchUrl}`);

    try {
      await page.goto(amazonSearchUrl, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 3000000 });
  } catch (error) {
      console.error('Failed to navigate to the URL:', error);
  }

    const currentUrl = page.url();
    if (!currentUrl.includes('/s?')) {
      console.log('Redirected to a different page. Trying to handle it...');

      const correctedQuery = await page.evaluate(() => {
        const correctionElement = document.querySelector('.a-spacing-small .a-color-state');
        return correctionElement ? correctionElement.textContent.trim() : null;
      });

      if (correctedQuery) {
        console.log(`Corrected query: ${correctedQuery}`);
        return scrapeAmazon(correctedQuery, retries); 
      }
    }

    await delay(getRandomDelay());

    const amazonLink = await page.evaluate(() => {
      const results = Array.from(document.querySelectorAll('.s-main-slot .s-result-item'))  ;

      for (const result of results) {
        const isSponsored = result.querySelector('.s-sponsored-label') || result.innerText.includes('Sponsored');
        if (!isSponsored) {
          const link = result.querySelector('a.a-link-normal');
          if (link && link.href.includes('/dp/')) {
            return link.href.split('?')[0];
          }
        }
      }

      return null; 
    });

    if (!amazonLink) {
      throw new Error('No non-sponsored Amazon product found');
    }

    console.log(`Product URL: ${amazonLink}`);

    await page.goto(amazonLink, { waitUntil: 'networkidle2', timeout: 120000 });

    const productPageUrl = page.url();
    if (productPageUrl.includes('/s?') || productPageUrl.includes('/errors/')) {
      if (retries > 0) {
        console.log('Redirected to search results or captcha page. Retrying...');
        return scrapeAmazon(query, retries - 1); 
      } else {
        throw new Error('Failed to navigate to the product page after multiple retries.');
      }
    }

    await page.waitForFunction(() => document.querySelector('#productTitle'), { timeout: 60000 });
    await page.evaluate(async () => {
      const manufacturerSection = document.querySelector('.aplus-module');
      if (manufacturerSection) {
        manufacturerSection.scrollIntoView();
        await new Promise(r => setTimeout(r, 2000)); 
      }
    });
    const productDetails = await page.evaluate(() => {
      const titleElement = document.querySelector('#productTitle');
      const priceElement = document.querySelector('.a-price .a-offscreen');
      const ratingElement = document.querySelector('.a-icon-alt');
      const specificationElements = document.querySelectorAll('#productOverview_feature_div .a-spacing-small');
    
      const title = titleElement ? titleElement.textContent.trim() : 'No title found';
      const price = priceElement ? priceElement.textContent.trim() : 'No price found';
      const rating = ratingElement ? ratingElement.textContent.trim() : 'No rating found';
    
      let images = new Set(); 

  document.querySelectorAll('[data-a-dynamic-image]').forEach(element => {
    const dataImages = JSON.parse(element.getAttribute('data-a-dynamic-image'));
    Object.keys(dataImages).forEach(imgSrc => {
      if (imgSrc.includes('https') && dataImages[imgSrc] > 100000 && !img.src.includes('sprite') && !imgSrc.includes('icon') && !imgSrc.includes('badge') && !imgSrc.includes('logo')) {
        images.add(imgSrc.replace(/_.*?\./, '_SL1500.'));
      }
    });
  });
  document.querySelectorAll('.a-row img').forEach(img => {
    if (img.src.includes('https') && !img.src.includes('sprite') && !img.src.includes('icon') && !img.src.includes('badge') && !img.src.includes('logo')) {
      images.add(img.src.replace(/_.*?\./, '_SL1500.')); 
    }
  });

  document.querySelectorAll('#imgTagWrapperId img').forEach(img => {
    if (img.src.includes('https') && !img.src.includes('sprite') && !img.src.includes('icon') && !img.src.includes('badge') && !img.src.includes('logo')) {
      images.add(img.src.replace(/_.*?\./, '_SL1500.'));
    }
  });


  let highQualityImages = Array.from(images).filter(img => img.includes("_SL1500"));
    
      const specifications = {};
      specificationElements.forEach((element) => {
        const key = element.querySelector('.a-text-bold')?.textContent.trim().replace(':', '');
        const value = element.querySelector('.po-break-word')?.textContent.trim();
        if (key && value) {
          specifications[key] = value;
        }
      });
    
      return { title, price, rating, specifications, images: highQualityImages.slice(-4) };
    });
    
    


    await page.waitForSelector('.review', { timeout: 120000 });

const reviews = await page.evaluate(() => {
  const reviewElements = document.querySelectorAll('.review');
  const reviews = [];

  reviewElements.forEach((element) => {
    const reviewText = element.querySelector('.review-text-content')?.textContent.trim();
    const reviewRatingText = element.querySelector('.a-icon-alt')?.textContent.trim();
    const reviewRating = reviewRatingText ? parseFloat(reviewRatingText.split(' ')[0]) : null;

    if (reviewText && reviewRating !== null) {
      reviews.push({ review: reviewText, rating: reviewRating });
    }
  });

  const positiveReviews = reviews.filter(r => r.rating >= 4);
  const negativeReviews = reviews.filter(r => r.rating <= 2);
  const averageReviews = reviews.filter(r => r.rating === 3);

  const selectedReviews = [
    ...negativeReviews.slice(0, 2), // 2 bad reviews
    ...positiveReviews.slice(0, 2), // 2 good reviews
    ...averageReviews.slice(0, 1),  // 1 average review
  ];

  return reviews.slice(0, 5);
});


    return { ...productDetails, reviews, amazonLink };
  } catch (error) {
    console.error('Error in scrapeAmazon:', error);
    if (retries > 0) {
      console.log(`Retrying... Attempts left: ${retries - 1}`);
      return scrapeAmazon(query, retries - 1); 
    } else {
      throw new Error(`Failed to scrape Amazon: ${error.message}`);
    }
  } finally {
    await browser.close();
  }
};

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Review scraper API running on http://localhost:${PORT}`);
});