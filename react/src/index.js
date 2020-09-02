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

const ApiUrl = 'http://localhost:8080/battleship/'

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
    return fetch(ApiUrl + 'shot', {
      method: 'post',
      body: JSON.stringify({row: row, column: column})
    });
  }

  currentPlayer() {
    return this.state.firstPlayer ? this.state.player1 : this.state.player2;
  }

  handleClick(row, column) {
    this.shoot(row, column)
      .then(response => response.json())
      .then((data) => {
        let player = this.currentPlayer();
        player.board[row][column] = data.Hit ? '*' : 'o';
        if (data.Hit) player.hits++;
        this.setState({firstPlayer: !this.state.firstPlayer});
      },
      (error) => {console.log(error)});
  }

  render() {
    let player = this.currentPlayer();
    return (
      <div className="game">
        <div className="player-name">{player.name}</div>
        <div className="message">{'Hits on your ship: ' + player.hits}</div>
        <GameBoard board={player.board} onClick={(i, j) => this.handleClick(i, j)}/>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
