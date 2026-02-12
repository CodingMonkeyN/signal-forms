import { Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BasicFormComponent } from './demos/basic-form.component';
import { RegistrationFormComponent } from './demos/registration-form.component';
import { AddressFormComponent } from './demos/address-form.component';
import { ConditionalFormComponent } from './demos/conditional-form.component';
import { ComparisonComponent } from './demos/comparison.component';
import { CustomControlsComponent } from './demos/custom-controls.component';
import { FormArrayComponent } from './demos/form-array.component';
import { ErrorDisplayComponent } from './demos/error-display.component';
import { DynamicFormsComponent } from './demos/dynamic-forms.component';
import { MigrationComponent } from './demos/migration.component';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent },
  // Basics
  { path: 'basic', component: BasicFormComponent },
  { path: 'registration', component: RegistrationFormComponent },
  { path: 'address', component: AddressFormComponent },
  { path: 'conditional', component: ConditionalFormComponent },
  { path: 'comparison', component: ComparisonComponent },
  // Advanced
  { path: 'custom-controls', component: CustomControlsComponent },
  { path: 'form-arrays', component: FormArrayComponent },
  { path: 'errors', component: ErrorDisplayComponent },
  { path: 'dynamic', component: DynamicFormsComponent },
  // Migration
  { path: 'migration', component: MigrationComponent },
  { path: '**', redirectTo: '' },
];
