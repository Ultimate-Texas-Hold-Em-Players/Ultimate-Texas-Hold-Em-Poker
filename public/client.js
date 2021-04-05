// Face values
const faces = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
// Suit icons
const suits =["C", "D", "H", "S"];
const suitIcons = {C: "&clubs;", D: "&diams;", H: "&hearts;", S: "&spades;"};
// HTML card hand constants
const PLAYER = "playerHand";
const DEALER = "dealerHand";
const COMMUNITY = "communityCards";


// Keep track of hands and cards not in deck
let usedCards = {};
let hand = {};

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
    usedCards = {};
    for (let i=0; i<faces.length; i++) {
        usedCards[faces[i]] = [];
    }
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
    let children = document.getElementById(PLAYER).childNodes;
    let cLength = document.getElementById(PLAYER).childNodes.length;
    console.log(cLength);
    let card = getCardHTML(face, suit);
    console.log(card);
    children[index].innerHTML = card.innerHTML;
    console.log(children[index]);
}

function deal() {
  console.log(hand[PLAYER][0][0]);
  console.log(hand[PLAYER][0][1]);
  for (let i=0; i<2; i++){
    revealCard(PLAYER, hand[PLAYER][i][0], hand[PLAYER][i][1], i);
  }
  let secondButton = document.getElementById("second-button");
  let thirdButton = document.getElementById("third-button");
  let fourthButton = document.getElementById("fourth-button");
  let fifthButton = document.getElementById("fifth-button");
  secondButton.classList.add("hide");
  thirdButton.classList.remove("hide");
  fourthButton.classList.remove("hide");
  fifthButton.classList.remove("hide");

}

function newCard(owner) {
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


    if (suit=='N'){
      let backSide = document.createElement("IMG");
      backSide.setAttribute("src", "backSide.png");
      backSide.setAttribute("width", "190");
      backSide.setAttribute("height", "228");
      backSide.setAttribute("alt", "Back Side of Card");
      let wrapper = document.createElement("div");
      wrapper.setAttribute("class", "col");
      wrapper.appendChild(backSide);
      card.appendChild(wrapper);
    }
    else{
      let top = document.createElement("div");
      top.setAttribute("class", "card-body text-left text-dark");
      top.innerHTML = `<h5 class="card-text">${face} ${suitIcons[suit]}</h5>`;
      let middle = document.createElement("div");
      middle.setAttribute("class", "card-body text-center text-dark");
      middle.innerHTML = `<h1 class="card-text">${suitIcons[suit]}</h1>`;
      let bottom = document.createElement("div");
      bottom.setAttribute("class", "card-body text-left text-dark");
      bottom.innerHTML = `<h5 class="card-text rotated">${face} ${suitIcons[suit]}</h5>`;

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
