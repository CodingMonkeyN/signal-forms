import { Component, signal, model, input } from '@angular/core';
import {
  form,
  FormField,
  required,
  validate,
  min,
  max,
  type ValidationError,
} from '@angular/forms/signals';
import type {
  FormValueControl,
  FormCheckboxControl,
  WithOptionalField,
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
  template: `
    <div class="max-w-5xl mx-auto px-6 py-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">
        Custom Form Controls
      </h1>
      <p class="text-lg text-gray-600 mb-8">
        Build custom controls with just a <code>model()</code> signal. No more
        <code>ControlValueAccessor</code> boilerplate!
      </p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Form -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold mb-6">Product Review</h2>

          <div class="space-y-5">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Review Title</label
              >
              <input
                type="text"
                [formField]="reviewForm.title"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
                placeholder="Great product!"
              />
              @if (
                reviewForm.title().touched() && reviewForm.title().invalid()
              ) {
                @for (error of reviewForm.title().errors(); track error.kind) {
                  <p class="text-red-600 text-sm mt-1">{{ error.message }}</p>
                }
              }
            </div>

            <!-- Star Rating (Custom Control) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Rating
                <span class="text-xs text-purple-600 ml-1"
                  >(Custom FormValueControl)</span
                >
              </label>
              <app-star-rating [formField]="reviewForm.rating" />
              @if (
                reviewForm.rating().touched() && reviewForm.rating().invalid()
              ) {
                @for (error of reviewForm.rating().errors(); track error.kind) {
                  <p class="text-red-600 text-sm mt-1">{{ error.message }}</p>
                }
              }
            </div>

            <!-- Review Text -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Review</label
              >
              <textarea
                [formField]="reviewForm.text"
                rows="4"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition resize-none"
                placeholder="What did you like about this product?"
              ></textarea>
              @if (reviewForm.text().touched() && reviewForm.text().invalid()) {
                @for (error of reviewForm.text().errors(); track error.kind) {
                  <p class="text-red-600 text-sm mt-1">{{ error.message }}</p>
                }
              }
            </div>

            <!-- Tags (Custom Control) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tags
                <span class="text-xs text-purple-600 ml-1"
                  >(Custom FormValueControl)</span
                >
              </label>
              <app-tag-input [formField]="reviewForm.tags" />
              @if (reviewForm.tags().touched() && reviewForm.tags().invalid()) {
                @for (error of reviewForm.tags().errors(); track error.kind) {
                  <p class="text-red-600 text-sm mt-1">{{ error.message }}</p>
                }
              }
            </div>

            <!-- Recommend Toggle (Custom Control) -->
            <div class="flex items-center gap-3">
              <app-toggle-switch [formField]="reviewForm.recommend" />
              <label class="text-sm font-medium text-gray-700">
                I would recommend this product
                <span class="text-xs text-purple-600 ml-1"
                  >(Custom FormCheckboxControl)</span
                >
              </label>
            </div>

            <!-- Anonymous Toggle -->
            <div class="flex items-center gap-3">
              <app-toggle-switch [formField]="reviewForm.anonymous" />
              <label class="text-sm font-medium text-gray-700"
                >Post anonymously</label
              >
            </div>

            <button
              class="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              [disabled]="reviewForm().invalid()"
            >
              Submit Review
            </button>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="space-y-4">
          <div
            class="bg-gray-900 text-green-400 rounded-lg p-6 font-mono text-sm"
          >
            <h3 class="text-white font-bold mb-4 font-sans text-lg">
              Live State
            </h3>

            <div class="mb-3">
              <span class="text-gray-400">// Custom star rating control</span
              ><br />
              <span class="text-yellow-300">rating.value</span> =
              {{ reviewForm.rating().value() }}<br />
              <span class="text-yellow-300">rating.valid</span> =
              {{ reviewForm.rating().valid() }}<br />
              <span class="text-yellow-300">rating.touched</span> =
              {{ reviewForm.rating().touched() }}
            </div>

            <div class="mb-3">
              <span class="text-gray-400">// Custom tag input control</span
              ><br />
              <span class="text-yellow-300">tags.value</span> =
              {{ reviewForm.tags().value() | json }}<br />
              <span class="text-yellow-300">tags.valid</span> =
              {{ reviewForm.tags().valid() }}
            </div>

            <div class="mb-3">
              <span class="text-gray-400">// Custom toggle switches</span><br />
              <span class="text-yellow-300">recommend</span> =
              {{ reviewForm.recommend().value() }}<br />
              <span class="text-yellow-300">anonymous</span> =
              {{ reviewForm.anonymous().value() }}
            </div>

            <div>
              <span class="text-gray-400">// Full model</span><br />
              <span class="text-yellow-300">model</span> =
              {{ reviewModel() | json }}
            </div>
          </div>

          <!-- Code -->
          <div
            class="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-xs overflow-x-auto"
          >
            <h3 class="text-white font-bold mb-3 font-sans text-lg">
              FormValueControl
            </h3>
            <pre
              class="whitespace-pre-wrap"
            ><span class="text-gray-400">// That's ALL you need for a custom control!</span>
<span class="text-purple-400">export class</span> <span class="text-yellow-300">StarRatingComponent</span>
  <span class="text-purple-400">implements</span> <span class="text-yellow-300">FormValueControl</span>&lt;number&gt; {{ '{' }}

  <span class="text-gray-400">// Required: just one model signal</span>
  <span class="text-purple-400">readonly</span> value = <span class="text-yellow-300">model</span>(0);

  <span class="text-gray-400">// Optional: auto-bound by [formField]</span>
  <span class="text-purple-400">readonly</span> disabled = <span class="text-yellow-300">input</span>(false);
  <span class="text-purple-400">readonly</span> touched = <span class="text-yellow-300">model</span>(false);
  <span class="text-purple-400">readonly</span> errors = <span class="text-yellow-300">input</span>([]);
{{ '}' }}

<span class="text-gray-400">// Usage: same [formField] as native inputs</span>
&lt;app-star-rating [formField]="form.rating" /&gt;</pre>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-blue-800 mb-3">
              Key Takeaways
            </h3>
            <ul class="space-y-2 text-blue-900 text-sm">
              <li>
                <strong>FormValueControl&lt;T&gt;</strong> - just needs
                <code>value = model&lt;T&gt;()</code>
              </li>
              <li>
                <strong>FormCheckboxControl</strong> - just needs
                <code>checked = model(false)</code>
              </li>
              <li>
                Optional inputs (disabled, touched, errors, etc.) are auto-bound
              </li>
              <li>
                No NG_VALUE_ACCESSOR, no writeValue(), no registerOnChange()
              </li>
              <li>
                Same <code>[formField]</code> directive works for native AND
                custom controls
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
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
