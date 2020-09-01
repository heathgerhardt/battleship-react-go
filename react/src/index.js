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

const ApiUrl = 'http://localhost:8080/battleship/'

class GameBoard extends React.Component {
  BoardDimension = 8;

  constructor(props) {
    super(props);
    this.state = {
      squares: [...Array(this.BoardDimension)].map(() => Array(this.BoardDimension).fill(null))
    };
  }

  shoot(row, column) {
    return fetch(ApiUrl + 'shot', {
      method: 'post',
      body: JSON.stringify({row: row, column: column})
    });
  }

  handleClick(row, column) {
    const squares = this.state.squares.slice();
    this.shoot(row, column)
      .then(response => response.json())
      .then((data) => {
        squares[row][column] = data.Hit ? '*' : 'o';
        this.setState({squares: squares});
      },
      (error) => {console.log(error)});
  }

  renderSquare(row, column) {
    return (<Square value={this.state.squares[row][column]}
            onClick={() => this.handleClick(row, column)} 
            key={row+','+column}/>);
  }

  render() {
    const winner = calculateWinner(this.state.squares);
    let message;
    if (winner) {
      message = 'Winner: ' + winner;
    } else {
      message = 'Hits on your ship: 0';
    }
 
    return (
      <div>
        <div className="message">{message}</div>
        {this.state.squares.map((row, i) => {
          return (
            <div className="board-row" key={i}>
              {row.map((item, j) => this.renderSquare(i, j) )}
            </div>)
        })}
      </div>
    );
  }
}

function calculateWinner(squares) {
  return null;
}

class Player extends React.Component {
  constructor(props) {
    super(props)
    this.name = props.name;
  }

  handleClick() {

  }
  
  render() {
    return (
      <div className="player">
        <div className="player-name">{this.name}</div>
        <div className="game-board">
          <GameBoard onClick={() => this.handleClick()}/>
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="player">
          <Player name="Player 1"/>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
