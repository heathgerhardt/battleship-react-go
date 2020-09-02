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
      player1: {
        board: this.generateBoard(),
        name: "Player 1"
      },
      player2: {
        board: this.generateBoard(),
        name: "Player 2"
      },
      board: [],
      name: '',
      firstPlayer: true
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

  handleClick(row, column) {
    this.state.board = this.state.firstPlayer ? this.state.player1.board 
                                              : this.state.player2.board;
    const board = this.state.board.slice();
    this.shoot(row, column)
      .then(response => response.json())
      .then((data) => {
        board[row][column] = data.Hit ? '*' : 'o';
        this.setState({board: board});
      },
      (error) => {console.log(error)});
  }

  render() {
    let message = 'Hits on your ship: 0';
    let player = this.state.firstPlayer ? this.state.player1 : this.state.player2;
    return (
      <div className="game">
        <div className="player-name">{player.name}</div>
        <div className="message">{message}</div>
        <GameBoard board={player.board}
            onClick={(i, j) => this.handleClick(i, j)}/>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
