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
    const { data } = await axios.get(CRICBUZZ_LIVE_URL);
    const $ = cheerio.load(data);

    const matches = [];

    $('.cb-mtch-lst li').each((i, el) => {
      const match = {};

      const teams = $(el).find('.text-hvr-underline.cb-ovr-flo').map((i, teamEl) => $(teamEl).text().trim()).get();

      const status = $(el).find('.cb-ovr-flo .cb-ovr-scrs-col').text().trim();

      const venue = $(el).find('.cb-ovr-flo .cb-ovr-mtch-status').text().trim();

      match.teams = teams;
      match.status = status;
      match.venue = venue;

      matches.push(match);
    });

    res.json({ matches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch live scores' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
