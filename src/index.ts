import {AuthenticatedClient, WebsocketClient} from 'gdax';
import {orderBook} from './orderbook';
import {passPhrase, apiKey, secret} from './credentials';
import ACCOUNTS from './accounts';

const authenticatedClient = new AuthenticatedClient(
    apiKey, secret, passPhrase, 'https://api.gdax.com');

const callback = (error, response, data) => {
  if (error)
    return console.dir(error);
  return console.dir(data);
};
// authenticatedClient.getAccounts(callback);
// authenticatedClient.getAccount(ACCOUNTS.ETH, callback);

const websocketConfig = {
    "type": "subscribe",
    "product_ids": [
        "ETH-USD",
        "ETH-EUR"
    ],
    "channels": [
        "level2",
        "heartbeat",
        {
            "name": "ticker",
            "product_ids": [
                "ETH-USD",
            ]
        },
    ]
};

// const orderbookSync = new OrderbookSync(['BTC-USD', 'ETH-USD']);
// console.log(orderbookSync.books['ETH-USD'].state());
const websocket = new WebsocketClient(['BTC-USD']);

websocket.on('message', (data: any) => {
//   console.log(data);
  // if(data.type == 'ticker') {
  //   return console.dir(data);
  // }

  // if (!(data.type === 'done')) {
  //   return;
  // }
  
  // const {buyOrder, sellOrder} = Strategy.decide(data as Signal);
  // // const buyId: OrderId = buyOrder ? authenticatedClient.sell(buyOrder, () => {}) : null;
  // // const sellId: OrderId = sellOrder ?  authenticatedClient.buy(sellOrder, () => {}) : null;

  // return console.dir(data)
});

// interface Decision {
//   // TODO: These should be generalized to a collection.
//   buyOrder: Order | null;
//   sellOrder: Order | null;
// }

// type Signal = any;
// type Position = any;

// module Strategy {
//   export function decide(signal: Signal = null, position: Position = null): Decision {
//     const buyOrder = null;
//     const sellOrder = null;
//     return {
//       buyOrder,
//       sellOrder
//     };
//   }
// }

setInterval(() => {
  orderBook.render();
}, 1*1000);
