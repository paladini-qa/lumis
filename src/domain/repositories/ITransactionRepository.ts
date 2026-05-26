import { Transaction } from '../entities/Transaction';

export interface ITransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  getById(id: string): Promise<Transaction | null>;
  getAllByUserId(userId: string): Promise<Transaction[]>;
  getByStatementMonth(userId: string, statementMonth: Date): Promise<Transaction[]>;
  update(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  delete(id: string): Promise<void>;
}
