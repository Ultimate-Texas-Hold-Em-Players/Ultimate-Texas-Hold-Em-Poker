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
// Status constants
const CHECK0 = "0";
const CHECK3 = "1";
const CHECK5 = "2";

// Keep track of hands and cards not in deck
let usedCards = {};
let hand = {};
let communityStatus = CHECK0;
let communityRevealed = 0; // Last index of revealed cards


// Testing count
let trials = 0;
let royalFlushHand_count = 0;
let straightFlushHand_count = 0;
let quadsHand_count = 0;
let fullHouse_count = 0;
let flushHand_count = 0;
let straightHand_count = 0;
let tripleHand_count = 0;
let twoPair_count = 0;
let onePair_count = 0;
let lower_than_one_pair_count = 0;

function test() {
    /*
    Initializes the deck and sets up the table.
    :param: None
    :return: None
    */
    trials = document.getElementById("trialsInput").value;
    royalFlushHand_count = 0;
    straightFlushHand_count = 0;
    quadsHand_count = 0;
    fullHouse_count = 0;
    flushHand_count = 0;
    straightHand_count = 0;
    tripleHand_count = 0;
    twoPair_count = 0;
    onePair_count = 0;
    lower_than_one_pair_count = 0;

    for (let i=0; i<trials; i++) {
        resetDeck();
        showEmptyCards(PLAYER, 2);
        showEmptyCards(DEALER, 2);
        showEmptyCards(COMMUNITY, 5);
        endRound();
    }
    document.getElementById("status").innerHTML = "Status: Done";
}

function resetDeck() {
    /*
    Resets the game
    :param None
    :return: None
    */
    hand[DEALER] = [];
    hand[PLAYER] = [];
    hand[COMMUNITY] = [];
    communityStatus = CHECK0;
    communityRevealed = 0;
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
    for (let i=0; i<num; i++) {
        newCard(owner);
    }
    console.log("Used cards:", usedCards);
    console.log("Hands:", hand);
}

function endRound(multiplier) {
    /*
    Decide round results, who wins, how much player wins/loses based on the cards,
    and display results
    */
    // Multiplier: -1 means fold, rest mean bet times multiplier

    // Get best 5 card hand of PLAYER
    findBestHand(PLAYER);

    // show results
    document.getElementById("trials").innerHTML = `Number of trials: ${trials}`;
    document.getElementById("royalFlushHand_count").innerHTML = `royalFlushHand_count: ${formatCount(royalFlushHand_count)}`;
    document.getElementById("straightFlushHand_count").innerHTML = `straightFlushHand_count: ${formatCount(straightFlushHand_count)}`;
    document.getElementById("quadsHand_count").innerHTML = `quadsHand_count: ${formatCount(quadsHand_count)}`;
    document.getElementById("fullHouse_count").innerHTML = `fullHouse_count: ${formatCount(fullHouse_count)}`;
    document.getElementById("flushHand_count").innerHTML = `flushHand_count: ${formatCount(flushHand_count)}`;
    document.getElementById("straightHand_count").innerHTML = `straightHand_count: ${formatCount(straightHand_count)}`;
    document.getElementById("tripleHand_count").innerHTML = `tripleHand_count: ${formatCount(tripleHand_count)}`;
    document.getElementById("twoPair_count").innerHTML = `twoPair_count: ${formatCount(twoPair_count)}`;
    document.getElementById("onePair_count").innerHTML = `onePair_count: ${formatCount(onePair_count)}`;
    document.getElementById("lower_than_one_pair_count").innerHTML = `lower_than_one_pair_count: ${formatCount(lower_than_one_pair_count)}`;
}

function formatCount(count) {
    return `${count} counts, ${(count/trials*100).toFixed(4)}%`;
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
        royalFlushHand_count += 1;
        return [royalFlushHand, "royal_flush"];
    }

    let straightFlushHand = getStraightFlush(wholeHand);
    if (straightFlushHand) {
        straightFlushHand_count += 1;
        return [straightFlushHand, "straight_flush"];
    }

    let quadsHand = getQuads(wholeHand);
    if (quadsHand) {
        quadsHand_count += 1;
        return [quadsHand, "quads"];
    }

    let fullHouse = getFullhouse(wholeHand);
    if (fullHouse) {
        fullHouse_count += 1;
        return [fullHouse, "full_house"];
    }

    let flushHand = getFlush(wholeHand);
    if (flushHand) {
        flushHand_count += 1;
        return [flushHand, "flush"];
    }

    let straightHand = getStraight(wholeHand);
    if (straightHand) {
        straightHand_count += 1;
        return [straightHand, "straight"];
    }

    let tripleHand = getTriple(wholeHand);
    if (tripleHand) {
        tripleHand_count += 1;
        return [tripleHand, "triple"];
    }

    let twoPair = getTwoPair(wholeHand);
    if (twoPair) {
        twoPair_count += 1;
        return [twoPair, "two_pair"];
    }

    let onePair = getOnePair(wholeHand);
    if (onePair) {
        onePair_count += 1;
        return [onePair, "one_pair"];
    }
    
    // If lower than a pair
    lower_than_one_pair_count += 1;
    return [getBestFaceValueHand(wholeHand, 5), "lower_than_one_pair"];
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
            newCard = false;
        }
    }

    // Update cards
    usedCards[faces[f]].push(suits[s]);
    hand[owner].push([faces[f], suits[s]]);
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

