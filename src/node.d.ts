declare module 'gdax' {
  export class AuthenticatedClient {
    constructor(
      apiKey: string,
      passPhrase: string,
      secret: string,
      apiUri: string,
    )

    getAccounts(callback: Fn): CurrencyAccount[]

    getAccount(id: string, callback: Fn): CurrencyAccount

    sell(order: Order, callback: Fn): OrderId
    
    buy(order: Order, callback: Fn): OrderId
  }
  
  export type currency = 'LTC' | 'USD' | 'BTC' | 'ETH';

  export interface Order {
    price: string,
    size: string,
    product_id: Product
  }

  export interface CurrencyAccount {
    id: string,
    currency: currency,
    balance: string,
    available: string,
    hold: string,
    profile_id: string
  }

  export type OrderId = string;

  export type Fn = Function;

  export let WebsocketClient: any;

  export type Product = 'ETH-USD';

  export let OrderbookSync: any;
}

