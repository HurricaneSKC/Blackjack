import React, { Component } from 'react';
import DealerHand from "./DealerHand";
import PlayerHand from "./PlayerHand";
import HitButton from "./HitButton";
import StandButton from "./StandButton";
import InGameModal from "./InGameModal";

export default class GameBoard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      deck: {},
      newCard: {},
      playerHand: [],
      dealerHand: [],
      cardValue: 0,
      playerTotalArray: [],
      playerTotal: 0,
      dealerTotalArray: [],
      dealerTotal: 0,
      dealersTurn: false,
      message: "",
      display: false,
      isShowing: false
    }
  }
  
  // get deck
  componentDidMount() {
    this.fetchDeck();
  }

  fetchDeck = () => {
    const deckUrl = "https://deckofcardsapi.com/api/deck/new/draw/?count=4";
    fetch(deckUrl)
      .then(res => res.json())
      .then(res => {
        this.setState({ 
          deck: res
        },
          //start game
          this.startGame
        );
      });
  };

  // e.g. response
  //{"success": true, "deck_id": "vgxh4226dbgr", "cards": [{"code": "8S", "image": "https://deckofcardsapi.com/static/img/8S.png", "images": {"svg": "https://deckofcardsapi.com/static/img/8S.svg", "png": "https://deckofcardsapi.com/static/img/8S.png"}, "value": "8", "suit": "SPADES"}, {"code": "5D", "image": "https://deckofcardsapi.com/static/img/5D.png", "images": {"svg": "https://deckofcardsapi.com/static/img/5D.svg", "png": "https://deckofcardsapi.com/static/img/5D.png"}, "value": "5", "suit": "DIAMONDS"}, {"code": "7H", "image": "https://deckofcardsapi.com/static/img/7H.png", "images": {"svg": "https://deckofcardsapi.com/static/img/7H.svg", "png": "https://deckofcardsapi.com/static/img/7H.png"}, "value": "7", "suit": "HEARTS"}, {"code": "9S", "image": "https://deckofcardsapi.com/static/img/9S.png", "images": {"svg": "https://deckofcardsapi.com/static/img/9S.svg", "png": "https://deckofcardsapi.com/static/img/9S.png"}, "value": "9", "suit": "SPADES"}], "remaining": 48}
  
  // get next hand to keep order of deck
  fetchNextHand = () => {
    const nextHandUrl = `https://deckofcardsapi.com/api/deck/${this.state.deck.deck_id}/draw/?count=4`;
    fetch(nextHandUrl)
      .then(res => res.json())
      .then(res => {
        if (this.state.deck.remaining >= 9) {
          this.setState(
            {
              deck: res
            },
            this.startGame
          );
        } else {
          this.fetchDeck();
        }
      });
  };  

  startGame = () => {
    this.setFaceCardValues(this.state.deck.cards);
    this.createPlayerDealerHands();
  }

  //create player and dealer hand 
  createPlayerDealerHands = () => {
    let playerArray = [];
    let dealerArray = [];
    this.state.deck.cards.forEach((el, idx) => {
      if (idx % 2 === 0) {
        playerArray.push(el);
      } else if (idx % 2 !== 0) {
        return dealerArray.push(el);
      }
    });

    this.setState(
      {
        playerHand: playerArray
      },
      this.calcPlayerTotal
    );
    this.setState(
      {
        dealerHand: dealerArray
      },
      this.calcDealerTotal
    );
  }

  // change card values from api call
  setFaceCardValues = array => {
    array.forEach(card => {
      if (
        card.value === "QUEEN" ||
        card.value === "KING" ||
        card.value === "JACK"
      ) {
        card.face = card.value;
        card.value = 10;
      } else if (card.value === "ACE") {
        card.face = "ACE";
        card.value = 11;
      } else {
        card.value = parseInt(card.value);
      }
    });
  };

  //player logic
  calcPlayerTotal = () => {
    let tempTotal = 0;
    let tempArray = [];
    // pass in player hand to correct hand values 
    this.setFaceCardValues(this.state.playerHand);
    // pass each card value to array
    this.state.playerHand.forEach(card => {
      card.value = parseInt(card.value);
      tempArray.push(card.value);
    });
    // add array together
    tempTotal = tempArray.reduce((a, b) => a + b, 0);
    this.setState({
      playerTotalArray: tempArray,
      playerTotal: tempTotal
    });

    // auto win for getting blackjack
    if (
      (tempTotal === 21 &&
        this.state.playerHand[0].value === 10 &&
        this.state.playerHand[1].face === "ACE") ||
      (tempTotal === 21 &&
        this.state.playerHand[1].value === 10 &&
        this.state.playerHand[0].face === "ACE")
    ) {
      this.displayModal("Blackjack! You win!", true);
    }

    // check if player bust and handle auto calc for ace(11)
    if (tempTotal > 21 && tempArray.includes(11) === true) {
      let idx = tempArray.indexOf(11);
      let copyPlayerHand = [...this.state.playerHand];
      let copyPlayerTotalArray = [...this.state.playerTotalArray];
      copyPlayerHand[idx].value = 1;
      copyPlayerTotalArray[idx] = 1;
      this.setState({
        playerHand: copyPlayerHand,
        playerTotalArray: copyPlayerTotalArray
      });
      this.calcPlayerTotal();
    } else if (tempTotal > 21) {
      this.displayModal("Bust", true);
    }
  };

  fetchPlayerCard = () => {
    const HitUrl = `https://deckofcardsapi.com/api/deck/${this.state.deck.deck_id}/draw/?count=1`;
    fetch(HitUrl)
      .then(res => res.json())
      .then(res => {
        this.setState(prevState => {
          prevState.playerHand.push(res.cards[0]);
          return {
            playerHand: prevState.playerHand,
            newCard: res.cards[0]
          };
        }, this.calcPlayerTotal);
      });
  };

  // on hit get card add to player hand
  handleHitButton = e => {
    this.fetchPlayerCard();
  };

  // on stand pass to dealers turn
  handleStandButton = () => {
    this.setState(
      {
        dealersTurn: true,
        isShowing: true
      },
      this.handleDealerTurn
    );
  }
  
  // dealer logic 
  calcDealerTotal = () => {
    let tempTotal = 0;
    let tempArray = [];
    this.setFaceCardValues(this.state.dealerHand);
    this.state.dealerHand.forEach(card => {
      card.value = parseInt(card.value);
      tempArray.push(card.value);
    });
    tempTotal = tempArray.reduce((a, b) => a + b, 0);
    if (
      (tempTotal === 21 &&
        this.state.dealerHand[0].value === 10 &&
        this.state.dealerHand[1].face === "ACE") ||
      (tempTotal === 21 &&
        this.state.dealerHand[1].value === 10 &&
        this.state.dealerHand[0].face === "ACE")
    ) {
      this.displayModal("Dealer wins - Blackjack", true);
    }
    this.setState(
      {
        dealerTotalArray: tempArray,
        dealerTotal: tempTotal
      },
      this.handleDealerTurn
    );
  };

  // fetch dealer card if required
  fetchDealerCard = () => {
    const standUrl = `https://deckofcardsapi.com/api/deck/${this.state.deck.deck_id}/draw/?count=1`;
    fetch(standUrl)
      .then(res => res.json())
      .then(res => {
        this.setState(prevState => {
          prevState.dealerHand.push(res.cards[0]);
          return {
            dealerHand: prevState.dealerHand,
            newCard: res.cards[0],
            isShowing: true
          };
        }, this.calcDealerTotal);
      });
  };

  // dealer game play
  handleDealerTurn = () => {
    // if dealer less than or equal to 17 get card
    if (this.state.dealersTurn === true && this.state.dealerTotal <= 17) {
      this.fetchDealerCard();
    } else if (
      this.state.dealersTurn === true &&
      this.state.dealerTotal > 17 &&
      this.state.dealerTotal <= 21
    ) {
      // compare player and computer hands
      this.compareHands(this.state.dealerTotal, this.state.playerTotal);
    }

    if (
      this.state.dealerTotal > 21 &&
      this.state.dealerTotalArray.includes(11) === true
    ) {
      let idx = this.state.dealerTotalArray.indexOf(11);
      let copyDealerHand = [...this.state.dealerHand];
      let copyDealerTotalArray = [...this.state.dealerTotalArray];
      copyDealerHand[idx].value = 1;
      copyDealerTotalArray[idx] = 1;
      this.setState({
        dealerHand: copyDealerHand,
        dealerTotalArray: copyDealerTotalArray
      });
      this.calcDealerTotal();
    } else if (this.state.dealerTotal > 21) {
      this.displayModal("You win - Dealer busts", true);
    }
  };

  //game logic
  compareHands = (dealerTotal, playerTotal) => {
    if (dealerTotal > playerTotal) {
      this.displayModal(`Dealer wins... with ${dealerTotal}`, true);
    } else if (playerTotal > dealerTotal) {
      this.displayModal("You win!", true);
    } else if (dealerTotal === playerTotal) {
      this.displayModal("Tie", true);
    }
  };

  resetGame = () => {
    this.setState(
      {
        newCard: {},
        playerHand: [],
        dealerHand: [],
        cardValue: 0,
        playerTotalArray: [],
        playerTotal: 0,
        dealerTotalArray: [],
        dealerTotal: 0,
        dealersTurn: false,
        message: "",
        display: false,
        isShowing: false
      },
      this.fetchNextHand
    );
  };

  displayModal = (message, boolean) => {
    this.setState({ message: message, display: boolean });
  };

  dismissModal = () => {
    this.resetGame();
  };

  render() {
      return (
        <div>
          <div>
            <InGameModal
              onHide={this.dismissModal}
              message={this.state.message}
              display={String(this.state.display)}
            />
            <div className="hands">
              <DealerHand
                cards={this.props.cards}
                dealerHand={this.state.dealerHand}
                dealerTotal={this.state.dealerTotal}
                isShowing={this.state.isShowing}
              />
              <PlayerHand
                cards={this.props.cards}
                playerHand={this.state.playerHand}
                playerTotal={this.state.playerTotal}
              />
            </div>
          </div>
          <div className="buttons">
            <HitButton handleHitButton={this.handleHitButton} />
            <StandButton handleStandButton={this.handleStandButton} />
          </div>
        </div>
      )
    }
  }