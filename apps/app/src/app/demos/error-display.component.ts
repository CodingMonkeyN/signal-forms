import { Component, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-error-display',
  imports: [FormField, JsonPipe],
  templateUrl: './error-display.component.html',
})
export class ErrorDisplayComponent {
  serverError: string | null = null;
  submitSuccess = false;
  showGlobalErrors = signal(false);

  contactModel = signal({
    name: '',
    email: '',
    phone: '',
    message: '',
    age: 0,
  });

  contactForm = form(this.contactModel, (c) => {
    required(c.name, { message: 'Full name is required' });
    minLength(c.name, 2, { message: 'Name must be at least 2 characters' });

    required(c.email, { message: 'Email is required' });
    email(c.email, { message: 'Please enter a valid email address' });

    required(c.phone, { message: 'Phone number is required' });
    pattern(c.phone, /^\+?[\d\s-]{7,15}$/, {
      message: 'Enter a valid phone number (e.g. +49 170 1234567)',
    });

    required(c.message, { message: 'Message is required' });
    minLength(c.message, 10, {
      message: 'Message must be at least 10 characters',
    });
    maxLength(c.message, 500, {
      message: 'Message cannot exceed 500 characters',
    });

    required(c.age, { message: 'Age is required' });
    min(c.age, 18, { message: 'You must be at least 18 years old' });
  });

  fieldNames = ['name', 'email', 'phone', 'message', 'age'] as const;

  getFieldErrors(field: string): any[] {
    return (this.contactForm as any)[field]().errors();
  }

  async onSubmit() {
    this.serverError = null;
    this.submitSuccess = false;
    this.showGlobalErrors.set(true);

    await submit(this.contactForm, async (f) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate server-side validation error
      if (f.email().value() === 'taken@example.com') {
        this.serverError =
          'Server rejected the submission. See field errors below.';
        return [
          {
            fieldTree: this.contactForm.email,
            kind: 'server',
            message: 'This email address is already registered',
          },
        ];
      }

      this.submitSuccess = true;
      this.showGlobalErrors.set(false);
      return undefined;
    });
  }

  onReset() {
    this.contactForm().reset({
      name: '',
      email: '',
      phone: '',
      message: '',
      age: 0,
    });
    this.serverError = null;
    this.submitSuccess = false;
    this.showGlobalErrors.set(false);
  }
}
