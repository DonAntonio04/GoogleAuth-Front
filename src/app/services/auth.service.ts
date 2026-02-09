import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router'; // Importamos Router
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7159/api/auth'; 

  constructor(private http: HttpClient, private router: Router) { }

  // --- login con Google
  loginWithGoogle(idToken: string) {
    return this.http.post<any>(`${this.apiUrl}/google-login`, { idToken }).pipe(
      tap(response => this.guardarSesion(response))
    );
  }

  // Login en local
  loginLocal(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/local-login`, { email, password }).pipe(
      tap(response => this.guardarSesion(response))
    );
  }

  
  register(userData: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Es mejor redirigir con Router que recargar la página
    this.router.navigate(['/login']);
  }

  
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get currentUser() {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }


  private guardarSesion(response: any) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify({ 
      name: response.userName, 
      email: response.email 
    }));
  }
}