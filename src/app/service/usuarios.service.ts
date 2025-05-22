import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private url = 'http://localhost:3000/usuarios';
  private comuna = 'http://localhost:3000/comuna';
  private sucursal = 'http://localhost:3000/sucursal';
  private apiKey = environment.apiKey;
  usuarios: any[] = [];

  constructor(private http: HttpClient) {} 
  

  // Obtener todos los usuarios
  obtenerUsuarios() {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey);
    return this.http.get(this.url, { headers });
  }
  obtenerComuna() {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey);
    return this.http.get(this.comuna, { headers });
  }
  obtenerSucursal() {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey);
    return this.http.get(this.sucursal, { headers });
  }

  // Crear un usuario
  crearUsuario(usuario: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    });
    return this.http.post(this.url, usuario, { headers });
  }
  subirImagen(file: File) {
    const formData = new FormData();
    formData.append('imagen', file);

    const headers = new HttpHeaders({
      'x-api-key': this.apiKey
    });

    return this.http.post<any>('http://localhost:3000/subir-imagen', formData, { headers });
  }
  obtenerUsuariosPaginados(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.url}/usuarios?page=${page}&limit=${limit}`);
  }

  // Buscar usuario
    buscarUsuario(rut: any) {
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
    return this.http.delete(`${this.url}/${rut}`, { headers });
  }
    eliminarUsuarioConRelacionados(rut: string, eliminarRelacionados: boolean): Observable<any> {
      return this.http.delete(`${this.url}/${rut}`, {
        params: { eliminarRelacionados: eliminarRelacionados.toString() }
      });
    }
    verificarRelaciones(rut: string): Observable<{ tieneRelaciones: boolean }> {
    return this.http.get<{ tieneRelaciones: boolean }>(`${this.url}/${rut}/relaciones`);
  }

  
}
