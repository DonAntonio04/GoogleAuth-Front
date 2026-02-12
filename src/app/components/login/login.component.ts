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
  pass: string = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) { }

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
    google.accounts.id.initialize({
      client_id: '71333420449-5dkid1qm5c17pc1r45i30lvvf9mh7rsb.apps.googleusercontent.com',
      callback: (resp: any) => this.handleGoogle(resp)
    });

    const parent = document.getElementById("google-btn");
    if (parent) {
      google.accounts.id.renderButton(parent, {
        theme: 'outline',
        size: 'large',
        width: 300 
      });
    }
  }

  handleGoogle(response: any) {
    if (response.credential) {
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: () => {
          this.ngZone.run(() => this.router.navigate(['/home']));
        },
        error: (err: any) => {
          // --- CAMBIO IMPORTANTE: MANEJO DE ERROR 401 ---
          if (err.status === 401) {
            alert("No tienes cuenta registrada con este Google. Por favor, regístrate primero.");
            this.ngZone.run(() => this.router.navigate(['/register']));
          } else {
            console.error(err);
            alert("Error al iniciar sesión. Intenta nuevamente.");
          }
        }
      });
    }
  }

  onLoginLocal() {
    if (!this.email || !this.pass) {
      alert("Por favor ingresa correo y contraseña");
      return;
    }

    this.authService.loginLocal(this.email, this.pass).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        alert("Credenciales incorrectas o usuario no registrado");
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}