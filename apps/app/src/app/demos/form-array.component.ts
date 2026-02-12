import { Component, computed, signal } from '@angular/core';
import {
  applyEach,
  form,
  FormField,
  min,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';

interface LineItem {
  product: string;
  quantity: number;
  price: number;
}

interface Invoice {
  customer: string;
  items: LineItem[];
  notes: string;
}

// Schema for each line item - applied via applyEach
const lineItemSchema = schema<LineItem>((item) => {
  required(item.product, { message: 'Product name is required' });
  required(item.quantity, { message: 'Quantity is required' });
  min(item.quantity, 1, { message: 'Quantity must be at least 1' });
  required(item.price, { message: 'Price is required' });
  min(item.price, 0.01, { message: 'Price must be greater than 0' });
});

@Component({
  selector: 'app-form-array',
  imports: [FormField, JsonPipe],
  templateUrl: './form-array.component.html',
})
export class FormArrayComponent {
  invoiceModel = signal<Invoice>({
    customer: '',
    items: [{ product: '', quantity: 1, price: 0 }],
    notes: '',
  });

  invoiceForm = form(this.invoiceModel, (inv) => {
    required(inv.customer, { message: 'Customer is required' });

    // Apply validation to each item in the array
    applyEach(inv.items, lineItemSchema);

    // Validate at least 1 item
    validate(inv.items, ({ value }) => {
      if (value().length === 0) {
        return { kind: 'minItems', message: 'At least one item is required' };
      }
      return null;
    });
  });

  total = computed(() => {
    return this.invoiceModel().items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
  });

  addItem() {
    this.invoiceModel.update((m) => ({
      ...m,
      items: [...m.items, { product: '', quantity: 1, price: 0 }],
    }));
  }

  removeItem(index: number) {
    this.invoiceModel.update((m) => ({
      ...m,
      items: m.items.filter((_, i) => i !== index),
    }));
  }
}
