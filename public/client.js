// Face values
const faces = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
// Suit icons
const suits =["C", "D", "H", "S"];
const suitIcons = {C: "&clubs;", D: "&diams;", H: "&hearts;", S: "&spades;"};

// Keep track of hands and cards not in deck
let usedCards = {};
let hand = {
    dealer: [],
    player: []
};

function resetDeck() {
    let dealerEle = document.getElementById("dealerHand");
    let playerEle = document.getElementById("playerHand");
    dealerEle.innerHTML = "";
    playerEle.innerHTML = "";
    hand.dealer = [];
    hand.player = [];
    usedCards = {};
    for (let i=0; i<faces.length; i++) {
        usedCards[faces[i]] = [];
    }
}

function showEmptyCards(player) {
    /*
    Display hand of unknown cards
    :param player: bool of player or dealer
    */
    let eleId = "dealerHand";
    if (player) {
        eleId = "playerHand";
    }
    let ele = document.getElementById(eleId);
    for (let i=0; i<5; i++) {
        let card = newCard(player);
        ele.appendChild(card);
    }
    console.log("Used cards:", usedCards);
    console.log("Hands:", hand);
}

function revealCard(player, face, suit) {
    /*
    Reveal specific card
    :param player: bool of player or dealer
    :param face: string of face value
    :param suit: string of suit value
    */
}

function newCard(player) {
    /*
    Generate a new card from deck
    */
    // TEST: currently showing the cards, but eventually we want it to it only shows the back of card
    let newCard = true;
    let f = 0;
    let s = 0;
    while (newCard) {
        f = Math.floor(Math.random() * faces.length);
        s = Math.floor(Math.random() * suits.length);
        if (!usedCards[faces[f]].includes(suits[s])) { // Check if card already taken from deck
            newCard = false
        }
    }

    // Update cards
    usedCards[faces[f]].push(suits[s]);
    if (player) {
        hand.player.push([faces[f], suits[s]]);
    } else {
        hand.dealer.push([faces[f], suits[s]]);
    }

    let card = getCardHTML(faces[f], suits[s]);
    return card
}

function getCardHTML(face, suit) {
    /*
    Get HTML elements for displaying card
    :param face: string of face value
    :param suit: string of suit value
    :return: HTML elements
    */
    let card = document.createElement("div");
    card.setAttribute("class", "card mw-25");

    let top = document.createElement("div");
    top.setAttribute("class", "card-body text-left");
    top.innerHTML = `<h5 class="card-text">${face} ${suitIcons[suit]}</h5>`;
    let middle = document.createElement("div");
    middle.setAttribute("class", "card-body text-center");
    middle.innerHTML = `<h1 class="card-text">${suitIcons[suit]}</h1>`;
    let bottom = document.createElement("div");
    bottom.setAttribute("class", "card-body text-left");
    bottom.innerHTML = `<h5 class="card-text rotated">${face} ${suitIcons[suit]}</h5>`;

    card.appendChild(top);
    card.appendChild(middle);
    card.appendChild(bottom);

    return card
}

function setup() {
    resetDeck();
    showEmptyCards(true);
    showEmptyCards(false);
}

window.onload = setup;