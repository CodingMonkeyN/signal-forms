import { Component, signal } from '@angular/core';
import {
  form,
  FormField,
  required,
  pattern,
  apply,
  schema,
  type SchemaPathTree,
} from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';

interface Address {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

interface OrderForm {
  customerName: string;
  billingAddress: Address;
  shippingAddress: Address;
  sameAsBilling: boolean;
}

// Reusable address schema - define once, use everywhere!
const addressSchema = schema<Address>((addr: SchemaPathTree<Address>) => {
  required(addr.street, { message: 'Street is required' });
  required(addr.city, { message: 'City is required' });
  required(addr.zipCode, { message: 'ZIP code is required' });
  pattern(addr.zipCode, /^\d{5}$/, { message: 'ZIP code must be 5 digits' });
  required(addr.country, { message: 'Country is required' });
});

@Component({
  selector: 'app-address-form',
  imports: [FormField, JsonPipe],
  templateUrl: './address-form.component.html',
})
export class AddressFormComponent {
  orderModel = signal<OrderForm>({
    customerName: '',
    billingAddress: { street: '', city: '', zipCode: '', country: '' },
    shippingAddress: { street: '', city: '', zipCode: '', country: '' },
    sameAsBilling: false,
  });

  orderForm = form(this.orderModel, (order) => {
    required(order.customerName, { message: 'Customer name is required' });

    // Apply the same reusable schema to both addresses
    apply(order.billingAddress, addressSchema);
    apply(order.shippingAddress, addressSchema);
  });
}
