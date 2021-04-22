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
// HTML label constants
const PLAYER_LBL = "playerLbl";
const DEALER_LBL = "dealerLbl";
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

//Variables that determine if the player's hand qualifies for the trips and blind bet
let tripsQualify = -1;
let tripsPayoff = [3, 5, 6, 8, 30, 40, 50];
let blindQualify = -1;
let blindPayoff = [1, 1.5, 3, 10, 50, 500];
let dealerQualify = false;
let playerFold = false;
function resetDeck() {
    /*
    Resets the game
    :param None
    :return: None
    */
    let dealerEle = document.getElementById(DEALER);
    let playerEle = document.getElementById(PLAYER);
    let communityEle = document.getElementById(COMMUNITY);
    let dealerLbl = document.getElementById(DEALER_LBL);
    let playerLbl = document.getElementById(PLAYER_LBL);
    dealerEle.innerHTML = "";
    playerEle.innerHTML = "";
    communityEle.innerHTML = "";
    dealerLbl.innerHTML = "Dealer's Cards";
    playerLbl.innerHTML = "Player's Cards";
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

    //make the inputs to the ante and trips bets accessable again
    document.getElementById(ANTE).readOnly = false;
    document.getElementById(TRIPS).readOnly = false;
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
    let card = getCardHTML(face, suit);
    children[index].style.transform = "rotateY(180deg)";
    children[index].innerHTML = card.innerHTML;
}

function deal() {
    /*
    The player is dealt cards
    :param None
    :return: None
    */
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
    if (multiplier==-1){
      playerFold = true;
    }
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

    //reset variables
    tripsQualify = -1;
    blindQualify = -1;
    dealerQualify = false;
    playerFold = false;
}

function handleInput(multiplier){
  /*
  Make it so the bets are readonly after the user bets or checks and make the anteBet and blindBet equal
  */
  let anteBet =  document.getElementById(ANTE).value;
  let blindBet =  document.getElementById(BLIND).value;
  let tripsBet =  document.getElementById(TRIPS).value;
  if (anteBet!=blindBet){
    document.getElementById(BLIND).value = anteBet;
  }
  document.getElementById(ANTE).readOnly = true;
  document.getElementById(TRIPS).readOnly = true;
  if (multiplier==1 || multiplier==2 || multiplier==3 || multiplier==4){
    document.getElementById(PLAY).value = multiplier * anteBet;
  }

}

function getPayout(multiplier) {
  /*
  Decide  how much player wins/loses based on the cards and prepare the final message
  */
  let anteBet =  document.getElementById(ANTE).value;
  let blindBet =  document.getElementById(BLIND).value;
  let playBet =  document.getElementById(PLAY).value;
  let tripsBet =  document.getElementById(TRIPS).value;
  let endTotal = 0;
  let finalMsg = "";
  let payCalcMsg = "";
  console.log("Pay Calculation:");
  if (tripsQualify>-1){
    tripsBet = parseInt(tripsBet)*tripsPayoff[tripsQualify];
  } else{
    tripsBet = parseInt(tripsBet)*(-1);
  }
  if (blindQualify>-1){
    blindBet = parseInt(blindBet)*blindPayoff[blindQualify];
  }

  if (multiplier==0){
    if (!dealerQualify){
      endTotal = (-1)*parseInt(anteBet) + tripsBet;
      payCalcMsg ="Total = "+endTotal+" = -"+parseInt(anteBet)+" (Ante Bet) ";
      if (tripsBet>0){
        payCalcMsg +="+"+tripsBet+" (Trips bet)";
      }else if (tripsBet==0){
        payCalcMsg +="-"+tripsBet+" (Trips bet)";
      }
      else{
        payCalcMsg +=tripsBet+" (Trips bet)";
      }
    }else{
      endTotal = (-2)*parseInt(anteBet) + tripsBet;
      payCalcMsg ="Total = "+endTotal+" = -"+parseInt(anteBet)+" (Ante Bet) -"+anteBet+" (Blind Bet) ";
      if (tripsBet>0){
        payCalcMsg +="+"+tripsBet+" (Trips bet)";
      }else if (tripsBet==0){
        payCalcMsg +="-"+tripsBet+" (Trips bet)";
      }
      else{
        payCalcMsg +=tripsBet+" (Trips bet)";
      }
    }
    if (endTotal>=0){
      finalMsg ="You have won $"+endTotal+"</br>"+payCalcMsg;
    }
    else{
      endTotal *= -1;
      finalMsg ="You have lost $"+endTotal+"</br>"+payCalcMsg;
    }
  }
  else if (multiplier==1){
    if (blindQualify<0){
      blindBet *= -1;
    }
    if (!dealerQualify){
        endTotal =  blindBet + tripsBet - parseInt(playBet);
        payCalcMsg ="Total = "+endTotal+" = -"+parseInt(playBet)+" (Play Bet) "+tripsBet+" (Trips bet)";
        if (blindBet>0){
          payCalcMsg +="+"+blindBet+" (Blind bet) ";
        }else{
          payCalcMsg +=blindBet+" (Blind bet) ";
        }
        if (tripsBet>0){
          payCalcMsg +="+"+tripsBet+" (Trips bet)";
        }else if (tripsBet==0){
          payCalcMsg +="-"+tripsBet+" (Trips bet)";
        }
        else{
          payCalcMsg +=tripsBet+" (Trips bet)";
        }
    }else{
      endTotal =  blindBet + tripsBet - parseInt(anteBet) - parseInt(playBet);
      payCalcMsg="Total = "+endTotal+" = -"+parseInt(anteBet)+" (Ante Bet) -"+parseInt(playBet)+" (Play Bet) ";
      if (blindBet>0){
        payCalcMsg +="+"+blindBet+" (Blind bet) ";
      }else{
        payCalcMsg +=blindBet+" (Blind bet) ";
      }
      if (tripsBet>0){
        payCalcMsg +="+"+tripsBet+" (Trips bet)";
      }else if (tripsBet==0){
        payCalcMsg +="-"+tripsBet+" (Trips bet)";
      }
      else{
        payCalcMsg +=tripsBet+" (Trips bet)";
      }
    }

    if (endTotal>=0){
      finalMsg ="You have won $"+endTotal+"</br>"+payCalcMsg;
    }
    else{
      endTotal *= -1;
      finalMsg ="You have lost $"+endTotal+"</br>"+payCalcMsg;
    }
  }
  else if (multiplier==2){
    if (blindQualify<0){
      blindBet = 0;
    }
    if (!dealerQualify){
        endTotal = parseInt(playBet) + blindBet + tripsBet;
        payCalcMsg="Total = "+endTotal+" = "+blindBet+" (Blind Bet) +"+parseInt(playBet)+" (Play Bet) ";
        if (tripsBet>0){
          payCalcMsg +="+"+tripsBet+" (Trips bet)";
        }else if (tripsBet==0){
          payCalcMsg +="-"+tripsBet+" (Trips bet)";
        }
        else{
          payCalcMsg +=tripsBet+" (Trips bet)";
        }
    }
    else{
      endTotal = parseInt(anteBet) + parseInt(playBet) + blindBet + tripsBet;
      payCalcMsg="Total = "+endTotal+" = "+parseInt(anteBet)+" (Ante Bet) +"+blindBet+" (Blind Bet) +"+parseInt(playBet)+" (Play Bet) ";
      if (tripsBet>0){
        payCalcMsg +="+"+tripsBet+" (Trips bet)";
      }else if (tripsBet==0){
        payCalcMsg +="-"+tripsBet+" (Trips bet)";
      }
      else{
        payCalcMsg +=tripsBet+" (Trips bet)";
      }
    }
    finalMsg ="You have won $"+endTotal+"</br>"+payCalcMsg;
  }
  return finalMsg;
}

function endRound(multiplier) {
    /*
    Decide round results, who wins, how much player wins/loses based on the cards,
    and display results
    */
    // Multiplier: -1 means fold, rest mean bet times multiplier

    let winMsg = "";

    // Get best 5 card hand of PLAYER
    let [best_player_hand, best_player_hand_value] = findBestHand(PLAYER);

    // Get best 5 card hand of DEALER
    let [best_dealer_hand, best_dealer_hand_value] = findBestHand(DEALER);

    console.log("player's 5-card hand:", [best_player_hand, best_player_hand_value]);
    console.log("dealer's 5-card hand:", [best_dealer_hand, best_dealer_hand_value]);
    let player_hand_str = formatHandLabel(best_player_hand);
    let dealer_hand_str = formatHandLabel(best_dealer_hand);

    let dealerLbl = document.getElementById(DEALER_LBL);
    let playerLbl = document.getElementById(PLAYER_LBL);
    dealerLbl.innerHTML = `Dealer's Hand: ${best_dealer_hand_value.split("_").join(" ")}, ${dealer_hand_str}`;
    playerLbl.innerHTML = `Player's Hand: ${best_player_hand_value.split("_").join(" ")}, ${player_hand_str}`;

    // PLAYER vs DEALER
    if (hand_values[best_player_hand_value] > hand_values[best_dealer_hand_value]) {
        winMsg = "Player wins!";
        multiplier = 2;
    } else if (hand_values[best_player_hand_value] < hand_values[best_dealer_hand_value]) {
        winMsg = "Dealer wins!";
        multiplier = 1;
    } else {
        // Compare 1st indices, 2nd indices, 3rd and so on until the card values do not match between player and dealer
        for (let i=0; i<best_player_hand.length; i++) {
            if (face_values[best_player_hand[i][0]] > face_values[best_dealer_hand[i][0]]) {
                winMsg = `Player wins with ${best_player_hand[i][0]}-High!`;
                multiplier = 2;
                break;
            } else if (face_values[best_player_hand[i][0]] < face_values[best_dealer_hand[i][0]]) {
                winMsg = `Dealer wins with ${best_dealer_hand[i][0]}-High!`;
                multiplier = 1;
                break;
            }
        }

        if (winMsg == "") {
            winMsg = "It's a tie!";
        }
    }
    if (playerFold==true){
      multiplier = 0;
    }
    let player_payout = getPayout(multiplier);

    document.getElementById(STATUS_BAR).innerHTML = `${winMsg} ${player_payout}.`;
}

function findBestHand(player) {
    /*
    Find player's best 5-card hand
    :param cards: Object representing a card hand
    :return: Object of player's best 5-card hand and hand value,
             hand is in sorted order by most to least relevant cards, dependent on the hand type
    */
    let wholeHand = hand[COMMUNITY].concat(hand[player]);
    wholeHand.sort(compareCards);
    console.log("sorted whole cards of player ", player, wholeHand)

    let royalFlushHand = getRoyalFlush(wholeHand);
    if (royalFlushHand) {
        if (player==PLAYER){
          tripsQualify = 6;
          blindQualify = 5;
        } else{
          dealerQualify = true;
        }
        return [royalFlushHand, "royal_flush"];
    }

    let straightFlushHand = getStraightFlush(wholeHand);
    if (straightFlushHand) {
        if (player==PLAYER){
          tripsQualify = 5;
          blindQualify = 4;
        } else{
          dealerQualify = true;
      }
        return [straightFlushHand, "straight_flush"];
    }

    let quadsHand = getQuads(wholeHand);
    if (quadsHand) {
        if (player==PLAYER){
          tripsQualify = 4;
          blindQualify = 3;
        } else{
          dealerQualify = true;
        }
        return [quadsHand, "quads"];
    }

    let fullHouse = getFullhouse(wholeHand);
    if (fullHouse) {
        if (player==PLAYER){
          tripsQualify = 3;
          blindQualify = 2;
        } else{
          dealerQualify = true;
        }
        return [fullHouse, "full_house"];
    }

    let flushHand = getFlush(wholeHand);
    if (flushHand) {
        if (player==PLAYER){
          tripsQualify = 2;
          blindQualify = 1;
        } else{
          dealerQualify = true;
        }
        return [flushHand, "flush"];
    }

    let straightHand = getStraight(wholeHand);
    if (straightHand) {
        if (player==PLAYER){
          tripsQualify = 1;
          blindQualify = 0;
        } else{
          dealerQualify = true;
        }
        return [straightHand, "straight"];
    }

    let tripleHand = getTriple(wholeHand);
    if (tripleHand) {
        if (player==PLAYER){
          tripsQualify = 0;
        } else{
          dealerQualify = true;
        }
        return [tripleHand, "triple"];
    }

    let twoPair = getTwoPair(wholeHand);
    if (twoPair) {
        if (player==DEALER){
          dealerQualify = true;
        }
        return [twoPair, "two_pair"];
    }

    let onePair = getOnePair(wholeHand);
    if (onePair) {
        if (player==DEALER){
          dealerQualify = true;
        }
        return [onePair, "one_pair"];
    }

    // If lower than a pair
    return [getBestFaceValueHand(wholeHand, 5), "lower_than_one_pair"];
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

function formatHandLabel(cards) {
    /*
    Generate string of hand, highlight duplicate face values
    :param cards: Object representing a card hand
    :return: String of formatted cards
    */
    let cardStr = "";
    for (let i=0; i<cards.length; i++) {
        if ((i > 0 && cards[i-1][0] == cards[i][0]) || (i < cards.length-1 && cards[i+1][0] == cards[i][0])) {
            cardStr += `<u>${cards[i][0]+suitIcons[cards[i][1]]}</u> `;
        } else {
            cardStr += `${cards[i][0]+suitIcons[cards[i][1]]} `;
        }
    }
    return cardStr;
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

function compareCards(c1, c2){
    return face_values[c2[0]]-face_values[c1[0]];
}

function getBestFaceValueHand(cards, num) {
    /*
    Find the best 5 cards of a 7-card hand based solely on face value
    :param cards: Object representing a 7-card hand in sorted order from highest to lowest face
    :return: Object representing a num-card hand
    */
    cards.sort(compareCards);
    return cards.slice(0, num);
}

function getFrequencyFaces(cards) {
    /*
    Get frequency of each face value in a hand
    :param cards: Object representing a 7-card hand in sorted order from highest to lowest face
    :return: Frequencies of each face value
    */
    let freq = {};
    cards.forEach(c => { freq[c[0]] = (freq[c[0]] || 0) + 1; });
    return freq;
}

function getBestNumOfaKind(cards, num) {
    /*
    Looks for the best 5-card hand with an n-of-a-kind
    :param cards: Object representing a 7-card hand in sorted order from highest to lowest face
    :return: Boolean
    */
    // Find all num duplicate values
    let freq = getFrequencyFaces(cards);
    let highestNumDupeValue = null;
    for (let face in freq) { // If num duplicate found, set if it is the highest value so far
        if (freq[face] >= num && (highestNumDupeValue == null || face_values[face] > face_values[highestNumDupeValue])) {
            highestNumDupeValue = face;
        }
    }

    if (!highestNumDupeValue) { // No n-of-a-kind found
        return null;
    }

    // Add best num duplicate cards to hand
    let numDupes = [];
    let notNumDupes = [];
    for (let i=0; i<cards.length; i++) {
        if (cards[i][0] == highestNumDupeValue && numDupes.length < num) {
            numDupes.push(cards[i]);
        } else {
            notNumDupes.push(cards[i]);
        }
    }

    // Find rest of hand based on face value
    let rest = getBestFaceValueHand(notNumDupes, 5-num);

    return numDupes.concat(rest);
}

function getRoyalFlush(cards) {
    /*
    Looks for the royal flush hand in a set of 7 cards
    :param cards: Object representing a 7-card hand in sorted order from highest to lowest face
    :return: A set of cards sorted in decending order such that the royal flush cards are
    near the start of the array, and the non-royal flush cards are sorted after
    */
    let onlyFlush = getFlush(cards); // Find the best possible flush
    if (!onlyFlush) return null;

    //If the best five cards in the flush correspond to royal values, return onlyFlush.
    if (onlyFlush.filter(card=> (card[0]>=face_values['10']) && (card[0]<=face_values['A'])).length === 5)
        return onlyFlush;

    return null;
}

function getStraightFlush(cards) {
    /*
    Looks for the best 5-card hand with a straight and flush
    :param cards: Object representing a 7-card hand in sorted order from highest to lowest face
    :return: Boolean
    */
    // Assume cards are already sorted from highest value to lowest value
    let straightSuitIndices = [cards[0]];
    let currValue = face_values[cards[0][0]];
    let currSuit = cards[0][1];
    for (let i=1; i<cards.length; i++) {
        if (face_values[cards[i][0]] == currValue-1 && cards[i][1] == currSuit) {
            // If going down 1 AND the suit matches, add to straightSuitIndices
            straightSuitIndices.push(cards[i]);
            currValue = face_values[cards[i][0]];
            if (straightSuitIndices.length >= 5) {
                break; // If 5 straights are found (first set of straights will be largest straight available), leave
            }
        } else { // If not, reset it and currValue, currSuit
            straightSuitIndices = [cards[i]];
            currValue = face_values[cards[i][0]];
            currSuit = cards[i][1];
        }
    }

    if (straightSuitIndices.length < 5) {
        return null
    }
    return straightSuitIndices;
}

function getQuads(cards) {
    /*
    Looks for the best 5-card hand with a 4-of-a-kind
    :param cards: Object representing a 7-card hand in sorted order from highest to lowest face
    :return: Boolean
    */
    return getBestNumOfaKind(cards, 4);
}

function getFullhouse(cards) {
    /*
    Returns the tripple and highest pair that make up a full house in a set of cards
    :param cards: A 2D array of seven cards in sorted order from highest to lowest face
    :return: a 2D array of five cards that consists of the tripple and highest pair used to make a full house
    */
    let triple = false;
    let pair = false;
    let freq = getFrequencyFaces(cards);
    for (let face in freq) {
        if (freq[face] == 3){
          triple=true;
        }
        if (freq[face] == 2){
          pair=true;
        }
    }
    if ((triple) && (pair)){
      let fullHouseCards = [];
      for (let i=0; i<cards.length; i++) {
          if (fullHouseCards.length==3){
            break;
          }
          if (freq[cards[i][0]]==3){
            fullHouseCards.push(cards[i]);
          }
      }
      for (let i=0; i<cards.length; i++) {
          if (fullHouseCards.length==5){
            break;
          }
          if (freq[cards[i][0]]==2){
            fullHouseCards.push(cards[i]);
          }
      }
      return fullHouseCards;
    }
    else{
      return null;
    }
}

function getFlush(cards) {
    /*
    Returns the highest flush in a set of cards
    :param cards: Object representing a 7-card hand in sorted order from highest to lowest face
    :return: a 2D array of the five highest cards used to make a flush
    */
    let flushCards = null;
    suits.forEach(suit=> {
        let sameSuitCards = cards.filter(card=> card[1] === suit); // Filters hand so every card in sameSuitCards will have the same suit
        if (sameSuitCards.length >= 5) {
            flushCards = sameSuitCards.slice(0, 5); // If cards are ordered, take best (first) 5
        }
    });
    return flushCards;
}

function getStraight(cards) {
    /*
    Looks for the best 5-card hand with a straight
    :param cards: Object representing a 7-card hand in sorted order from highest to lowest face
    :return: Boolean
    */
    // Assume cards are already sorted from highest value to lowest value
    let straightIndices = [cards[0]];
    let currValue = face_values[cards[0][0]];
    for (let i=1; i<cards.length; i++) {
        if (face_values[cards[i][0]] == currValue-1) {
            // If going down 1, add to straightindices
            straightIndices.push(cards[i]);
            currValue = face_values[cards[i][0]];
            if (straightIndices.length >= 5) {
                break; // If 5 straights are found (first set of straights will be largest straight available), leave
            }
        } else { // If not, reset it and currValue
            straightIndices = [cards[i]];
            currValue = face_values[cards[i][0]];
        }
    }

    if (straightIndices.length < 5) {
        return null
    }
    return straightIndices;
}

function getTriple(cards) {
    /*
    Looks for the best 5-card hand with a 3-of-a-kind
    :param cards: Object representing a 7-card hand in sorted order from highest to lowest face
    :return: Boolean
    */
    return getBestNumOfaKind(cards, 3);
}

function getTwoPair(cards) {
    /*
    Returns the two highest pairs and the card with the highest face value among the remaning three cards
    :param cards: A 2D array of seven cards in sorted order from highest to lowest face
    :return: a 2D array of five cards that consists of the two highest pairs and the card with the highest face value among the remaning three cards
    */
    let pair = 0;
    let freq = getFrequencyFaces(cards);
    for (let face in freq) {
        if (freq[face] == 2){
            pair++;
        }
    }
    if (pair>=2){
        let twoPairCards = [];
        for (let i=0; i<cards.length; i++) {
            if (twoPairCards.length==4){
                break;
            }
            if (freq[cards[i][0]]==2){
                twoPairCards.push(cards[i]);
            }
        }
        for (let i=0; i<cards.length; i++) {
            if (twoPairCards.length==5){
                break;
            }
            let count=0;
            for (let j=0; j<twoPairCards.length; j++) {
                if (twoPairCards[j][0]!=cards[i][0]){
                    count++;
                }
            }
            if (count==4){
                twoPairCards.push(cards[i]);
            }
        }
        return twoPairCards;
    }
    else{
      return null;
    }
}

function getOnePair(cards) {
    return getBestNumOfaKind(cards, 2);
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
