import { Component, computed, signal } from '@angular/core';
import {
  applyWhen,
  email,
  form,
  FormField,
  hidden,
  min,
  minLength,
  pattern,
  required,
  schema,
  validate,
} from '@angular/forms/signals';

// ============================================================
// Types
// ============================================================
type DocumentType = 'invoice' | 'quote' | 'credit-note';
type DeliveryMethod = 'email' | 'post' | 'pickup';

interface DynamicDocument {
  // Common fields
  documentType: DocumentType;
  customerName: string;
  customerEmail: string;

  // Invoice-specific
  invoiceNumber: string;
  dueDate: string;
  taxRate: number;

  // Quote-specific
  validUntil: string;
  discount: number;

  // Credit-Note-specific
  originalInvoice: string;
  reason: string;

  // Delivery
  deliveryMethod: DeliveryMethod;
  postalAddress: string;
  pickupLocation: string;
}

// ============================================================
// Conditional Schemas - activated via applyWhen
// ============================================================
const invoiceSchema = schema<DynamicDocument>((doc) => {
  required(doc.invoiceNumber, { message: 'Invoice number is required' });
  pattern(doc.invoiceNumber, /^INV-\d{4}-\d{3,}$/, {
    message: 'Format: INV-YYYY-NNN',
  });
  required(doc.dueDate, { message: 'Due date is required' });
  required(doc.taxRate, { message: 'Tax rate is required' });
  min(doc.taxRate, 0, { message: 'Tax rate cannot be negative' });
});

const quoteSchema = schema<DynamicDocument>((doc) => {
  required(doc.validUntil, { message: 'Valid-until date is required' });
  min(doc.discount, 0, { message: 'Discount cannot be negative' });
  validate(doc.discount, ({ value }) => {
    if (value() > 100) {
      return { kind: 'maxDiscount', message: 'Discount cannot exceed 100%' };
    }
    return null;
  });
});

const creditNoteSchema = schema<DynamicDocument>((doc) => {
  required(doc.originalInvoice, {
    message: 'Original invoice reference is required',
  });
  pattern(doc.originalInvoice, /^INV-\d{4}-\d{3,}$/, {
    message: 'Format: INV-YYYY-NNN',
  });
  required(doc.reason, { message: 'Reason for credit note is required' });
  minLength(doc.reason, 10, {
    message: 'Please provide more detail (min 10 characters)',
  });
});

@Component({
  selector: 'app-dynamic-forms',
  imports: [FormField],
  templateUrl: './dynamic-forms.component.html',
})
export class DynamicFormsComponent {
  documentTypes = [
    { value: 'invoice' as DocumentType, label: 'Invoice', icon: '🧾' },
    { value: 'quote' as DocumentType, label: 'Quote', icon: '📋' },
    { value: 'credit-note' as DocumentType, label: 'Credit Note', icon: '💳' },
  ];

  docModel = signal<DynamicDocument>({
    documentType: 'invoice',
    customerName: '',
    customerEmail: '',
    invoiceNumber: '',
    dueDate: '',
    taxRate: 19,
    validUntil: '',
    discount: 0,
    originalInvoice: '',
    reason: '',
    deliveryMethod: 'email',
    postalAddress: '',
    pickupLocation: '',
  });

  docForm = form(this.docModel, (doc) => {
    // Common validation
    required(doc.customerName, { message: 'Customer name is required' });
    required(doc.customerEmail, { message: 'Customer email is required' });
    email(doc.customerEmail, { message: 'Please enter a valid email' });

    // Document-type-specific fields: hide when not relevant
    hidden(
      doc.invoiceNumber,
      ({ valueOf }) => valueOf(doc.documentType) !== 'invoice',
    );
    hidden(
      doc.dueDate,
      ({ valueOf }) => valueOf(doc.documentType) !== 'invoice',
    );
    hidden(
      doc.taxRate,
      ({ valueOf }) => valueOf(doc.documentType) !== 'invoice',
    );

    hidden(
      doc.validUntil,
      ({ valueOf }) => valueOf(doc.documentType) !== 'quote',
    );
    hidden(
      doc.discount,
      ({ valueOf }) => valueOf(doc.documentType) !== 'quote',
    );

    hidden(
      doc.originalInvoice,
      ({ valueOf }) => valueOf(doc.documentType) !== 'credit-note',
    );
    hidden(
      doc.reason,
      ({ valueOf }) => valueOf(doc.documentType) !== 'credit-note',
    );

    // Conditionally apply schemas based on document type
    applyWhen(
      doc,
      ({ valueOf }) => valueOf(doc.documentType) === 'invoice',
      invoiceSchema,
    );
    applyWhen(
      doc,
      ({ valueOf }) => valueOf(doc.documentType) === 'quote',
      quoteSchema,
    );
    applyWhen(
      doc,
      ({ valueOf }) => valueOf(doc.documentType) === 'credit-note',
      creditNoteSchema,
    );

    // Delivery method conditionals
    hidden(
      doc.postalAddress,
      ({ valueOf }) => valueOf(doc.deliveryMethod) !== 'post',
    );
    hidden(
      doc.pickupLocation,
      ({ valueOf }) => valueOf(doc.deliveryMethod) !== 'pickup',
    );

    required(doc.postalAddress, {
      message: 'Postal address is required for mail delivery',
      when: ({ valueOf }) => valueOf(doc.deliveryMethod) === 'post',
    });
    required(doc.pickupLocation, {
      message: 'Please select a pickup location',
      when: ({ valueOf }) => valueOf(doc.deliveryMethod) === 'pickup',
    });
  });

  activeDocLabel = computed(() => {
    const type = this.docModel().documentType;
    return this.documentTypes.find((t) => t.value === type)?.label ?? type;
  });

  switchDocumentType(type: DocumentType) {
    this.docModel.update((m) => ({ ...m, documentType: type }));
  }
}
