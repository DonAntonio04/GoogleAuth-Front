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
  private secretKey = 'k3P9zR7mW2vL5xN8';

  constructor(private http: HttpClient, private router: Router) {}

  // --- LOGIN CON GOOGLE ---
  loginWithGoogle(accessToken: string) {
    return this.http.post<any>(`${this.apiUrl}/google-auth`, { accessToken }).pipe(
      tap(response => this.guardarSesion(response))
    );
  }

  // --- REGISTRO CON GOOGLE ---
  registerWithGoogle(accessToken: string) {
    return this.http.post<any>(`${this.apiUrl}/google-auth`, { accessToken }).pipe(
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
      Nombre:   userData.nombre,
      Apellido: userData.apellido,
      Email:    userData.email,
      Telefono: userData.telefono,
      Password: userData.password
    });

    const encryptedData = this.encrypt(jsonString);
    return this.http.post<any>(`${this.apiUrl}/register`, { Data: encryptedData });
  }

  // --- LOGOUT ---
  logout() {
    const token = localStorage.getItem('token');

    if (token) {
      this.http.post(`${this.apiUrl}/logout`, { Token: token }).subscribe({
        error: () => {} // Si falla el logout en servidor, limpiamos igual
      });
    }

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

  private encrypt(text: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.secretKey);
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }

  private guardarSesion(response: any) {
    const token = response.token || response.Token;
    if (token) {
      localStorage.setItem('token', token);
    }

    const user = response.user || response.User;

    const nombre          = user?.nombre          || user?.Nombre          || response.userName || response.UserName || '';
    const apellido        = user?.apellido        || user?.Apellido        || '';
    const email           = user?.email           || user?.Email           || response.email    || response.Email    || '';
    const telefono        = user?.telefono        || user?.Telefono        || '';
    const fechaNacimiento = user?.fechaNacimiento || user?.FechaNacimiento || '';

    if (nombre || email) {
      localStorage.setItem('user', JSON.stringify({
        name: nombre,
        apellido,
        email,
        telefono,
        fechaNacimiento
      }));
    }
  }
}