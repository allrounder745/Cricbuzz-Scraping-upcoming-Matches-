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
    // Get page HTML with browser-like User-Agent
    const { data } = await axios.get(CRICBUZZ_LIVE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const matches = [];

    // Each live match is in <div class="cb-mtch-lst"> within ul > li
    $('.cb-mtch-lst > ul > li').each((i, el) => {
      const match = {};

      // Extract team names - anchor texts inside .cb-ovr-flo .text-hvr-underline
      const teams = [];
      $(el).find('.cb-ovr-flo .text-hvr-underline').each((i, teamEl) => {
        teams.push($(teamEl).text().trim());
      });

      // Extract score/status from .cb-ovr-scrs-col (contains scores or status)
      const status = $(el).find('.cb-ovr-scrs-col').text().trim();

      // Extract venue and time from .cb-ovr-mtch-status (sometimes has status or venue info)
      const venue = $(el).find('.cb-ovr-mtch-status').text().trim();

      match.teams = teams;
      match.status = status;
      match.venue = venue;

      // Only push if we have teams (to avoid empty entries)
      if (teams.length > 0) matches.push(match);
    });

    // Return JSON
    res.json({ matches });
  } catch (error) {
    console.error('Error scraping live scores:', error.message);
    res.status(500).json({ error: 'Failed to fetch live scores' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
