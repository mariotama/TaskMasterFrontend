import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strictEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const valid = emailPattern.test(control.value);

    return valid
      ? null
      : {
          strictEmail: {
            value: control.value,
            message:
              'Please enter a valid email address (e.g., user@example.com)',
          },
        };
  };
}

export function enhancedEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const email = control.value.toLowerCase();

    // Check basic format first
    const basicValidation = strictEmailValidator()(control);
    if (basicValidation) {
      return basicValidation;
    }

    // Additional checks for common invalid patterns
    const invalidPatterns = [
      /^\./, // Starts with dot
      /\.$/, // Ends with dot
      /\.{2,}/, // Multiple consecutive dots
      /@\./, // @ followed by dot
      /\.@/, // Dot followed by @
      /@.*@/, // Multiple @ symbols
    ];

    for (const pattern of invalidPatterns) {
      if (pattern.test(email)) {
        return {
          enhancedEmail: {
            value: control.value,
            message: 'Please enter a valid email address format',
          },
        };
      }
    }

    return null;
  };
}
