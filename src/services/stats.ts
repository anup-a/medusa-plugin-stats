import {
  OrderService,
  OrderStatus,
  PaymentStatus,
  ProductService,
} from "@medusajs/medusa";
import { CustomerRepository } from "@medusajs/medusa/dist/repositories/customer";
import { OrderRepository } from "@medusajs/medusa/dist/repositories/order";
import { ProductRepository } from "@medusajs/medusa/dist/repositories/product";
import { BaseService } from "medusa-interfaces";
import { EntityManager } from "typeorm";
import {
  BetweenDate,
  EDateType,
  getNumericValue,
  PeriodType,
  transformTimeSeries,
} from "../utils";

type InjectedDependencies = {
  manager: EntityManager;
  orderRepository: typeof OrderRepository;
  orderService: OrderService;
  productService: ProductService;
  productRepository: typeof ProductRepository;
  customerRepository: typeof CustomerRepository;
};

class StatsService extends BaseService {
  public manager_: EntityManager;
  public transactionManager_: EntityManager;
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
    period: PeriodType
  ): Promise<any> {
    const orderRepo = this.manager_.getCustomRepository(this.orderRepository_);

    const groupBy_ = `date_trunc('${period}', order.created_at)`;

    const ordersCount = await orderRepo
      .createQueryBuilder("order")
      .select(`${groupBy_} as timestamp`)
      .addSelect(
        `COUNT(order.id) as value, (select COUNT(*) from "order") as total`
      )
      .groupBy(`${groupBy_}`)
      .where({
        created_at: BetweenDate(
          range.startDate,
          range.endDate,
          EDateType.Datetime
        ),
      })
      .getRawMany();

    const metrics = { total: ordersCount.length ? ordersCount[0].total : 0 };
    const result = { ...transformTimeSeries(ordersCount), metrics, period };
    return result;
  }

  // total sales
  async fetchSalesStats(
    range: {
      startDate: Date;
      endDate: Date;
    },
    period: PeriodType
  ): Promise<any> {
    const orderRepo = this.manager_.getCustomRepository(this.orderRepository_);

    const groupBy_ = `date_trunc('${period}', order.created_at)`;

    let ordersCount = await orderRepo
      .createQueryBuilder("order")
      .select(`${groupBy_} as timestamp`)
      .addSelect(
        `SUM(order_items.unit_price * order_items.fulfilled_quantity) as value`
      )
      .innerJoin(
        "order.items",
        "order_items",
        "order_items.order_id = order.id"
      )
      .groupBy(`${groupBy_}`)
      .where({
        created_at: BetweenDate(
          range.startDate,
          range.endDate,
          EDateType.Datetime
        ),
        canceled_at: null,
        payment_status: PaymentStatus.CAPTURED,
        status: OrderStatus.COMPLETED,
      })
      .getRawMany();

    const total = await orderRepo
      .createQueryBuilder("order")
      .select(
        `SUM(order_items.unit_price * order_items.fulfilled_quantity) as value`
      )
      .innerJoin(
        "order.items",
        "order_items",
        "order_items.order_id = order.id"
      )
      .where({
        canceled_at: null,
        payment_status: PaymentStatus.CAPTURED,
        status: OrderStatus.COMPLETED,
      })
      .getRawOne();

    const metrics = { total: getNumericValue(total.value) };
    const result = { ...transformTimeSeries(ordersCount), metrics, period };
    return result;
  }

  // New Products Added By Period
  async fetchProductsStats(
    range: {
      startDate: Date;
      endDate: Date;
    },
    period: PeriodType
  ): Promise<any> {
    const productRepo = this.manager_.getCustomRepository(
      this.productRepository_
    );
    const groupBy_ = `date_trunc('${period}', product.created_at)`;

    const productCount = await productRepo
      .createQueryBuilder("product")
      .select(`${groupBy_} as timestamp`)
      .addSelect("COUNT(product.id) as value")
      .addSelect("(select COUNT(*) from product) as total")
      .groupBy(`${groupBy_}`)
      .where({
        created_at: BetweenDate(
          range.startDate,
          range.endDate,
          EDateType.Datetime
        ),
        status: "published",
        deleted_at: null,
      })
      .getRawMany();

    const metrics = { total: productCount.length ? productCount[0].total : 0 };
    const result = { ...transformTimeSeries(productCount), metrics, period };
    return result;
  }

  // new Customer signed up
  async fetchCustomerStats(
    range: {
      startDate: Date;
      endDate: Date;
    },
    period: PeriodType
  ): Promise<any> {
    const customerRepo = this.manager_.getCustomRepository(
      this.customerRepository_
    );
    const groupBy_ = `date_trunc('${period}', customer.created_at)`;

    const customerCount = await customerRepo
      .createQueryBuilder("customer")
      .select(`${groupBy_} as timestamp`)
      .addSelect("COUNT(customer.id) as value")
      .addSelect("(select COUNT(*) from customer) as total")
      .groupBy(groupBy_)
      .where({
        created_at: BetweenDate(
          range.startDate,
          range.endDate,
          EDateType.Datetime
        ),
      })
      .getRawMany();

    const metrics = {
      total: customerCount.length ? customerCount[0].total : 0,
    };
    const result = { ...transformTimeSeries(customerCount), metrics, period };
    return result;
  }
}

export default StatsService;
