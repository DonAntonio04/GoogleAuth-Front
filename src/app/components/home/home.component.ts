import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  nombreUsuario: string = 'Usuario';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Recuperamos el nombre del usuario guardado para saludarlo
    const currentUser = this.authService.currentUser;
    if (currentUser && currentUser.name) {
      this.nombreUsuario = currentUser.name;
    }
  }

  // Esta función llama al servicio que borra el token y te saca
  cerrarSesion() {
    this.authService.logout();
  }
}