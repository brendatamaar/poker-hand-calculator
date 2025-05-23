const rankMap = {
  2: 0,
  3: 1,
  4: 2,
  5: 3,
  6: 4,
  7: 5,
  8: 6,
  9: 7,
  10: 8,
  J: 9,
  Q: 10,
  K: 11,
  A: 12,
};
const ranks = Object.keys(rankMap);
const suits = ["c", "d", "h", "s"];

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

function getCard() {
  const playerCards = getSelectedCards("player-cards");

  document.getElementById("result").innerHTML = `
		  <h3>Player Card:</h3>
		  Card: ${playerCards}<br>
		  
		`;
}

populateDropdowns();
