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
const STATUS_BAR = "status";
const DEAL_BUTTON = "second-button";
const CHECK_BUTTON = "third-button";
const BET3_BUTTON = "fourth-button";
const BET4_BUTTON = "fifth-button";
const BET2_BUTTON = "sixth-button";
const BET1_BUTTON = "seventh-button";
const FOLD_BUTTON = "eighth-button";
const ANTE = "ante";
const BLIND = "blind";
const PLAY = "play";
const TRIPS = "trips";

// Status constants
const CHECK0 = "0";
const CHECK3 = "1";
const CHECK5 = "2";
// CSS card rotation classes
const ROTATE_LEFT = "rotate-left";
const ROTATE_RIGHT = "rotate-right";

// Keep track of hands and cards not in deck
let usedCards = {};
let hand = {};
let communityStatus = CHECK0;
let communityRevealed = 0; // Last index of revealed cards

let tripsQualify = 0;
let tripsPayoff = [3, 5, 6, 8, 30, 40, 50];
let blindQualify = 0;
let blindPayoff = [1, 1.5, 3, 10, 50, 500];
let dealerQualify=false;

function resetDeck() {
    /*
    Resets the game
    :param None
    :return: None
    */
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

    // Set status bar
    document.getElementById(STATUS_BAR).innerHTML = "Press \"Deal\" to Start";
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
    children[index].style.transform = "rotateY(180deg)";
    children[index].innerHTML = card.innerHTML;
    console.log(children[index]);
}

function deal() {
    /*
    The player is dealt cards
    :param None
    :return: None
    */
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

    document.getElementById(STATUS_BAR).innerHTML = "Check or Bet?";
}

function check() {
    /*
    Cards/buttons are revealed as the player checks
    :param None
    :return: None
    */
    //
    handleInput(0);

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
        document.getElementById(STATUS_BAR).innerHTML = "Bet or Fold?";
    }
}

function bet(multiplier) {
    /*
    Reveals appropriate community cards, adjusts buttons, ends round.
    :param Multiplier: Bet multiplier; how much the player will win/lose.
    :return: None
    */
    //
    handleInput(multiplier);

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

function handleInput(multiplier){
  let anteBet =  document.getElementById(ANTE).value;
  let blindBet =  document.getElementById(BLIND).value;
  let tripsBet =  document.getElementById(TRIPS).value;
  if (anteBet!=blindBet){
    document.getElementById(BLIND).value = anteBet;
  }
  document.getElementById(ANTE).classList.add("readonly");
  document.getElementById(BLIND).classList.add("readonly");
  document.getElementById(TRIPS).classList.add("readonly");

  if (multiplier==1 || multiplier==2 || multiplier==3 || multiplier==4 ){
    document.getElementById(PLAY).value = multiplier * anteBet;
  }

}

function payCalculation(multiplier) {
  let anteBet =  document.getElementById(ANTE).value;
  let blindBet =  document.getElementById(BLIND).value;
  let playBet =  document.getElementById(PLAY).value;
  let tripsBet =  document.getElementById(TRIPS).value;
  let endTotal = 0;
  let finalMsg = "";
  console.log(anteBet);
  console.log(blindBet);
  console.log(playBet);
  console.log(tripsBet);
  if (tripsQualify>-1){
    tripsBet = parseInt(tripsBet)*tripsPayoff[tripsQualify];
  } else{
    tripsBet = parseInt(tripsBet)*(-1);
  }
  if (blindQualify>-1){
    blindBet = parseInt(blindBet)*blindPayoff[blindQualify];
  }

  if (multiplier==0){
    endTotal = (-2)*parseInt(anteBet) + tripsBet;
    finalMsg ="Round has ended. Dealer wins! You have lost $"+endTotal;
  }
  else if (multiplier==1){
    if (blindQualify<0){
      blindBet *= -1;
    }
    endTotal =  blindBet + tripsBet - parseInt(anteBet) - parseInt(playBet);
    finalMsg ="Round has ended. Dealer wins! You have lost $"+endTotal;
  }
  else if (multiplier==2){
    if (blindQualify<0){
      blindBet = 0;
    }
    if (!dealerQualify){
        endTotal = parseInt(playBet) + blindBet + tripsBet;
    }
    else{
      endTotal = parseInt(anteBet) + parseInt(playBet) + blindBet + tripsBet;
    }
    finalMsg ="Round has ended. PLayer wins! You have won $"+endTotal;
  }
  document.getElementById(STATUS_BAR).innerHTML = finalMsg;
}


function endRound(multiplier) {
    // TODO: Decide who wins, how much player wins/loses based on the cards
    // multiplier: -1 means fold, rest mean bet times multiplier
    payCalculation(2);

}

function revealRest() {
    /*
    Reveal all cards
    :param None
    :return: None
    */
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
    /*
    Reveals table cards
    :param num: Number of cards to be revealed
    :return: None
    */
    for (let i=communityRevealed; i<Math.min(communityRevealed+num, 5); i++){
        revealCard(COMMUNITY, hand[COMMUNITY][i][0], hand[COMMUNITY][i][1], i);
    }
    communityRevealed = Math.min(communityRevealed+num, 5);
}

function revealPlayer(player) {
    /*
    Reveal cards of player/dealer
    :param player: string representing player/dealer/community
    :return: None
    */
    for (let i=0; i<2; i++){
        revealCard(player, hand[player][i][0], hand[player][i][1], i);
    }
}

function newCard(owner) {
    /*
    Generates a card (not the HTML)
    :param owner: string representing player/dealer/community
    :return: None
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
    return card;
}

function getCardHTML(face, suit) {
    /*
    Get HTML elements for displaying card
    :param face: string of face value
    :param suit: string of suit value
    :return: HTML elements
    */
    let rotation = Math.floor(Math.random() * 2);
    let rotationCSS = rotation ? ROTATE_LEFT : ROTATE_RIGHT;

    let cardWrapper = document.createElement("div");
    cardWrapper.setAttribute("class", "card-wrapper");

    let card = document.createElement("div");
    card.setAttribute("class", `card ${rotationCSS}`);

    let wrapper = document.createElement("div");
    wrapper.style.padding = 0;
    wrapper.setAttribute("class", "col");

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
        wrapper.appendChild(backSide);
    } else {
        let top = document.createElement("div");
        top.setAttribute("class", "card-body text-left text-dark");
        top.style.padding = "20px";
        top.style.paddingLeft = "15px"
        top.style.paddingTop = "12px";
        top.innerHTML = `<h3 class="card-text${colour}">${face} ${suitIcons[suit]}</h3>`;
        let middle = document.createElement("div");
        middle.setAttribute("class", "card-body text-center text-dark");
        middle.innerHTML = `<h1 style="font-size: 60px" class="card-text${colour}">${suitIcons[suit]}</h1>`;
        let bottom = document.createElement("div");
        bottom.setAttribute("class", "card-body text-left text-dark");
        bottom.innerHTML = `<h3 class="card-text${colour} rotated">${face} ${suitIcons[suit]}</h3>`;
        bottom.style.paddingTop = 0;
        bottom.style.paddingRight = "15px";
        wrapper.style.transform = "rotateY(180deg)";
        wrapper.appendChild(top);
        wrapper.appendChild(middle);
        wrapper.appendChild(bottom);
    }

    card.appendChild(wrapper);
    cardWrapper.appendChild(card);
    return cardWrapper;
}

function setup() {
    /*
    Initializes the deck and sets up the table.
    :param None
    :return: None
    */
    resetDeck();
    showEmptyCards(PLAYER, 2);
    showEmptyCards(DEALER, 2);
    showEmptyCards(COMMUNITY, 5);
}

window.onload = setup;
