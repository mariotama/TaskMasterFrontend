import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoginCredentials } from '../../../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isSubmitting = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const credentials: LoginCredentials = {
      email: this.loginForm.get('email')?.value,
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value,
    };

    console.log('Form values for login:', this.loginForm.value);
    console.log('Prepared credentials:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login succeeded with response:', response);
        // Navigate to return URL or dashboard
        const returnUrl =
          this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Login failed with error:', error);
        // Simple friendly error message
        if (
          error?.status === 400 ||
          error?.status === 401 ||
          error?.status === 404
        ) {
          this.errorMessage =
            'Invalid email, username, or password. Please check your credentials and try again.';
        } else if (error?.status === 0) {
          this.errorMessage =
            'Unable to connect to the server. Please check your internet connection.';
        } else {
          this.errorMessage = 'Login failed. Please try again later.';
        }
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
