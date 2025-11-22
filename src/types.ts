export interface Transfer {
  id: number;
  from_address: string;
  to_address: string;
  amount: string; // Ether amount as string (e.g., "56.99140")
  block_number: string;
  transaction_hash: string;
  log_index: number;
  timestamp: Date;
}

export interface AccountCreation {
  id: number;
  created_address: string;
  contract_address: string;
  key_slot: number;
  key_hash1: string;
  key_hash2: string;
  init_dest: string;
  init_value: string;
  block_number: string;
  transaction_hash: string;
  log_index: number;
  timestamp: Date;
  event_type: 'account_creation'; // To distinguish from transfers
}

export type TransferEvent = Transfer & { event_type: 'transfer' };
export type AccountCreationEvent = AccountCreation;

export type LiveEvent = TransferEvent | AccountCreationEvent;

export interface FormattedTransferResponse {
  range: '30s' | '24h' | '7d' | '30d';
  transfers: string[]; // Formatted strings like "MM/DD/YYYY, HH:MM 1tx of 56.99140 tokens"
  count: number;
}

export interface TransfersResponse {
  range?: '30s' | '24h' | '7d' | '30d'; // Present when using range filter
  day?: string; // Unix timestamp (present when using day filter)
  transfers: Transfer[];
  count: number;
}

export interface LiveTransferResponse {
  transfers: Transfer[];
  count: number;
}

export interface RecentTransfersResponse {
  transfers: Array<{
    id: number;
    from_address: string;
    to_address: string;
    amount: number;
    block_number: number;
    transaction_hash: string;
    log_index: number;
    timestamp: string;
  }>;
  count: number;
  timeframe: string;
  limit: string;
}

export interface TokenInfo {
  price: string;
  logo: string;
  historical_prices?: Array<{
    offset_hours: number;
    price_usd: number;
  }>;
}

export interface WebSocketMessage {
  type: 'get_token_price' | 'subscribe' | 'token_price_update' | 'new_transfer' | 'new_account_creation';
  topic?: 'token-updates' | 'transfers' | 'account_creations';
}

export interface NewTransfer {
  type: 'new_transfer';
  data: Transfer;
  timestamp: string;
}

export interface NewAccountCreation {
  type: 'new_account_creation';
  data: {
    created_address: string;
    contract_address: string;
    key_slot: number;
    key_hash1: string;
    key_hash2: string;
    init_dest: string;
    init_value: string;
    block_number: string;
    transaction_hash: string;
    log_index: number;
    timestamp: string;
  };
  timestamp: string;
}

export interface TransferWebSocketResponse {
  type: 'new_transfer';
  data: Transfer;
  timestamp: string;
}

export interface AccountCreationWebSocketResponse {
  type: 'new_account_creation';
  data: {
    created_address: string;
    contract_address: string;
    key_slot: number;
    key_hash1: string;
    key_hash2: string;
    init_dest: string;
    init_value: string;
    block_number: string;
    transaction_hash: string;
    log_index: number;
    timestamp: string;
  };
  timestamp: string;
}

export interface TokenPriceWebSocketResponse {
  type: 'token_price_update';
  data: {
    price: number;
    logo: string;
    timestamp: string;
  };
  timestamp: string;
}

export type WebSocketResponse = TransferWebSocketResponse | AccountCreationWebSocketResponse | TokenPriceWebSocketResponse;

export interface SubscribeMessage {
  type: 'subscribe';
  topic: 'token-updates' | 'transfers' | 'account_creations';
}

export interface GetTokenPriceMessage {
  type: 'get_token_price';
}