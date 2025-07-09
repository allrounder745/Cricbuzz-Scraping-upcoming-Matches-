const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const CRICBUZZ_LIVE_URL = 'https://www.cricbuzz.com/cricket-match/live-scores';

app.get('/live-scores', async (req, res) => {
  try {
    const { data } = await axios.get(CRICBUZZ_LIVE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                      '(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });
    const $ = cheerio.load(data);

    const matches = [];

    // Live matches are in ul.cb-lv-scrs-list > li
    $('ul.cb-lv-scrs-list > li').each((i, el) => {
      const match = {};

      // Teams: inside span or div with class "cb-ovr-flo cb-hmscg-tm-nm"
      const teams = [];
      $(el).find('div.cb-lv-scrs-col > div > div > a').each((i, t) => {
        teams.push($(t).text().trim());
      });

      // Status: A div with class "cb-lv-scrs-status" or "cb-ovr-mtch-status"
      const status = $(el).find('div.cb-lv-scrs-status, div.cb-ovr-mtch-status').first().text().trim();

      // Venue - Sometimes not available here, so skip

      match.teams = teams;
      match.status = status;
      match.venue = ''; // venue is rarely shown at this part

      matches.push(match);
    });

    res.json({ matches });
  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({ error: 'Failed to fetch live scores' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
