import { PaymentMethod } from '../entities/PaymentMethod';

export interface IPaymentMethodRepository {
  create(paymentMethod: PaymentMethod): Promise<PaymentMethod>;
  getById(id: string): Promise<PaymentMethod | null>;
  getAllByUserId(userId: string): Promise<PaymentMethod[]>;
  update(id: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod>;
  delete(id: string): Promise<void>;
}
