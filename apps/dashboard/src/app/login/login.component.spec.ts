import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockReturnValue(
              of({
                success: true,
                message: 'Login successful',
                userId: '1',
                email: 'test@example.com',
                token: 'mock-token',
                role: 'developer',
              }),
            ),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should require username/email', () => {
    component.username.set('');
    component.password.set('password123');
    component.onSubmit();
    expect(component.errorMessage()).toContain('Please enter your email or username');
  });

  it('should require password', () => {
    component.username.set('test@example.com');
    component.password.set('');
    component.onSubmit();
    expect(component.errorMessage()).toContain('Please enter your password');
  });

  it('should call authService.login on valid submit', () => {
    component.username.set('test@example.com');
    component.password.set('password123');
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(component.successMessage()).toContain('Authenticated as DEVELOPER');
    expect(component.userRole()).toBe('developer');
  });
});
