import { Component, signal } from '@angular/core';
import {
  form,
  FormField,
  required,
  min,
  validate,
  disabled,
  hidden,
  readonly,
  debounce,
} from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';

type CustomerType = 'personal' | 'business';
type PaymentMethod = 'card' | 'invoice' | 'paypal';

interface OrderConfig {
  customerType: CustomerType;
  companyName: string;
  vatNumber: string;
  paymentMethod: PaymentMethod;
  cardNumber: string;
  invoiceReference: string;
  quantity: number;
  discountCode: string;
  notes: string;
}

@Component({
  selector: 'app-conditional-form',
  imports: [FormField, JsonPipe],
  templateUrl: './conditional-form.component.html',
})
export class ConditionalFormComponent {
  configModel = signal<OrderConfig>({
    customerType: 'personal',
    companyName: '',
    vatNumber: '',
    paymentMethod: 'card',
    cardNumber: '',
    invoiceReference: '',
    quantity: 1,
    discountCode: '',
    notes: '',
  });

  configForm = form(this.configModel, (order) => {
    // Hidden when not business
    hidden(
      order.companyName,
      ({ valueOf }) => valueOf(order.customerType) !== 'business',
    );
    hidden(
      order.vatNumber,
      ({ valueOf }) => valueOf(order.customerType) !== 'business',
    );

    // Conditionally required when visible
    required(order.companyName, {
      message: 'Company name is required for business customers',
      when: ({ valueOf }) => valueOf(order.customerType) === 'business',
    });

    // Payment-specific fields
    hidden(
      order.cardNumber,
      ({ valueOf }) => valueOf(order.paymentMethod) !== 'card',
    );
    hidden(
      order.invoiceReference,
      ({ valueOf }) => valueOf(order.paymentMethod) !== 'invoice',
    );

    required(order.cardNumber, {
      message: 'Card number is required',
      when: ({ valueOf }) => valueOf(order.paymentMethod) === 'card',
    });

    // Disabled for business customers
    disabled(
      order.discountCode,
      ({ valueOf }) => valueOf(order.customerType) === 'business',
    );

    // Quantity validation
    required(order.quantity, { message: 'Quantity is required' });
    min(order.quantity, 1, { message: 'Minimum quantity is 1' });

    // Debounce the notes field
    debounce(order.notes, 500);
  });
}
