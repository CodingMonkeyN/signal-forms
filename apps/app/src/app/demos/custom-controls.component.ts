import { Component, input, model, signal } from '@angular/core';
import type {
  FormCheckboxControl,
  FormValueControl,
  WithOptionalField,
} from '@angular/forms/signals';
import {
  form,
  FormField,
  max,
  min,
  required,
  validate,
  type ValidationError,
} from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';

// ============================================================
// Custom Control 1: Star Rating
// ============================================================
@Component({
  selector: 'app-star-rating',
  template: `
    <div class="flex gap-1 items-center">
      @for (star of stars; track star) {
        <button
          type="button"
          class="text-2xl transition-transform hover:scale-125 focus:outline-none"
          [class.text-yellow-400]="star <= value()"
          [class.text-gray-300]="star > value()"
          [disabled]="disabled()"
          (click)="value.set(star)"
        >
          ★
        </button>
      }
      <span class="ml-2 text-sm text-gray-500">{{ value() }}/5</span>
    </div>
  `,
})
export class StarRatingComponent implements FormValueControl<number> {
  readonly value = model(0);
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly required = input(false);

  stars = [1, 2, 3, 4, 5];
}

// ============================================================
// Custom Control 2: Tag Input
// ============================================================
@Component({
  selector: 'app-tag-input',
  template: `
    <div
      class="border rounded-lg p-2 min-h-[42px] flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-red-500 transition"
      [class.bg-gray-100]="disabled()"
    >
      @for (tag of value(); track tag) {
        <span
          class="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-sm flex items-center gap-1"
        >
          {{ tag }}
          @if (!disabled()) {
            <button
              type="button"
              class="text-red-600 hover:text-red-900 font-bold text-xs"
              (click)="removeTag(tag)"
            >
              ×
            </button>
          }
        </span>
      }
      @if (!disabled()) {
        <input
          class="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
          [placeholder]="
            value().length === 0 ? 'Type and press Enter...' : 'Add more...'
          "
          (keydown.enter)="addTag($event)"
          (blur)="touched.set(true)"
        />
      }
    </div>
  `,
})
export class TagInputComponent implements FormValueControl<string[]> {
  readonly value = model<string[]>([]);
  readonly disabled = input(false);
  readonly touched = model(false);
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);

  addTag(event: Event) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const tag = input.value.trim();
    if (tag && !this.value().includes(tag)) {
      this.value.set([...this.value(), tag]);
      input.value = '';
    }
  }

  removeTag(tag: string) {
    this.value.set(this.value().filter((t) => t !== tag));
  }
}

// ============================================================
// Custom Control 3: Toggle Switch
// ============================================================
@Component({
  selector: 'app-toggle-switch',
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked()"
      class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      [class.bg-red-600]="checked()"
      [class.bg-gray-200]="!checked()"
      [disabled]="disabled()"
      (click)="checked.set(!checked()); touched.set(true)"
    >
      <span
        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        [class.translate-x-5]="checked()"
        [class.translate-x-0]="!checked()"
      ></span>
    </button>
  `,
})
export class ToggleSwitchComponent implements FormCheckboxControl {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly touched = model(false);
}

// ============================================================
// Main Demo Component
// ============================================================
@Component({
  selector: 'app-custom-controls',
  imports: [
    FormField,
    JsonPipe,
    StarRatingComponent,
    TagInputComponent,
    ToggleSwitchComponent,
  ],
  templateUrl: './custom-controls.component.html',
})
export class CustomControlsComponent {
  reviewModel = signal({
    title: '',
    rating: 0,
    text: '',
    tags: [] as string[],
    recommend: true,
    anonymous: false,
  });

  reviewForm = form(this.reviewModel, (review) => {
    required(review.title, { message: 'Review title is required' });

    // Custom star rating validation
    required(review.rating, { message: 'Please rate the product' });
    min(review.rating, 1, { message: 'Please select at least 1 star' });
    max(review.rating, 5, { message: 'Maximum 5 stars' });

    required(review.text, { message: 'Please write a review' });
    validate(review.text, ({ value }) => {
      if (value().length > 0 && value().length < 20) {
        return {
          kind: 'tooShort',
          message: 'Review must be at least 20 characters',
        };
      }
      return null;
    });

    // Tag validation
    validate(review.tags, ({ value }) => {
      if (value().length > 5) {
        return { kind: 'tooManyTags', message: 'Maximum 5 tags allowed' };
      }
      return null;
    });
  });
}
