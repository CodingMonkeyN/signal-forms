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
import { compatForm } from '@angular/forms/signals/compat';

@Component({
  selector: 'app-migration',
  imports: [ReactiveFormsModule, FormField],
  templateUrl: './migration.component.html',
})
export class MigrationComponent {
  activePhase: 1 | 2 | 3 = 1;

  // ================================================================
  // PHASE 1: Pure Reactive Forms (the "before" state)
  // ================================================================
  reactiveForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: (group) => {
        const pw = group.get('password')?.value;
        const cpw = group.get('confirmPassword')?.value;
        return pw === cpw ? null : { passwordMismatch: true };
      },
    },
  );

  // ================================================================
  // PHASE 2: compatForm — mix FormControls INTO signal model
  // Migrate field by field: some are plain values (new),
  // some are still FormControls (legacy)
  // ================================================================
  legacyPassword = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(8)],
  });
  legacyConfirmPassword = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  hybridModel = signal({
    // Already migrated to signal values
    name: '',
    email: '',
    // Still using Reactive FormControls (not yet migrated)
    password: this.legacyPassword,
    confirmPassword: this.legacyConfirmPassword,
  });

  hybridForm = compatForm(this.hybridModel, (f) => {
    // Signal Forms validation for migrated fields
    required(f.name, { message: 'Name is required' });
    minLength(f.name, 2, { message: 'Name must be at least 2 characters' });
    required(f.email, { message: 'Email is required' });
    email(f.email, { message: 'Please enter a valid email' });

    // password & confirmPassword keep their Reactive validators!
    // No signal validation needed for those — FormControl validators still work.
  });

  // ================================================================
  // PHASE 3: Fully migrated to Signal Forms
  // ================================================================
  signalModel = signal({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  signalForm = form(this.signalModel, (f) => {
    required(f.name, { message: 'Name is required' });
    minLength(f.name, 2, { message: 'Name must be at least 2 characters' });
    required(f.email, { message: 'Email is required' });
    email(f.email, { message: 'Please enter a valid email' });
    required(f.password, { message: 'Password is required' });
    minLength(f.password, 8, {
      message: 'Password must be at least 8 characters',
    });
    required(f.confirmPassword, { message: 'Please confirm your password' });
    validate(f.confirmPassword, ({ value, valueOf }) => {
      if (value() && value() !== valueOf(f.password)) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match',
        };
      }
      return null;
    });
  });

  setPhase(phase: 1 | 2 | 3) {
    this.activePhase = phase;
  }
}
