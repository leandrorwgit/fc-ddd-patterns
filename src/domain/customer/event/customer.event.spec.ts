import EventDispatcher from '../../@shared/event/event-dispatcher'
import Customer from '../../customer/entity/customer'
import Address from '../value-object/address'
import CustomerChangedAddressEvent from './customer-changed-address.event'
import CustomerCreatedEvent from './customer-created.event'
import SendLogWhenCustomerAddressIsChangedHandler from './handler/send-log-when-address-customer-is-changed.handler'
import SendLog1WhenCustomerIsCreatedHandler from './handler/send-log1-when-customer-is-created.handler'
import SendLog2WhenCustomerIsCreatedHandler from './handler/send-log2-when-customer-is-created.handler'

describe('Customer Events Unit Tests', () => {
  test('customer created events', () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandlerLog1 = new SendLog1WhenCustomerIsCreatedHandler();
    const spyEventHandler = jest.spyOn(eventHandlerLog1, "handle");
    const eventHandlerLog2 = new SendLog2WhenCustomerIsCreatedHandler();
    const spyEventHandler2 = jest.spyOn(eventHandlerLog2, "handle");    

    eventDispatcher.register("CustomerCreatedEvent", eventHandlerLog1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerLog2);

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(eventHandlerLog1);
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]).toMatchObject(eventHandlerLog2);

    const customer = new Customer('1', 'Customer 1')
    const customerCreatedEvent = new CustomerCreatedEvent(customer);

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  })

  test('customer changed address event', () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendLogWhenCustomerAddressIsChangedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("CustomerChangedAddressEvent", eventHandler);

    expect(eventDispatcher.getEventHandlers["CustomerChangedAddressEvent"][0]).toMatchObject(eventHandler);

    const customer = new Customer('1', 'Customer 1')
    const address = new Address("Street 1", 123, "13330-250", "São Paulo");
    customer.changeAddress(address);
    const customerChangedAddressEvent = new CustomerChangedAddressEvent(customer);

    eventDispatcher.notify(customerChangedAddressEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  })
})