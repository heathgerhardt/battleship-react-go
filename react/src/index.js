import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import battleshipApi from './battleship-service.js';

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
        {this.props.board.map((row, rowIndex) => {
          return (
            <div className="board-row" key={rowIndex}>
              {row.map((square, columnIndex) => 
                this.renderSquare(rowIndex, columnIndex))}
            </div>)
        })}
      </div>
    );
  }
}

const BoardDimension = 8;

class Game extends React.Component {
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
    return [...Array(BoardDimension)]
            .map(() => Array(BoardDimension).fill(null));
  }

  currentPlayer() {
    return this.state.firstPlayer ? this.state.player1 : this.state.player2;
  }

  winner() {
    // todo api call for this
    const otherPlayer = this.state.firstPlayer ? this.state.player2 : this.state.player1;
    if (otherPlayer.hits === 3) return otherPlayer;
    return null;
  }

  handleClick(row, column) {
    if (this.winner()) return;
    battleshipApi.shoot(row, column)
      .then((shotResult) => {
        const player = this.currentPlayer();
        const hit = shotResult.data.shot;
        player.board[row][column] = hit ? '*' : 'o';
        if (hit) player.hits++;
        this.setState({firstPlayer: !this.state.firstPlayer});
      })
      .catch((error) => {console.error(error)});
  }

  componentDidMount() {
    console.log("game load");
  }

  render() {
    const player = this.currentPlayer();
    let message;
    const winner = this.winner()
    if (winner) message = winner.name + ' wins';
    else message = 'Hits on enemy ship: ' + player.hits;
    return (
      <div className="game">
        <div className="player-name">{player.name}</div>
        <div className="message">{message}</div>
        <GameBoard board={player.board} 
          onClick={(row, column) => this.handleClick(row, column)}/>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
