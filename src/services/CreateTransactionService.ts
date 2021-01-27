import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!['income', 'outcome'].includes(type)) {
      throw Error('Transaction type invalid');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    let { total } = await transactionsRepository.getBalance();

    if (type === 'outcome') {
      total -= value;

      if (total < 0) {
        throw new AppError('No enough money');
      }
    }

    const categoryRepository = getRepository(Category);
    const checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!checkCategoryExists) {
      const newCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(newCategory);

      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category: newCategory,
      });

      await transactionsRepository.save(transaction);

      return transaction;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: checkCategoryExists,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
