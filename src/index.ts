/// <reference path="node.d.ts"/>
import * as GDAX from 'gdax';

import {passPhrase, apiKey, secret} from './credentials';
import ACCOUNTS from './accounts';

const authenticatedClient = new GDAX.AuthenticatedClient(
    apiKey, secret, passPhrase, 'https://api.gdax.com');

const callback = (error, response, data) => {
    if (error)
        return console.dir(error);
    return console.dir(data);
};
// authenticatedClient.getAccount(ACCOUNTS.ETH, callback);

const ETH_USD = 'ETH-USD';

const websocket = new GDAX.WebsocketClient([ETH_USD]);
websocket.on('message', (data: any) => {
  // Get filled orders.
  if (!(data.type === 'done' && data.reason === 'filled')) {
    return;
  }

  console.dir(data)
});