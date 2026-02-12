import { Component, signal } from '@angular/core';
import {
  form,
  FormField,
  required,
  email,
  minLength,
} from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-basic-form',
  imports: [FormField, JsonPipe],
  templateUrl: './basic-form.component.html',
})
export class BasicFormComponent {
  loginModel = signal({ email: '', password: '' });

  loginForm = form(this.loginModel, (login) => {
    required(login.email, { message: 'Email is required' });
    email(login.email, { message: 'Please enter a valid email address' });
    required(login.password, { message: 'Password is required' });
    minLength(login.password, 8, {
      message: 'Password must be at least 8 characters',
    });
  });
}
