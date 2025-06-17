import preflopEquityTable from "./utils/preflop_equity_table.json";

const rankMap = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};
const ranks = Object.keys(rankMap);
const suitMap = {
  c: "♣ (Club)",
  d: "♦ (Diamond)",
  h: "♥ (Heart)",
  s: "♠ (Spade)",
};
const suits = Object.keys(suitMap);

const HAND_TYPES = [
  "High Card",
  "One Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush",
  "Royal Flush",
];

const FULL_DECK = (() => {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(rank + suit);
    }
  }
  return deck;
})();

function populateDropdowns() {
  document.querySelectorAll(".rank").forEach((select) => {
    select.innerHTML += ranks
      .map((r) => `<option value="${r}">${r}</option>`)
      .join("");
  });
  document.querySelectorAll(".suit").forEach((select) => {
    select.innerHTML += suits
      .map((s) => `<option value="${s}">${suitMap[s]}</option>`)
      .join("");
  });
}

populateDropdowns();

/** Util function */

function getSelectedCards(parentId) {
  const parent = document.getElementById(parentId);
  const selects = parent.querySelectorAll("select");
  const cards = [];
  for (let i = 0; i < selects.length; i += 2) {
    const rank = selects[i].value;
    const suit = selects[i + 1].value;
    if (rank && suit) cards.push(rank + suit);
  }
  return cards;
}

// build deck excluding player hand
function buildDeck(excludedCards) {
  const excluded = new Set(excludedCards);
  return FULL_DECK.filter((card) => !excluded.has(card));
}

// Get random cards from deck
function drawCards(deck, count) {
  for (let i = deck.length - 1; i > deck.length - 1 - count; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(deck.length - count);
}

/** End of util function */

function normalizeHand(card1, card2) {
  const rank1 = card1[0];
  const rank2 = card2[0];
  const suit1 = card1[1];
  const suit2 = card2[1];

  // Sort by rank descending
  const [high, low] = [rank1, rank2].sort((a, b) => rankMap[b] - rankMap[a]);

  let key;
  if (high === low) {
    key = high + low; // Pair: "QQ"
  } else {
    key = high + low + (suit1 === suit2 ? "s" : "o"); // e.g., "AKs", "JTo"
  }

  return `${key}_vs_random`;
}

// Calculate hand type probabilities for both player and opponent
function calculateHandType(playerHand) {}

// Calculate winning probabilities using monte carlo simulation
function calculateWinProbability(playerHand) {
  const key = normalizeHand(playerHand[0], playerHand[1]);

  const equity = preflopEquityTable[key];

  return equity
    ? {
        win: equity,
        lose: 1 - equity,
        note: `Preflop equity for ${key}`,
      }
    : { win: 0, 
		lose: 0, 
		note: `Not found in table` };
}

// Main calculation function
function run() {
  const playerHand = getSelectedCards("player-cards");

  if (playerHand.length !== 2) {
    alert("Please select exactly 2 cards!");
    return;
  }

  if (playerHand[0] === playerHand[1]) {
    alert("Error: Duplicate cards are not allowed.");
    return;
  }

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p>Calculating...</p>";

  setTimeout(() => {
    const equity = calculateWinProbability(playerHand);

    console.log(equity);

    let resultHTML = `
		<p><strong>Win Equity:</strong> ${(equity.win * 100).toFixed(2)}%</p>
		<p><strong>Loss:</strong> ${(equity.lose * 100).toFixed(2)}%</p>
		<p><em>${equity.note}</em></p>
	  `;

    resultDiv.innerHTML = resultHTML;
  }, 10);
}

document.getElementById("btn-run").addEventListener("click", run);
