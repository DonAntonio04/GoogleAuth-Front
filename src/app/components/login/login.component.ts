import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string = '';
  pass: string  = '';

  private readonly CLIENT_ID = '71333420449-5dkid1qm5c17pc1r45i30lvvf9mh7rsb.apps.googleusercontent.com';
  private readonly SCOPES = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/user.phonenumbers.read',
    'https://www.googleapis.com/auth/user.birthday.read'
  ].join(' ');

  constructor(
    public authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/home']);
      return;
    }
    this.waitForGoogle();
  }

  waitForGoogle() {
    const interval = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(interval);
        this.initGoogleButton();
      }
    }, 100);
  }

  initGoogleButton() {
    // Usamos oauth2 (no id) para obtener access_token con los scopes extendidos
    const client = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: (tokenResponse: any) => this.handleGoogle(tokenResponse)
    });

    const btn = document.getElementById('google-btn');
    if (btn) {
      btn.addEventListener('click', () => client.requestAccessToken());
    }
  }

  handleGoogle(tokenResponse: any) {
    if (!tokenResponse || !tokenResponse.access_token) {
      alert('No se pudo obtener el token de Google.');
      return;
    }

    this.ngZone.run(() => {
      this.authService.loginWithGoogle(tokenResponse.access_token).subscribe({
        next: () => this.router.navigate(['/home']),
        error: (err: any) => {
          if (err.status === 401) {
            alert('No tienes cuenta registrada con este Google. Por favor, regístrate primero.');
            this.router.navigate(['/register']);
          } else {
            console.error(err);
            alert('Error al iniciar sesión. Intenta nuevamente.');
          }
        }
      });
    });
  }

  onLoginLocal() {
    if (!this.email || !this.pass) {
      alert('Por favor ingresa correo y contraseña');
      return;
    }

    this.authService.loginLocal(this.email, this.pass).subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => alert('Credenciales incorrectas o usuario no registrado')
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}