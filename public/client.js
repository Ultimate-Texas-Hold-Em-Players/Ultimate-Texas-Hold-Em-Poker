// Face values
const faces = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
// Suit icons
const suits =["C", "D", "H", "S"];
const suitIcons = {C: "&clubs;", D: "&diams;", H: "&hearts;", S: "&spades;"};
// Card outcomes
const hand_values = {
    lower_than_one_pair: 0,
    one_pair: 1,
    two_pair: 2,
    triple: 3,
    straight: 4,
    flush: 5,
    full_house: 6,
    quads: 7,
    straight_flush: 8,
    royal_flush: 9
}
const face_values = {
    '2': 1,
    '3': 2,
    '4': 3,
    '5': 4,
    '6': 5,
    '7': 6,
    '8': 7,
    '9': 8,
    '10': 9,
    'J': 10,
    'Q': 11,
    'K': 12,
    'A': 13
}
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

    let winner = "";

    // Get best 5 card hand of PLAYER
    let player_hand_value = findBestHand(PLAYER);
    let best_player_hand = player_hand_value[0];
    let best_player_hand_value = player_hand_value[1];

    // Get best 5 card hand of DEALER
    let dealer_hand_value = findBestHand(DEALER);
    let best_dealer_hand = dealer_hand_value[0];
    let best_dealer_hand_value = dealer_hand_value[1];

    // PLAYER vs DEALER
    if (hand_values[best_player_hand_value] > hand_values[best_dealer_hand_value]) {
        winner = "Player";
    } else if (hand_values[best_player_hand_value] < hand_values[best_dealer_hand_value]) {
        winner = "Dealer";
    } else {
        // Calculate total face value of best 5-card hands
        let player_value = getTotalFaceValues(best_player_hand);
        let dealer_value = getTotalFaceValues(best_dealer_hand);

        if (player_value > dealer_value) {
            winner = "Player";
        } else if (player_value < dealer_value) {
            winner = "Dealer";
        } else {
            winner = "Nobody";
        }
    }

    let player_payout = getPayout();

    document.getElementById(STATUS_BAR).innerHTML = `Your best hand: _. Dealer's best hand: _. ${winner} wins!\nYou have won/lost $${player_payout}`;
}

function findBestHand(player) {
    /*
    Find player's best 5-card hand
    :param cards: Object representing a card hand
    :return: Object of player's best 5-card hand and hand value
    */
    let wholeHand = hand[COMMUNITY].concat(hand[player]);
    
    let royalFlushHand = getRoyalFlush();
    if (royalFlush) {
        return (royalFlushHand, "royal_flush");
    }

    let straightFlushHand = getStraightFlush();
    if (straightFlushHand) {
        return (straightFlushHand, "straight_flush");
    }

    let quadsHand = getQuads();
    if (quadsHand) {
        return (quadsHand, "quads");
    }

    let fullHouse = getFullhouse();
    if (fullHouse) {
        return (fullHouse, "full_house");
    }

    let flushHand = getFlush();
    if (flushHand) {
        return (flushHand, "flush");
    }

    let straightHand = getStraight();
    if (straightHand) {
        return (straightHand, "straight");
    }

    let tripleHand = getTriple();
    if (tripleHand) {
        return (tripleHand, "triple");
    }

    let twoPair = getTwoPair();
    if (twoPair) {
        return (twoPair, "two_pair");
    }

    let onePair = getOnePair();
    if (onePair) {
        return (onePair, "one_pair");
    }
    
    // If lower than a pair
    return (getBestFaceValueHand(wholeHand, 5), "lower_than_one_pair");
}

function getTotalFaceValues(cards) {
    /*
    Calculate value of hand based on face
    :param cards: Object representing a card hand
    :return: Int value
    */
    let sum = 0;
    for (let i=0; i<cards.length; i++) {
        let face = cards[i][0];
        sum += face_values[face];
    }
    return sum
}

function getPayout() {
    return 0;
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

/* Card outcome helpers */

function getBestFaceValueHand(cards, num) {
    /*
    Find the best 5 cards of a 7-card hand based solely on face value
    :param cards: Object representing a 7-card hand
    :return: Object representing a num-card hand
    */
    cards.sort(function(c1, c2){return c2[0]-c1[0]});
    return cards.slice(0, num);
}

function getRoyalFlush(cards) {

}

function getStraightFlush(cards) {

}

function getQuads(cards) {

}

function getFullhouse(cards) {

}

function getFlush(cards) {

}

function getStraight(cards) {

}

function getTriple(cards) {
    /*
    Checks if a 7-card hand contains a triple
    :param cards: Object representing a 7-card hand
    :return: Boolean
    */
    return True
}

function getTwoPair(cards) {

}

function getOnePair(cards) {

}

/* End of card outcome helpers */

function setup() {
    /*
    Initializes the deck and sets up the table.
    :param: None
    :return: None
    */
    resetDeck();
    showEmptyCards(PLAYER, 2);
    showEmptyCards(DEALER, 2);
    showEmptyCards(COMMUNITY, 5);
}

window.onload = setup;
