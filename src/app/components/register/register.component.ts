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
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: ''
  };

  constructor(
    private authService: AuthService, 
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initGoogleButton();
  }

  initGoogleButton() {
    // Esperamos a que google esté definido
    const interval = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(interval);
        
        google.accounts.id.initialize({
          client_id: '71333420449-5dkid1qm5c17pc1r45i30lvvf9mh7rsb.apps.googleusercontent.com',
          callback: (resp: any) => this.handleGoogleRegister(resp)
        });
  
        const parent = document.getElementById("google-reg-btn");
        if (parent) {
          google.accounts.id.renderButton(parent, {
            theme: 'outline',
            size: 'large',
            width: 300,
            text: 'signup_with' // Cambia el texto del botón a "Sign up with Google"
          });
        }
      }
    }, 100);
  }

  handleGoogleRegister(response: any) {
    if (response.credential) {
      this.authService.registerWithGoogle(response.credential).subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            alert("¡Registro con Google exitoso!");
            this.router.navigate(['/login']); 
          });
        },
        error: (err: any) => {
          console.error(err);
          // Si el usuario ya existe (según tu backend podría ser 400)
          if (err.error && err.error.Error) {
             alert(err.error.Error); 
          } else {
             alert("Error al registrarse con Google.");
          }
        }
      });
    }
  }

  // --- LÓGICA LOCAL ---
  onRegister() {
    if (!this.userObj.nombre || !this.userObj.email || !this.userObj.password) {
      alert("Por favor completa los campos obligatorios (*)");
      return;
    }

    this.authService.register(this.userObj).subscribe({
      next: (res) => {
        alert("¡Registro exitoso! Inicia sesión.");
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        // Manejo seguro del mensaje de error
        const msg = err.error?.Error || "No se pudo registrar";
        alert("Error: " + msg);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}