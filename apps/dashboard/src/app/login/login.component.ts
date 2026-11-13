import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const user = this.username().trim();
    const pass = this.password().trim();

    if (!user) {
      this.errorMessage.set('Please enter your username.');
      return;
    }

    if (!pass) {
      this.errorMessage.set('Please enter your password.');
      return;
    }

    this.isLoading.set(true);

    // Simulate login authentication
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMessage.set(`Welcome back, ${user}! Let's get stuff deployed.`);
    }, 900);
  }
}
