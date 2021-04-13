// Face values
const faces = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
// Suit icons
const suits =["C", "D", "H", "S"];
const suitIcons = {C: "&clubs;", D: "&diams;", H: "&hearts;", S: "&spades;"};
// HTML card hand constants
const PLAYER = "playerHand";
const DEALER = "dealerHand";
const COMMUNITY = "communityCards";
// HTML element constants
const DEAL_BUTTON = "second-button";
const CHECK_BUTTON = "third-button";
const BET3_BUTTON = "fourth-button";
const BET4_BUTTON = "fifth-button";
const BET2_BUTTON = "sixth-button";
const BET1_BUTTON = "seventh-button";
const FOLD_BUTTON = "eighth-button";
// Status constants
const CHECK0 = "0";
const CHECK3 = "1";
const CHECK5 = "2";

// Keep track of hands and cards not in deck
let usedCards = {};
let hand = {};
let communityStatus = CHECK0;
let communityRevealed = 0; // Last index of revealed cards


function resetDeck() {
    let dealerEle = document.getElementById(DEALER);
    let playerEle = document.getElementById(PLAYER);
    let communityEle = document.getElementById(COMMUNITY);
    dealerEle.innerHTML = "";
    playerEle.innerHTML = "";
    communityEle.innerHTML = "";
    hand[DEALER] = [];
    hand[PLAYER] = [];
    hand[COMMUNITY] = [];
    communityStatus = CHECK0;
    communityRevealed = 0;
    usedCards = {};
    for (let i=0; i<faces.length; i++) {
        usedCards[faces[i]] = [];
    }

    // Enable/disable buttons
    document.getElementById(DEAL_BUTTON).classList.remove("hide");
    document.getElementById(CHECK_BUTTON).classList.add("hide");
    document.getElementById(BET3_BUTTON).classList.add("hide");
    document.getElementById(BET4_BUTTON).classList.add("hide");
    document.getElementById(BET2_BUTTON).classList.add("hide");
    document.getElementById(BET1_BUTTON).classList.add("hide");
    document.getElementById(FOLD_BUTTON).classList.add("hide");
}

function showEmptyCards(owner, num) {
    /*
    Display hand of unknown cards
    :param owner: player, dealer or community
    :param num: number of cards to generate
    */
    let ele = document.getElementById(owner);
    for (let i=0; i<num; i++) {
        let card = newCard(owner);
        ele.appendChild(card);
    }
    console.log("Used cards:", usedCards);
    console.log("Hands:", hand);
}

function revealCard(player, face, suit, index) {
    /*
    Reveal specific card
    :param player: bool of player or dealer
    :param face: string of face value
    :param suit: string of suit value
    */
    let children = document.getElementById(player).childNodes;
    let cLength = document.getElementById(player).childNodes.length;
    console.log(cLength);
    let card = getCardHTML(face, suit);
    console.log(card);
    children[index].innerHTML = card.innerHTML;
    console.log(children[index]);
}

function deal() {
  console.log(hand[PLAYER][0][0]);
  console.log(hand[PLAYER][0][1]);
  revealPlayer(PLAYER);
  let secondButton = document.getElementById(DEAL_BUTTON);
  let thirdButton = document.getElementById(CHECK_BUTTON);
  let fourthButton = document.getElementById(BET3_BUTTON);
  let fifthButton = document.getElementById(BET4_BUTTON);

  secondButton.classList.add("hide");
  thirdButton.classList.remove("hide");
  fourthButton.classList.remove("hide");
  fifthButton.classList.remove("hide");
}

function check() {
    if (communityStatus == CHECK0) {
        // If no cards checked, check first 3
        communityStatus = CHECK3;
        revealCommunity(3);
        // Disable/enable buttons
        document.getElementById(BET3_BUTTON).classList.add("hide");
        document.getElementById(BET4_BUTTON).classList.add("hide");
        document.getElementById(BET2_BUTTON).classList.remove("hide");
    } else if (communityStatus == CHECK3) {
        // If 3 cards checked, check last 2
        communityStatus = CHECK5;
        revealCommunity(2);
        // Disable/enable buttons
        document.getElementById(CHECK_BUTTON).classList.add("hide");
        document.getElementById(BET2_BUTTON).classList.add("hide");
        document.getElementById(FOLD_BUTTON).classList.remove("hide");
        document.getElementById(BET1_BUTTON).classList.remove("hide");
    }
}

function bet(multiplier) {
    // Reveal all cards
    revealRest();
    endRound(multiplier);

    // Disable all buttons
    document.getElementById(DEAL_BUTTON).classList.add("hide");
    document.getElementById(CHECK_BUTTON).classList.add("hide");
    document.getElementById(BET3_BUTTON).classList.add("hide");
    document.getElementById(BET4_BUTTON).classList.add("hide");
    document.getElementById(BET2_BUTTON).classList.add("hide");
    document.getElementById(BET1_BUTTON).classList.add("hide");
    document.getElementById(FOLD_BUTTON).classList.add("hide");
}

function endRound(multiplier) {
    // TODO: Decide who wins, how much player wins/loses based on the cards
    // multiplier: -1 means fold, rest mean bet times multiplier
}

function revealRest() {
    // Reveal all community
    if (communityStatus == CHECK0) {
        // If no cards checked, check all
        revealCommunity(5);
    } else if (communityStatus == CHECK3) {
        // If 3 cards checked, check last 2
        revealCommunity(2);
    }
    communityStatus = CHECK5;
    // Reveal dealer
    revealPlayer(DEALER);
}

function revealCommunity(num) {
    for (let i=communityRevealed; i<Math.min(communityRevealed+num, 5); i++){
        revealCard(COMMUNITY, hand[COMMUNITY][i][0], hand[COMMUNITY][i][1], i);
    }
    communityRevealed = Math.min(communityRevealed+num, 5);
}

function revealPlayer(player) {
    // Reveal cards of player/dealer
    for (let i=0; i<2; i++){
        revealCard(player, hand[player][i][0], hand[player][i][1], i);
    }
}

function newCard(owner) {
    /*
    Generate a new card from deck
    */
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
    hand[owner].push([faces[f], suits[s]]);

    let card = getCardHTML(0, 'N');
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
    card.setAttribute("class", "card");
    let colour = "";
    if (suit == 'H' || suit == 'D') {
        colour = " text-danger";
    }

    if (suit=='N') {
        let backSide = document.createElement("IMG");
        backSide.setAttribute("src", "backSide.png");
        backSide.setAttribute("width", "190");
        backSide.setAttribute("height", "228");
        backSide.setAttribute("alt", "Back Side of Card");
        let wrapper = document.createElement("div");
        wrapper.setAttribute("class", "col");
        wrapper.appendChild(backSide);
        card.appendChild(wrapper);
    } else {
        let top = document.createElement("div");
        top.setAttribute("class", "card-body text-left text-dark");
        top.innerHTML = `<h5 class="card-text${colour}">${face} ${suitIcons[suit]}</h5>`;
        let middle = document.createElement("div");
        middle.setAttribute("class", "card-body text-center text-dark");
        middle.innerHTML = `<h1 class="card-text${colour}">${suitIcons[suit]}</h1>`;
        let bottom = document.createElement("div");
        bottom.setAttribute("class", "card-body text-left text-dark");
        bottom.innerHTML = `<h5 class="card-text${colour} rotated">${face} ${suitIcons[suit]}</h5>`;

        let wrapper = document.createElement("div");
        wrapper.setAttribute("class", "col");
        wrapper.appendChild(top);
        wrapper.appendChild(middle);
        wrapper.appendChild(bottom);

        card.appendChild(wrapper);

    }

    return card
}

function setup() {
    resetDeck();
    showEmptyCards(PLAYER, 2);
    showEmptyCards(DEALER, 2);
    showEmptyCards(COMMUNITY, 5);
}

window.onload = setup;
