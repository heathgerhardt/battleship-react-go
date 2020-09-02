import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class GameBoard extends React.Component {
  renderSquare(row, column) {
    return (<Square value={this.props.board[row][column]}
            onClick={() => this.props.onClick(row, column)} 
            key={row+','+column}/>);
  }

  render() {
    return (
      <div className="game-board">
        {this.props.board.map((row, i) => {
          return (
            <div className="board-row" key={i}>
              {row.map((item, j) => this.renderSquare(i, j))}
            </div>)
        })}
      </div>
    );
  }
}

const ApiUrl = 'http://localhost:8080/battleship'

class Game extends React.Component {
  BoardDimension = 8;

  constructor(props) {
    super(props)
    this.state = {
      player1: this.generatePlayer(1),
      player2: this.generatePlayer(2),
      firstPlayer: true
    }
  }

  generatePlayer(num) {
    return {
      board: this.generateBoard(),
      name: "Player " + num,
      hits: 0
    }
  }

  generateBoard() {
    return [...Array(this.BoardDimension)]
            .map(() => Array(this.BoardDimension).fill(null));
  }

  shoot(row, column) {
    return fetch(ApiUrl, {
      method: 'post',
      headers: {'Content-Type': 'application/graphql'},
      body: `{shot(row:${row}, column:${column})}`
    });
  }

  currentPlayer() {
    return this.state.firstPlayer ? this.state.player1 : this.state.player2;
  }

  winner() {
    // todo api call for this
    let otherPlayer = this.state.firstPlayer ? this.state.player2 : this.state.player1;
    if (otherPlayer.hits === 3) return otherPlayer;
    return null;
  }

  handleClick(row, column) {
    if (this.winner()) return;
    this.shoot(row, column)
      .then(response => response.json())
      .then((data) => {
        let player = this.currentPlayer();
        let hit = data.data.shot;
        player.board[row][column] = hit ? '*' : 'o';
        if (hit) player.hits++;
        this.setState({firstPlayer: !this.state.firstPlayer});
      },
      (error) => {console.log(error)});
  }

  render() {
    let player = this.currentPlayer();
    let message;
    let winner = this.winner()
    if (winner) message = winner.name + ' wins';
    else message = 'Hits on enemy ship: ' + player.hits;
    return (
      <div className="game">
        <div className="player-name">{player.name}</div>
        <div className="message">{message}</div>
        <GameBoard board={player.board} onClick={(i, j) => this.handleClick(i, j)}/>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
