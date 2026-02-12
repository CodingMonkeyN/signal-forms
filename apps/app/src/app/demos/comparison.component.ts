import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  form,
  FormField,
  required,
  email,
  minLength,
  validate,
} from '@angular/forms/signals';

@Component({
  selector: 'app-comparison',
  imports: [ReactiveFormsModule, FormField],
  templateUrl: './comparison.component.html',
})
export class ComparisonComponent {
  // === Reactive Forms ===
  reactiveForm = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: (group) => {
        const password = group.get('password')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return password === confirm ? null : { passwordMismatch: true };
      },
    },
  );

  // === Signal Forms ===
  signalModel = signal({ email: '', password: '', confirmPassword: '' });

  signalForm = form(this.signalModel, (f) => {
    required(f.email, { message: 'Email is required' });
    email(f.email, { message: 'Please enter a valid email' });
    required(f.password, { message: 'Password is required' });
    minLength(f.password, 8, {
      message: 'Password must be at least 8 characters',
    });
    required(f.confirmPassword, { message: 'Please confirm your password' });
    validate(f.confirmPassword, ({ value, valueOf }) => {
      if (value() && value() !== valueOf(f.password)) {
        return { kind: 'passwordMismatch', message: 'Passwords do not match' };
      }
      return null;
    });
  });
}
