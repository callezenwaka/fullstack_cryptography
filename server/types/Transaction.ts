type timestamp = { toNumber: () => number; };
type amount = { _hex: string; };

interface Transaction {
  receiver: string;
  sender: string;
  timestamp: timestamp;
  message: string;
  amount: amount;
}

export default Transaction;