import React, { Component } from "react";
import { Route } from "react-router-dom";
import "./App.css";
import GameBoard from "./GameBoard";
import OpeningModal from "./OpeningModal";
import "bootstrap/dist/css/bootstrap.min.css";
class App extends Component {
  constructor() {
    super();
    this.state = {
      startGame: false
    };
  }

  handleDismiss = () => {
    this.setState({
      startGame: true
    });
  };

  render() {
    if (this.state.startGame) {
      return (
        <div className="App">
          <nav></nav>
          <main>
            <Route push to="/game">
              <GameBoard />
            </Route>
          </main>
        </div>
      );
    } else {
      return (
        <div className="App">
          <Route path="/">
            <OpeningModal show={true} onHide={this.handleDismiss} />
          </Route>
        </div>
      );
    }
  }
}

export default App;
