import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  username = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  userRole = signal('');

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.userRole.set('');

    const userInput = this.username().trim();
    const pass = this.password().trim();

    if (!userInput) {
      this.errorMessage.set('Please enter your email or username.');
      return;
    }

    if (!pass) {
      this.errorMessage.set('Please enter your password.');
      return;
    }

    // Ensure email format for api-gateway validation
    const email = userInput.includes('@') ? userInput : `${userInput}@example.com`;

    this.isLoading.set(true);

    this.authService.login(email, pass).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.userRole.set(res.role || 'developer');
        this.successMessage.set(
          `Welcome back! Authenticated as ${res.role ? res.role.toUpperCase() : 'USER'}.`,
        );
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Login failed. Please check your credentials.');
      },
    });
  }
}
