export type GolomtMerchantCallbackRequest = {
  status: string;
  amount: string;
  bank: string;
  errorDesc: string;
  checksum: string;
  errorCode?: string;
  cardHolder: string;
  transactionId: string;
  cardNumber: string;
  token: string;
};
