import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router'; // Importamos Router
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 1. Cambiamos la URL para que apunte a la base de Auth, no solo a Google
  private apiUrl = 'https://localhost:7159/api/auth'; 

  constructor(private http: HttpClient, private router: Router) { }

  // --- LOGIN CON GOOGLE ---
  loginWithGoogle(idToken: string) {
    return this.http.post<any>(`${this.apiUrl}/google-login`, { idToken }).pipe(
      tap(response => this.guardarSesion(response))
    );
  }

  // --- LOGIN LOCAL (Nuevo) ---
  loginLocal(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/local-login`, { email, password }).pipe(
      tap(response => this.guardarSesion(response))
    );
  }

  // --- REGISTRO (Nuevo) ---
  register(userData: any) {
    // userData trae: { nombre, apellido, email, telefono, password }
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  // --- LOGOUT ---
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Es mejor redirigir con Router que recargar la página
    this.router.navigate(['/login']);
  }

  // --- GETTERS ---
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get currentUser() {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  // --- MÉTODO PRIVADO AUXILIAR ---
  // Para no repetir código de guardar en localStorage en ambos logins
  private guardarSesion(response: any) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify({ 
      name: response.userName, 
      email: response.email 
    }));
  }
}