
const ApiUrl = 'http://localhost:8080/battleship'

const battleshipApi = {
  async shoot(row, column) {
    const response = await fetch(ApiUrl, {
      method: 'post',
      headers: { 'Content-Type': 'application/graphql' },
      body: `{shot(row:${row}, column:${column})}`
    });
    return await response.json();
  }
};

export default battleshipApi;