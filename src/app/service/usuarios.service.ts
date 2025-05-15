import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private url = 'http://localhost:3000/usuarios'; // Cambia por tu IP si usas móvil físico
  private apiKey = 'gestion_usuarios123.';
  usuarios: any[] = [];

  constructor(private http: HttpClient) {} // ✅ Quitado usuariosService

  // Obtener todos los usuarios
  obtenerUsuarios() {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey);
    return this.http.get(this.url, { headers });
  }

  // Crear un usuario
  crearUsuario(usuario: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    });
    return this.http.post(this.url, usuario, { headers });
  }

  // Buscar usuario
  buscarUsuario(rut: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    });
    return this.http.get(`${this.url}/${rut}`, { headers });
  }

  // Actualizar usuario
  actualizarUsuario(rut: number, usuario: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    });
    return this.http.put(`${this.url}/${rut}`, usuario, { headers });
  }

  // Eliminar usuario
  eliminarUsuario(rut: string) {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey
    });
    return this.http.delete(`${this.url}/usuarios/${rut}`, { headers });
  }
}
