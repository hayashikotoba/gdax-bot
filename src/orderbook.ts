import * as CliTable from '../node_modules/cli-table/lib/index.js'
import * as colors from '../node_modules/colors/lib/index.js';
import * as OrderbookSync from '../node_modules/gdax/lib/orderbook_sync.js';
import * as fp from 'lodash/fp';

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
    const pipe = fp.pipe(
      fp.take(this.level2Cutoff),
      fp.map(ask => {
        const clone = JSON.parse(JSON.stringify(ask));
        clone.price = Number(ask.price).toFixed(PRICE_PRECISION);
        return clone;
      }),
      fp.reduce((groups, x) => {
        const {price} = x;
        groups[price] = groups[price] || []; // Generate entry if D.N.E.
        groups[price].push(x); // Mutate entry rather than immutable commit with .concat for performance.
        return groups;
      }, {})
    );
    return pipe(quotes);
  }

  private reduceGroups(groups) {
    const reducer = fp.mapValues(group => group.map(({size}) => Number(size)).reduce((total, size) => total + Number(size), 0));
    return reducer(groups);
  }

  private getSupplyDemandGroups() {
    const currencyPair: CurrencyPair = this.currencies[0];
    const {asks, bids} = this.orderBook.books[currencyPair].state();
    return {
      supply: this.reduceGroups(this.groupQuotesByPrice(asks)),
      demand: this.reduceGroups(this.groupQuotesByPrice(bids)),
    };
  }

  // Map row object to CLI table row.
  public static readonly pluckForTable = (({price, size}) => [price, size]);

  render(currency: CurrencyPair, bookDepth: number = null) {
    if(this.currencies.indexOf(currency) < 0) {
      throw `Currency ${currency} not in Orderbook`;
    }

    const {supply, demand} = this.getSupplyDemandGroups();
    const toTableRow = fp.pipe(
      fp.toPairs,
      fp.take(bookDepth || this.bookDepth),
    );
    const headSupply = toTableRow(supply);
    const headDemand = toTableRow(demand);

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