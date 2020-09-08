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
      gameId: null,
      player1: this.generatePlayer(1),
      player2: this.generatePlayer(2),
      firstPlayer: true
    }
  }

  generatePlayer(num) {
    return {
      id: null,
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
    const player = this.currentPlayer();
    battleshipApi.shoot(this.state.gameId, player.id, row, column)
      .then((shotResult) => {
        const player = this.currentPlayer();
        const hit = shotResult.data.shot;
        player.board[row][column] = hit ? '*' : 'o';
        if (hit) player.hits++;
        this.setState({firstPlayer: !this.state.firstPlayer});
      })
      .catch((error) => {console.error(error)});
  }

  async queryPlayerId(player) {
    const response = await battleshipApi.player(player.name)
      .then((response) => {player.id = response.data.playerId})
      .catch((error) => {console.error(error)});
    return response;
  }

  queryGameId() {
    battleshipApi.game(this.state.player1.id, this.state.player2.id)
      .then((response) => {this.state.gameId = response.data.gameId})
      .catch((error) => {console.error(error)});
  }

  componentDidMount() {
    // 1) Creating game session
    // 2) The playerId and gameId could be retrieved in one call but
    //    showing how to handle dependencies with multiple promises
    // 3) Mutating state directly here I do not want the UI to update
    const player1Call = this.queryPlayerId(this.state.player1);
    const player2Call = this.queryPlayerId(this.state.player2);
    Promise.all([player1Call, player2Call])
      .then(() => {this.queryGameId()})
      .catch((error) => {console.error(error)});
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
