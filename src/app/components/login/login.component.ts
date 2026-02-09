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

  // 1. 👇 AQUÍ ESTÁN LAS VARIABLES QUE TE FALTABAN
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

  // --- LÓGICA DE GOOGLE ---
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
      client_id: '71333420449-5dkid1qm5c17pc1r45i30lvvf9mh7rsb.apps.googleusercontent.com', // Tu ID
      callback: (resp: any) => this.handleGoogle(resp)
    });

    const parent = document.getElementById("google-btn");
    if (parent) {
      google.accounts.id.renderButton(parent, {
        theme: 'outline',
        size: 'large',
        width: 300  // Valor en píxeles (Google no acepta porcentajes)
      });
    }
  }

  handleGoogle(response: any) {
    if (response.credential) {
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: () => this.ngZone.run(() => this.router.navigate(['/home'])),
        error: (err) => alert("Error al iniciar sesión con Google")
      });
    }
  }

  // --- 2. 👇 AQUÍ ESTÁN LAS FUNCIONES QUE TE FALTABAN ---

  onLoginLocal() {
    if (!this.email || !this.pass) {
      alert("Por favor ingresa correo y contraseña");
      return;
    }

    this.authService.loginLocal(this.email, this.pass).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        alert("Credenciales incorrectas o usuario no registrado");
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}