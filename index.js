const GDAX = require('gdax');

const {passPhrase, apiKey, secret} = require('./credentials.js');
const ACCOUNTS = require('./accounts.js');

const authenticatedClient = new GDAX.AuthenticatedClient(
    apiKey, secret, passPhrase, 'https://api.gdax.com');

// const callback = (error, response, data) => {
//     if (error)
//         return console.dir(error);
//     return console.dir(data);
// };
// authenticatedClient.getAccount(ACCOUNTS.ETH, callback);

const ETH_USD = 'ETH-USD';

const websocket = new GDAX.WebsocketClient([ETH_USD]);
websocket.on('message', data => {
  // Get filled orders.
  if (!(data.type === 'done' && data.reason === 'filled')) {
    return;
  }

  console.dir(data)
});