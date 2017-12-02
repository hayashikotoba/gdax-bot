import * as CliTable from '../node_modules/cli-table/lib/index.js'
import * as colors from '../node_modules/colors/lib/index.js';
import * as OrderbookSync from '../node_modules/gdax/lib/orderbook_sync.js';

export type CurrencyPair = 'ETH-USD';

// Number of decimals L2 data has.
const PRICE_PRECISION = 2;

class Orderbook {
  private readonly orderBook: OrderbookSync;

  constructor(
      private readonly currencies: CurrencyPair[],
      private readonly bookDepth: number = 20,
      // Amount of LevelII data to look at. 
      // TODO: There should be indication of number n in the tail of aggregated data
      // that is inaccurate because of cutoff.
      private readonly level2Cutoff: number = 1000,
    ) {
    this.orderBook = new OrderbookSync(currencies);
  }

  private groupQuotesByPrice(quotes) {
    return quotes
      .slice(0, this.level2Cutoff)
      .map(ask => {
        const clone = JSON.parse(JSON.stringify(ask));
        clone.price = Number(ask.price).toFixed(PRICE_PRECISION);
        return clone;
      })
      .reduce((groups, x) => {
        const {price} = x;
        groups[price] = groups[price] || []; // Generate entry if D.N.E.
        groups[price].push(x); // Mutate entry rather than immutable commit with .concat for performance.
        return groups;
      },{});
  }

  private reduceGroups(groups) {
    const reducedGroups = [];
    Object.keys(groups).forEach(key => {
      const group = groups[key];
      // Sum up total order size at given price
      reducedGroups.push({
        price: key,
        size: group.map(({size}) => Number(size)).reduce((total, size) => total + Number(size), 0)
      });
    });
    return reducedGroups;
  }

  private trimRows(rows, bookDepth) {
    return rows.slice(0, bookDepth).map(({price, size}) => [price, size]);
  }

  private getSupplyDemandRows() {
    const currencyPair: CurrencyPair = this.currencies[0];
    const {asks, bids} = this.orderBook.books[currencyPair].state();
    return {
      supply: this.reduceGroups(this.groupQuotesByPrice(asks)),
      demand: this.reduceGroups(this.groupQuotesByPrice(bids)),
    };
  }

  render(currency: CurrencyPair, bookDepth: number = null) {
    if(this.currencies.indexOf(currency) < 0) {
      throw `Currency ${currency} not in Orderbook`;
    }

    const {supply, demand} = this.getSupplyDemandRows();
    const headSupply = this.trimRows(supply, bookDepth || this.bookDepth);
    const headDemand = this.trimRows(demand, bookDepth || this.bookDepth);

    const supplyTable = new CliTable({
      head: ['Price', 'Market Size'],
      style: { 'padding-left': 0, 'padding-right': 0 }
    });
    supplyTable.push(...headSupply);
    const demandTable = new CliTable({
      head: ['Price', 'Size'],
      style: { 'padding-left': 0, 'padding-right': 0 }
    });
   demandTable.push(...headDemand);
    console.log(colors.red('supply'));
    console.log(supplyTable.toString());
    console.log(colors.green('demand'));
    console.log(demandTable.toString());
  }
}


export const orderBook = new Orderbook(['ETH-USD']);

