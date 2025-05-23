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
const suits = ["c", "d", "h", "s"];

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

function populateDropdowns() {
  document.querySelectorAll(".rank").forEach((select) => {
    select.innerHTML += ranks
      .map((r) => `<option value="${r}">${r}</option>`)
      .join("");
  });
  document.querySelectorAll(".suit").forEach((select) => {
    select.innerHTML += suits
      .map((s) => `<option value="${s}">${s}</option>`)
      .join("");
  });
}

populateDropdowns();

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

// build excluded deck without player hands
function buildExcludedDeck(excludedCards) {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      const card = rank + suit;
      if (!excludedCards.includes(card)) deck.push(card);
    }
  }
  return deck;
}

// Get random cards from deck
function drawCards(deck, count) {
  const cards = [];
  const availableCards = [...deck];

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * availableCards.length);
    cards.push(availableCards.splice(idx, 1)[0]);
  }

  return cards;
}

// Generate all combinations of 5 cards from 7
function getCombinations(cards, k) {
  const combinations = [];

  function backtrack(start, current) {
    if (current.length === k) {
      combinations.push([...current]);
      return;
    }

    for (let i = start; i < cards.length; i++) {
      current.push(cards[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return combinations;
}

// Evaluate a 5-card hand
function evaluateHand(hand) {
  if (hand.length !== 5) {
    throw new Error("Hand must contain exactly 5 cards");
  }

  const ranks = hand.map((card) => rankMap[card[0]]).sort((a, b) => b - a);
  const suits = hand.map((card) => card[1]);

  // Count ranks
  const rankCounts = {};
  ranks.forEach((rank) => (rankCounts[rank] = (rankCounts[rank] || 0) + 1));
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const uniqueRanks = Object.keys(rankCounts)
    .map(Number)
    .sort((a, b) => b - a);

  // Check for flush
  const isFlush = suits.every((suit) => suit === suits[0]);

  // Check for straight
  let isStraight = false;
  if (uniqueRanks.length === 5) {
    // Regular straight
    if (uniqueRanks[0] - uniqueRanks[4] === 4) {
      isStraight = true;
    }
    // Ace-low straight (A, 5, 4, 3, 2)
    else if (
      uniqueRanks[0] === 14 &&
      uniqueRanks[1] === 5 &&
      uniqueRanks[2] === 4 &&
      uniqueRanks[3] === 3 &&
      uniqueRanks[4] === 2
    ) {
      isStraight = true;
      uniqueRanks[0] = 1; // Treat ace as low
      uniqueRanks.sort((a, b) => b - a);
    }
  }

  // Determine hand type and strength
  if (isStraight && isFlush) {
    if (uniqueRanks[0] === 14 && uniqueRanks[1] === 13) {
      return { type: "Royal Flush", strength: 10, primary: 14 };
    }
    return { type: "Straight Flush", strength: 9, primary: uniqueRanks[0] };
  }

  if (counts[0] === 4) {
    const fourKind = uniqueRanks.find((rank) => rankCounts[rank] === 4);
    const kicker = uniqueRanks.find((rank) => rankCounts[rank] === 1);
    return {
      type: "Four of a Kind",
      strength: 8,
      primary: fourKind,
      secondary: kicker,
    };
  }

  if (counts[0] === 3 && counts[1] === 2) {
    const threeKind = uniqueRanks.find((rank) => rankCounts[rank] === 3);
    const pair = uniqueRanks.find((rank) => rankCounts[rank] === 2);
    return {
      type: "Full House",
      strength: 7,
      primary: threeKind,
      secondary: pair,
    };
  }

  if (isFlush) {
    return {
      type: "Flush",
      strength: 6,
      primary: uniqueRanks[0],
      kickers: uniqueRanks.slice(1),
    };
  }

  if (isStraight) {
    return { type: "Straight", strength: 5, primary: uniqueRanks[0] };
  }

  if (counts[0] === 3) {
    const threeKind = uniqueRanks.find((rank) => rankCounts[rank] === 3);
    const kickers = uniqueRanks
      .filter((rank) => rankCounts[rank] === 1)
      .sort((a, b) => b - a);
    return {
      type: "Three of a Kind",
      strength: 4,
      primary: threeKind,
      kickers: kickers,
    };
  }

  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = uniqueRanks
      .filter((rank) => rankCounts[rank] === 2)
      .sort((a, b) => b - a);
    const kicker = uniqueRanks.find((rank) => rankCounts[rank] === 1);
    return {
      type: "Two Pair",
      strength: 3,
      primary: pairs[0],
      secondary: pairs[1],
      kicker: kicker,
    };
  }

  if (counts[0] === 2) {
    const pair = uniqueRanks.find((rank) => rankCounts[rank] === 2);
    const kickers = uniqueRanks
      .filter((rank) => rankCounts[rank] === 1)
      .sort((a, b) => b - a);
    return { type: "One Pair", strength: 2, primary: pair, kickers: kickers };
  }

  return {
    type: "High Card",
    strength: 1,
    primary: uniqueRanks[0],
    kickers: uniqueRanks.slice(1),
  };
}

// Find best 5-card hand from 7 cards
function findBestHand(sevenCards) {
  const combinations = getCombinations(sevenCards, 5);
  let bestHand = null;
  let bestEvaluation = null;

  for (const combo of combinations) {
    const evaluation = evaluateHand(combo);

    if (
      !bestEvaluation ||
      compareHandEvaluations(evaluation, bestEvaluation) > 0
    ) {
      bestHand = combo;
      bestEvaluation = evaluation;
    }
  }

  return bestEvaluation;
}

// Compare two hand evaluations (1=first wins, 0.5=tie, 0=second wins)
function compareHandEvaluations(eval1, eval2) {
  if (eval1.strength > eval2.strength) return 1;
  if (eval1.strength < eval2.strength) return 0;

  if (eval1.primary > eval2.primary) return 1;
  if (eval1.primary < eval2.primary) return 0;

  if (eval1.secondary !== undefined && eval2.secondary !== undefined) {
    if (eval1.secondary > eval2.secondary) return 1;
    if (eval1.secondary < eval2.secondary) return 0;
  }

  if (eval1.kicker !== undefined && eval2.kicker !== undefined) {
    if (eval1.kicker > eval2.kicker) return 1;
    if (eval1.kicker < eval2.kicker) return 0;
  }

  if (eval1.kickers && eval2.kickers) {
    for (
      let i = 0;
      i < Math.min(eval1.kickers.length, eval2.kickers.length);
      i++
    ) {
      if (eval1.kickers[i] > eval2.kickers[i]) return 1;
      if (eval1.kickers[i] < eval2.kickers[i]) return 0;
    }
  }

  return 0.5; // Tie
}

// Calculate hand type probabilities for player
function calculatePlayerHandTypeProbabilities(playerHand, iterations = 1000) {
  const handCounts = {};
  HAND_TYPES.forEach((type) => (handCounts[type] = 0));

  for (let i = 0; i < iterations; i++) {
    const deck = buildExcludedDeck(playerHand);
    const communityCards = drawCards(deck, 5);
    const playerSevenCards = [...playerHand, ...communityCards];
    const playerBestHand = findBestHand(playerSevenCards);

    handCounts[playerBestHand.type]++;
  }

  // Convert counts to percentages
  const results = {};
  HAND_TYPES.forEach((type) => {
    results[type] = ((handCounts[type] / iterations) * 100).toFixed(2) + "%";
  });

  return results;
}

// Calculate hand type probabilities for both player and opponent
function calculate(playerHand, iterations) {
  const playerHandCounts = {};
  const opponentHandCounts = {};

  HAND_TYPES.forEach((type) => {
    playerHandCounts[type] = 0;
    opponentHandCounts[type] = 0;
  });

  for (let i = 0; i < iterations; i++) {
    const deck = buildExcludedDeck(playerHand);

    // Deal opponent cards and community cards
    const opponentHand = drawCards(deck, 2);
    const communityCards = drawCards(deck, 5);

    // Create 7-card hands for both players
    const playerSevenCards = [...playerHand, ...communityCards];
    const opponentSevenCards = [...opponentHand, ...communityCards];

    // Find best hands for both players
    const playerBestHand = findBestHand(playerSevenCards);
    const opponentBestHand = findBestHand(opponentSevenCards);

    // Count hand types
    playerHandCounts[playerBestHand.type]++;
    opponentHandCounts[opponentBestHand.type]++;
  }

  // Convert counts to percentages
  const playerResults = {};
  const opponentResults = {};

  HAND_TYPES.forEach((type) => {
    playerResults[type] =
      ((playerHandCounts[type] / iterations) * 100).toFixed(2) + "%";
    opponentResults[type] =
      ((opponentHandCounts[type] / iterations) * 100).toFixed(2) + "%";
  });

  return { player: playerResults, opponent: opponentResults };
}

// Main calculation function
function run() {
  const playerHand = getSelectedCards("player-cards");
  const simulationCount = 10;

  if (playerHand.length !== 2) {
    alert("Please select exactly 2 cards!");
    return;
  }

  if (playerHand[0] === playerHand[1]) {
    alert("Error: Duplicate cards are not allowed.");
    return;
  }

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p>Calculating... (1000 simulations)</p>";

  setTimeout(() => {
    // Calculate winning probability
    const equity = simulate(playerHand, simulationCount);

    // Calculate hand type probabilities for both player and opponent
    const handProbs = calculate(playerHand, simulationCount);

    // Display results
    let resultHTML = `
		<h3>Player Hand: ${playerHand.join(", ")}</h3>
		<h4>Winning probability (vs 1 opponent with 5 community cards):</h4>
		<p>Win Probability: ${equity.winProb}%</p>
		<p>Tie Probability: ${equity.tieProb}%</p>
		<p>Lose Probability: ${equity.loseProb}%</p>
		
		<h4>Hand Type Probabilities Comparison:</h4>
		<table>
		  <tr><th>Hand Type</th><th>Player</th><th>Opponent</th></tr>
	  `;

    HAND_TYPES.forEach((type) => {
      resultHTML += `<tr><td>${type}</td><td>${handProbs.player[type]}</td><td>${handProbs.opponent[type]}</td></tr>`;
    });

    resultHTML += `
		</table>
		<p><small>Based on ${simulationCount} simulation(s)</small></p>
	  `;

    resultDiv.innerHTML = resultHTML;
  }, 10);
}

// Main simulation function
function simulate(playerHand, iterations) {
  let wins = 0,
    ties = 0,
    losses = 0;

  for (let i = 0; i < iterations; i++) {
    const deck = buildExcludedDeck(playerHand);

    // Deal opponent cards and community cards
    const opponentHand = drawCards(deck, 2);
    const communityCards = drawCards(deck, 5);

    // Create 7-card hands for both players
    const playerSevenCards = [...playerHand, ...communityCards];
    const opponentSevenCards = [...opponentHand, ...communityCards];

    // Find best 5-card hands
    const playerBestHand = findBestHand(playerSevenCards);
    const opponentBestHand = findBestHand(opponentSevenCards);

    // Compare hands
    const result = compareHandEvaluations(playerBestHand, opponentBestHand);

    if (result === 1) wins++;
    else if (result === 0.5) ties++;
    else losses++;
  }

  return {
    winProb: ((wins / iterations) * 100).toFixed(2),
    tieProb: ((ties / iterations) * 100).toFixed(2),
    loseProb: ((losses / iterations) * 100).toFixed(2),
  };
}
