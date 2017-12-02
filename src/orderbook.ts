import * as CliTable from '../node_modules/cli-table/lib/index.js'
import * as colors from '../node_modules/colors/lib/index.js';
import * as OrderbookSync from '../node_modules/gdax/lib/orderbook_sync.js';

type CurrencyPair = 'ETH-USD';

class Orderbook {
  private readonly orderBook: OrderbookSync;

  constructor(
      private readonly currencies: CurrencyPair[],
      private readonly bookDepth: number = 20,
    ) {
    this.orderBook = new OrderbookSync(currencies);
  }

  private getSupplyDemandTable() {
    const currencyPair: CurrencyPair = this.currencies[0];
    const {asks, bids} = this.orderBook.books[currencyPair].state();

    // group by ask price.
    const askGroups = asks.slice(0, 1000).map(ask => {
      const clone = JSON.parse(JSON.stringify(ask));
      clone.price = Number(ask.price).toFixed(2); // Normalize feed data.
      return clone;
    })
    .reduce((groups, x) => {
      const {price} = x;
      groups[price] = groups[price] || []; // Generate entry if D.N.E.
      groups[price].push(x); // Mutate entry rather than immutable commit with .concat for performance.
      return groups;
    },{});
    const supplyRows = [];
    Object.keys(askGroups).forEach(key => {
      const group = askGroups[key];
      // Sum up total order size at given price
      supplyRows.push({
        price: key,
        size: group.map(({size}) => Number(size)).reduce((total, size) => total + Number(size), 0)
      });
    })
    // Trim to unique price depth.
    const headSupplyRows = supplyRows.slice(0, this.bookDepth).map(({price, size}) => [price, size]);

    const bidGroups = bids.slice(0, 1000).map(bid => {
      const clone = JSON.parse(JSON.stringify(bid));
      clone.price = Number(bid.price).toFixed(2); // Normalize feed data.
      return clone;
    })
    .reduce((groups, x) => {
      const {price} = x;
      groups[price] = groups[price] || []; // Generate entry if D.N.E.
      groups[price].push(x); // Mutate entry rather than immutable commit with .concat for performance.
      return groups;
    },{});
    const demandRows = [];
    Object.keys(bidGroups).forEach(key => {
      const group = bidGroups[key];
      // Sum up total order size at given price
      demandRows.push({
        price: key,
        size: group.map(({size}) => Number(size)).reduce(
          (total, size) => total + Number(size), 0)
      });
    })
    const headDemandRows = demandRows.slice(0, this.bookDepth).map(
      ({price, size}) => [price, size]);

    return {
      headSupplyRows,
      headDemandRows
    }
  }

  render() {
    const {headSupplyRows, headDemandRows} = this.getSupplyDemandTable();
    const supplyTable = new CliTable({
      head: ['Price', 'Market Size'],
      style: { 'padding-left': 0, 'padding-right': 0 }
    });
    supplyTable.push(...headSupplyRows);
    const demandTable = new CliTable({
      head: ['Price', 'Size'],
      style: { 'padding-left': 0, 'padding-right': 0 }
    });
   demandTable.push(...headDemandRows);
    console.log(colors.red('supply'));
    console.log(supplyTable.toString());
    console.log(colors.green('demand'));
    console.log(demandTable.toString());
  }
}


export const orderBook = new Orderbook(['ETH-USD']);

