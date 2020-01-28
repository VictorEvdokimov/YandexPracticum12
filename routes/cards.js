const router = require('express').Router();
const fs = require('fs');

const jsonCards = fs.readFileSync('./data/cards.json');
const cards = JSON.parse(jsonCards);

router.get('/cards', (req, res) => {
  res.send(cards);
});

module.exports = router;
