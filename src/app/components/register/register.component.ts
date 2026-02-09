import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  // Objeto único para guardar todos los datos del formulario
  userObj = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  // Botón verde "Registrarse"
  onRegister() {
    // 1. Validaciones básicas
    if (!this.userObj.nombre || !this.userObj.email || !this.userObj.password) {
      alert("Por favor completa los campos obligatorios (*)");
      return;
    }

    // 2. Llamada al Backend
    this.authService.register(this.userObj).subscribe({
      next: (res) => {
        alert("¡Registro exitoso! Los datos se guardaron en usuarios.json. Ahora inicia sesión.");
        this.router.navigate(['/login']); // Te manda al login
      },
      error: (err) => {
        // Muestra el error que viene del Backend (ej. "El correo ya existe")
        alert("Error: " + (err.error?.error || "No se pudo registrar"));
      }
    });
  }

  // Enlace para volver si ya tienes cuenta
  goToLogin() {
    this.router.navigate(['/login']);
  }
}