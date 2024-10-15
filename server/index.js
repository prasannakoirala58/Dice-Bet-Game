const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let gameState = {
  diceResult: null,
  bets: [],
};

// @GET - Roll the dice
app.get('/api/roll-dice', (req, res) => {
  const diceRoll = Math.floor(Math.random() * 6) + 1;
  gameState.diceResult = diceRoll;
  res.json({ diceRoll });
});

// @POST - Place a bet
app.post('/api/place-bet', (req, res) => {
  const { user, amount, guess } = req.body;
  const betResult = guess === gameState.diceResult;
  gameState.bets.push({ user, amount, guess, betResult });
  res.json({ betResult, diceResult: gameState.diceResult });
});

// Start the server
app.listen((PORT = 5000), () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
