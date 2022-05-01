import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      //storage: './database.sqlite',
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customerId: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update a order", async () => {
    // Create order 
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const customer2 = new Customer("222", "Customer 2");
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
    customer2.changeAddress(address2);
    await customerRepository.create(customer2);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const product2 = new Product("222", "Product 2", 20);
    await productRepository.create(product2);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );
    const ordemItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      1
    );

    const order = new Order("123", customer.id, [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    // Change order
    order.changeCustomer(customer2.id);
    order.changeItens([ordemItem, ordemItem2]);

    await orderRepository.update(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    // Verify 
    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customerId: customer2.id,
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          order_id: order.id,
          price: ordemItem.price,
          product_id: product.id,
          quantity: ordemItem.quantity,          
        },
        {
          id: ordemItem2.id,
          name: ordemItem2.name,
          order_id: order.id,
          price: ordemItem2.price,
          product_id: product2.id,
          quantity: ordemItem2.quantity,          
        },
      ],
    });

  });

  it("should find a order", async () => {
    // Create order 
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      1
    );

    const order = new Order("123", customer.id, [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    const orderResult = await orderRepository.find(order.id);

    expect(orderModel.toJSON()).toStrictEqual({
      id: orderResult.id,
      customerId: orderResult.customerId,
      total: orderResult.total(),
      items: [
        {
          id: orderResult.items[0].id,
          name: orderResult.items[0].name,
          price: orderResult.items[0].price,
          quantity: orderResult.items[0].quantity,
          order_id: orderResult.id,
          product_id: orderResult.items[0].productId,
        },
      ],
    });
  });

  it("should throw an error when customer is not found", async () => {
    const customerRepository = new CustomerRepository();

    expect(async () => {
      await customerRepository.find("456ABC");
    }).rejects.toThrow("Customer not found");
  });

  it("should find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product1 = new Product("p1", "Product 1", 10);
    await productRepository.create(product1);

    const orderItem1 = new OrderItem(
      "1",
      product1.name,
      product1.price,
      product1.id,
      1
    );

    const order1 = new Order("1", customer.id, [orderItem1]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order1);

    const product2 = new Product("p2", "Product 2", 10);
    await productRepository.create(product2);

    const orderItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      1
    );

    const order2 = new Order("2", customer.id, [orderItem2]);

    await orderRepository.create(order2);

    const orderModel = await orderRepository.findAll();

    expect(orderModel).toHaveLength(2);
    expect(orderModel).toContainEqual(order1);
    expect(orderModel).toContainEqual(order2);
  });

});
