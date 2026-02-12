import { Component, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  maxLength,
  minLength,
  pattern,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-registration-form',
  imports: [FormField, JsonPipe],
  templateUrl: './registration-form.component.html',
})
export class RegistrationFormComponent {
  submitted = false;

  regModel = signal({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });

  regForm = form(this.regModel, (reg) => {
    // Username: required, no spaces, min 3 chars
    required(reg.username, { message: 'Username is required' });
    minLength(reg.username, 3, {
      message: 'Username must be at least 3 characters',
    });
    validate(reg.username, ({ value }) => {
      if (value().includes(' ')) {
        return { kind: 'noSpaces', message: 'Username cannot contain spaces' };
      }
      return null;
    });

    // Email
    required(reg.email, { message: 'Email is required' });
    email(reg.email, { message: 'Please enter a valid email address' });

    // Phone (optional but validated if filled)
    pattern(reg.phone, /^\+?[\d\s-]{7,15}$/, {
      message: 'Please enter a valid phone number',
    });

    // Password
    required(reg.password, { message: 'Password is required' });
    minLength(reg.password, 8, {
      message: 'Password must be at least 8 characters',
    });
    validate(reg.password, ({ value }) => {
      const v = value();
      if (v && !/[A-Z]/.test(v)) {
        return {
          kind: 'uppercase',
          message: 'Must contain at least one uppercase letter',
        };
      }
      if (v && !/[0-9]/.test(v)) {
        return { kind: 'digit', message: 'Must contain at least one digit' };
      }
      return null;
    });

    // Confirm password - cross-field validation
    required(reg.confirmPassword, { message: 'Please confirm your password' });
    validate(reg.confirmPassword, ({ value, valueOf }) => {
      if (value() && value() !== valueOf(reg.password)) {
        return { kind: 'passwordMismatch', message: 'Passwords do not match' };
      }
      return null;
    });

    // Bio
    maxLength(reg.bio, 200, { message: 'Bio cannot exceed 200 characters' });
  });

  async onSubmit() {
    await submit(this.regForm, async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      this.submitted = true;
      return undefined;
    });
  }
}
