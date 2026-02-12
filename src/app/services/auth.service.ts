import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7159/api/auth'; 
  private secretKey = 'k3P9zR7mW2vL5xN8'; // Misma clave del Backend

  constructor(private http: HttpClient, private router: Router) { }

  // --- LOGIN CON GOOGLE ---
  loginWithGoogle(idToken: string) {
    return this.http.post<any>(`${this.apiUrl}/google-login`, { idToken }).pipe(
      tap(response => this.guardarSesion(response))
    );
  }

  // --- REGISTRO CON GOOGLE (ESTE FALTABA) ---
  registerWithGoogle(idToken: string) {
    return this.http.post<any>(`${this.apiUrl}/google-register`, { idToken }).pipe(
      tap(response => this.guardarSesion(response))
    );
  }

  // --- LOGIN LOCAL ---
  loginLocal(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/local-login`, { email, password }).pipe(
      tap(response => this.guardarSesion(response))
    );
  }

  // --- REGISTRO LOCAL CON ENCRIPTACIÓN ---
  register(userData: any) {
    const jsonString = JSON.stringify({
      Nombre: userData.nombre,
      Apellido: userData.apellido,
      Email: userData.email,
      Telefono: userData.telefono,
      Password: userData.password
    });

    const encryptedData = this.encrypt(jsonString);
    return this.http.post<any>(`${this.apiUrl}/register`, { Data: encryptedData });
  }

  private encrypt(text: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.secretKey);
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    if (response.token) {
        localStorage.setItem('token', response.token);
    }
    const userName = response.userName || response.nombre || response.email;
    if (userName || response.email) {
        localStorage.setItem('user', JSON.stringify({ 
            name: userName, 
            email: response.email 
        }));
    }
  }
}