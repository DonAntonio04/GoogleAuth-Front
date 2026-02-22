import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  userObj = {
    nombre:   '',
    apellido: '',
    email:    '',
    telefono: '',
    password: ''
  };

  private readonly CLIENT_ID = '71333420449-5dkid1qm5c17pc1r45i30lvvf9mh7rsb.apps.googleusercontent.com';
  private readonly SCOPES = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/user.phonenumbers.read',
    'https://www.googleapis.com/auth/user.birthday.read'
  ].join(' ');

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
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
  const client = google.accounts.oauth2.initTokenClient({
    client_id: this.CLIENT_ID,
    scope: this.SCOPES,
    prompt: 'consent',  // fuerza mostrar pantalla de permisos
    callback: (tokenResponse: any) => this.handleGoogleRegister(tokenResponse)
  });

  const btn = document.getElementById('google-reg-btn');
  if (btn) {
    btn.addEventListener('click', () => client.requestAccessToken());
  }
}
  handleGoogleRegister(tokenResponse: any) {
    if (!tokenResponse || !tokenResponse.access_token) {
      alert('No se pudo obtener el token de Google.');
      return;
    }

    this.ngZone.run(() => {
      this.authService.registerWithGoogle(tokenResponse.access_token).subscribe({
        next: () => {
          alert('¡Registro con Google exitoso!');
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          const msg = err.error?.Error || '';
          if (err.status === 400 && msg === 'El correo ya existe.') {
            alert('Este correo ya está registrado. Por favor inicia sesión.');
            this.router.navigate(['/login']);
          } else {
            alert('Error al registrarse con Google: ' + (msg || 'Intenta de nuevo.'));
          }
        }
      });
    });
  }

  onRegister() {
    if (!this.userObj.nombre || !this.userObj.email || !this.userObj.password) {
      alert('Por favor completa los campos obligatorios (*)');
      return;
    }

    this.authService.register(this.userObj).subscribe({
      next: () => {
        alert('¡Registro exitoso! Inicia sesión.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        const msg = err.error?.Error || '';
        if (err.status === 400 && msg === 'El correo ya existe.') {
          alert('Este correo ya está registrado. Por favor inicia sesión.');
        } else {
          alert('Error: ' + (msg || 'No se pudo registrar'));
        }
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}