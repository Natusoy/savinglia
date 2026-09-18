import type { Order } from "../domain/order";
export interface OrderRepository {
  list(): Promise<Order[]>;
  save(order: Order): Promise<void>;
  reset(): Promise<Order[]>;
}
