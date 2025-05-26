import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
 
export class UsuariosService {
  private url = 'http://localhost:3000/usuarios';
  private log = 'http://localhost:3000/login';
  private comuna = 'http://localhost:3000/comuna';
  private sucursal = 'http://localhost:3000/sucursal';
  private apiKey = environment.apiKey;
  usuarios: any[] = [];
 private loggedIn = new BehaviorSubject<boolean>(false);
  private requiereCambioClave = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {  this.checkToken();} 
  
  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    });
  }
  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }
  get requiereCambioPassword() {
    return this.requiereCambioClave.asObservable();
  }

  private checkToken() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.loggedIn.next(!!token);
    this.requiereCambioClave.next(usuario?.cambioClaveObligatorio || false);
  }
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

  // Agrega estos métodos al servicio
  getSucursalPorId(idSucursal: number): Observable<any> {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey);
    return this.http.get(`${this.sucursal}/${idSucursal}`, { headers });
  }

  getComunaPorId(idComuna: number): Observable<any> {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey);
    return this.http.get(`${this.comuna}/${idComuna}`, { headers });
  }
  obtenerSucursalPorId(id: number) {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey);
    return this.http.get(`${this.sucursal}/${id}`, { headers });
  }
  // Crear un usuario
crearUsuario(usuario: any) {
  console.log('Datos que se enviarán al backend:', usuario);  // <--- Aquí el log
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
  buscarUsuario(rut: any): Observable<any> {
    const headers = this.headers;
    return this.http.get(`${this.url}/${rut}`, { headers }).pipe(
      catchError(error => {
        console.error('Error al buscar usuario:', error);
        return throwError(() => new Error('No se pudo encontrar el usuario.'));
      })
    );
  }


  getSucursalConComuna(idSucursal: number): Observable<any> {
    const headers = new HttpHeaders({
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      });

      return this.http.get(`${this.sucursal}/${idSucursal}/comuna`, { headers }).pipe(
        map((response: any) => {
          return {
            nombre_sucursal: response.nombre_sucursal,
            nombre_comuna: response.comuna?.nombre_comuna || response.nombre_comuna
          };
        })
      );
    }
  // Actualizar usuario
 actualizarUsuario(rut: string, usuario: any) {
  // Si la contraseña no se quiere cambiar, enviamos '' o no enviamos el campo
  // Pero como el backend usa la contraseña solo si es string no vacía, podemos enviar '' para no cambiarla
  const usuarioParaActualizar = {
    ...usuario,
    contrasenia: usuario.contrasenia || '' // si no hay contraseña, envía cadena vacía para conservar la actual
  };

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'x-api-key': this.apiKey
  });

  return this.http.put(`${this.url}/${rut}`, usuarioParaActualizar, { headers });
}
  patchUsuario(rut: string, datos: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key':this.apiKey
    });

    return this.http.patch(`${this.url}/${rut}`, datos, { headers });
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
  // Método para autenticación
 login(email: string, password: string): Observable<any> {
    // Adaptamos los nombres de campos al backend
    const body = {
      correo: email,
      contrasenia: password
    };

    const headers = new HttpHeaders({
      'x-api-key': this.apiKey
    });

     return this.http.post(`${this.log}`, body, { headers: this.headers }).pipe(
      map((response: any) => {
        if (response.token && response.usuario) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
          this.loggedIn.next(true);
          this.requiereCambioClave.next(response.usuario.cambioClaveObligatorio);
        }
        return response;
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => new Error(error.error?.message || 'Error al iniciar sesión'));
      })
    );
  }


  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

 validarToken(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'x-api-key': this.apiKey
    });

    return this.http.post(`${this.url}/validar-token`, null, { headers }).pipe(
      catchError(error => {
        console.error('Error validando token:', error);
        return throwError(() => new Error('Token inválido'));
      })
    );
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.loggedIn.next(false);
    this.requiereCambioClave.next(false);
  }
getUsuarioActual(): Observable<any> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return throwError(() => new Error('No hay token almacenado'));
  }

  // Cambiado a POST con body vacío
  return this.http.post(`${this.url}/usuario-actual`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-api-key': 'bd_clavitos',
      'Content-Type': 'application/json'
    }
  }).pipe(
      map((usuario: any) => {
        this.requiereCambioClave.next(usuario.cambio_clave_obligatorio === 'S');
        return usuario;
      }),
    catchError(error => {
      console.error('Error obteniendo usuario:', error);
      let mensajeError = 'Error al obtener usuario';
      
      if (error.status === 401) {
        mensajeError = 'Sesión expirada';
        this.logout();
      } else if (error.status === 404) {
        mensajeError = 'Usuario no encontrado';
      }
      
      return throwError(() => new Error(mensajeError));
    })
  );
}

solicitarRecuperacion(email: string): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'x-api-key': this.apiKey
  });
  return this.http.post('http://localhost:3000/recuperar-password', { correo: email }, { headers });
}

// Método para cambiar la contraseña
  cambiarContrasenia(token: string, nuevaContrasenia: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    });
    return this.http.post('http://localhost:3000/reset-password', { token, nuevaContrasenia }, { headers });
  }
  // Método específico para forzar cambio de contraseña
  forzarCambioContrasenia(rut: string): Observable<any> {
    return this.patchUsuario(rut, { cambio_clave_obligatorio: 'S' });
  }
cambiarContraseniaPatch(rut: string, nuevaContrasenia: string) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autorización');
  }

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      });

  const body = { contrasenia: nuevaContrasenia };
  return this.http.patch(`${this.url}/${rut}`, body, { headers });
}

}

