
const ApiUrl = 'http://localhost:8080/battleship'

const battleshipApi = {
  async shoot(gameId, playerId, row, column) {
    const response = await fetch(ApiUrl, {
      method: 'post',
      headers: { 'Content-Type': 'application/graphql' },
      body: `{shot(gameId:${gameId}, playerId:${playerId}, row:${row}, column:${column})}`
    });
    return await response.json();
  },

  async player(name) {
    const response = await fetch(ApiUrl, {
      method: 'post',
      headers: { 'Content-Type': 'application/graphql' },
      body: `{playerId(name:"${name}")}`
    });
    return await response.json();
  },

  async game(player1Id, player2Id) {
    const response = await fetch(ApiUrl, {
      method: 'post',
      headers: { 'Content-Type': 'application/graphql' },
      body: `{gameId(player1Id:${player1Id}, player2Id:${player2Id})}`
    });
    return await response.json();
  }
};

export default battleshipApi;