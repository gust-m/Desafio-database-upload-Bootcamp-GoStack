import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Request {
  type: 'income' | 'outcome';
  value: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance({ type, value }: Request): Promise<Balance> {
    const allTransactions = await this.find({
      where: [{ type: 'income' }, { type: 'outcome' }],
    });

    const { income, outcome } = allTransactions.reduce(
      (accumulator: Balance, transaction: Transaction) => {
        if (transaction.type === 'income') {
          accumulator.income += transaction.value;
        }

        if (transaction.type === 'outcome') {
          accumulator.outcome += transaction.value;
        }

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    let total = income - outcome;

    if (type === 'outcome') {
      total -= value;

      return { income, outcome, total };
    }

    total += value;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
