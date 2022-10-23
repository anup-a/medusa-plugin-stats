import { OrderService, OrderStatus, ProductService } from "@medusajs/medusa";
import { OrderRepository } from "@medusajs/medusa/dist/repositories/order";
import {
  Between,
  EntityManager,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
} from "typeorm";
import { format } from "date-fns";
import { ProductRepository } from "@medusajs/medusa/dist/repositories/product";
import { CustomerRepository } from "@medusajs/medusa/dist/repositories/customer";
import { BaseService } from "medusa-interfaces";

type InjectedDependencies = {
  manager: EntityManager;
  orderRepository: typeof OrderRepository;
  orderService: OrderService;
  productService: ProductService;
  productRepository: typeof ProductRepository;
  customerRepository: typeof CustomerRepository;
};

enum EDateType {
  Date = "yyyy-MM-dd",
  Datetime = "yyyy-MM-dd HH:MM:ss",
}

const MoreThanDate = (date: Date, type: EDateType) =>
  MoreThan(format(date, type));
const MoreThanOrEqualDate = (date: Date, type: EDateType) =>
  MoreThanOrEqual(format(date, type));
const LessThanDate = (date: Date, type: EDateType) =>
  LessThan(format(date, type));
const LessThanOrEqualDate = (date: Date, type: EDateType) =>
  LessThanOrEqual(format(date, type));
const BetweenDate = (from: Date, end: Date, type: EDateType) =>
  Between(format(from, type), format(end, type));

class StatsService extends BaseService {
  public declare manager_: EntityManager;
  public declare transactionManager_: EntityManager;
  protected orderRepository_: typeof OrderRepository;
  protected orderService_: OrderService;
  protected productService_: ProductService;
  protected productRepository_: typeof ProductRepository;
  protected customerRepository_: typeof CustomerRepository;

  constructor({
    manager,
    orderRepository,
    orderService,
    productService,
    productRepository,
    customerRepository,
  }: InjectedDependencies) {
    super();
    this.manager_ = manager;
    this.orderRepository_ = orderRepository;
    this.orderService_ = orderService;
    this.productService_ = productService;
    this.productRepository_ = productRepository;
    this.customerRepository_ = customerRepository;
  }

  // Number of orders
  async fetchOrdersStats(
    range: {
      startDate: Date;
      endDate: Date;
    },
    groupBy: "status" | "period"
  ): Promise<any> {
    const orderRepo = this.manager_.getCustomRepository(this.orderRepository_);

    const groupBy_ =
      groupBy === "status" ? "order.status" : "DATE(order.created_at)";

    const ordersCount = orderRepo
      .createQueryBuilder("order")
      .select(`${groupBy_}`)
      .addSelect(`COUNT(order.id) as count`)
      .groupBy(`${groupBy_}`)
      .where({
        created_at: BetweenDate(
          range.startDate,
          range.endDate,
          EDateType.Datetime
        ),
      })
      .getRawMany();

    return ordersCount;
  }

  // total sales
  async fetchSalesStats(range: {
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    const orders = await this.orderService_.list(
      {
        created_at: BetweenDate(
          range.startDate,
          range.endDate,
          EDateType.Datetime
        ),
        status: OrderStatus.COMPLETED,
      },
      {
        select: [
          "id",
          "currency",
          "total",
          "discount_total",
          "status",
          "created_at",
        ],
        take: undefined,
      }
    );
    const ordersSalesMap: Object = {};

    orders.reduce((acc, order) => {
      if (!order.created_at) return;
      const created_at = order.created_at;
      const date = format(created_at, "MM/dd/yyyy");
      if (ordersSalesMap[date])
        return (ordersSalesMap[date] += order.total / 100);
      return (ordersSalesMap[date] = order.total / 100);
    }, ordersSalesMap);

    const orderSales = Object.entries(ordersSalesMap).map((entry) => ({
      date: entry[0],
      value: entry[1],
    }));

    return orderSales;
  }

  // New Products Added By Period
  async fetchProductsStats(range: {
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    const productRepo = this.manager_.getCustomRepository(
      this.productRepository_
    );

    const productCount = productRepo
      .createQueryBuilder("product")
      .select("DATE(product.created_at)")
      .addSelect("COUNT(product.id) as count")
      .groupBy("DATE(product.created_at)")
      .where({
        created_at: Between(range.startDate, range.endDate),
        status: "published",
      })
      .getRawMany();

    return productCount;
  }

  // New Customer signed up Period
  async fetchCustomerStats(range: {
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    const customerRepo = this.manager_.getCustomRepository(
      this.customerRepository_
    );

    const customerCount = customerRepo
      .createQueryBuilder("customer")
      .select("DATE(customer.created_at)")
      .addSelect("COUNT(customer.id) as count")
      .groupBy("DATE(customer.created_at)")
      .where({
        created_at: Between(range.startDate, range.endDate),
      })
      .getRawMany();

    return customerCount;
  }
}

export default StatsService;
