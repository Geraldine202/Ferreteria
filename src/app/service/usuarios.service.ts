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
  private pedidos = 'http://localhost:3000/pedidos';
  private pedidoss = 'http://localhost:3000/pedidoss';
  private pagos = 'http://localhost:3000/pagos';
  private productos = 'http://localhost:3000/productos_inventario';
  private comuna = 'http://localhost:3000/comuna';
  private sucursal = 'http://localhost:3000/sucursal';
  private estado = 'http://localhost:3000/estado';
  private pedido_completo = 'http://localhost:3000/pedido-completo';
  private apiKey = environment.apiKey;
  usuarios: any[] = [];
 private loggedIn = new BehaviorSubject<boolean>(false);
  private requiereCambioClave = new BehaviorSubject<boolean>(false);
    private usuarioActualSubject = new BehaviorSubject<any>(null);
    usuarioActual$ = this.usuarioActualSubject.asObservable();
  constructor(private http: HttpClient) {  this.checkToken();
      const usuarioGuardado = this.obtenerUsuarioActual();
    this.usuarioActualSubject.next(usuarioGuardado);
  } 
  
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
   obtenerPedidos() {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey);
    return this.http.get(this.pedidoss, { headers });
  }
  obtenerComuna() {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey);
    return this.http.get(this.comuna, { headers });
  }
  obtenerSucursal() {
    const headers = new HttpHeaders().set('x-api-key', this.apiKey);
    return this.http.get(this.sucursal, { headers });
  }
obtenerTodosLosPagos(): Observable<any[]> {
  const headers = this.headers;
  // Endpoint corregido - verifica el nombre exacto en tu backend
  return this.http.get<any[]>(`${this.pagos}`, { headers }).pipe(
    catchError(error => {
      console.error('Error al obtener pagos:', error);
      return throwError(() => this.manejarErrorPagos(error));
    })
  );
} 

obtenerPagosPendientes(): Observable<any[]> {
  const headers = this.headers;
  return this.http.get<any[]>('http://localhost:3000/pagos_pendientes', { headers }).pipe(
    catchError(error => {
      console.error('Error al obtener pagos pendientes:', error);
      return throwError(() => new Error('Error al cargar pagos pendientes'));
    })
  );
}
actualizarEstadoPago(id_pedido: number, nuevo_estado: number): Observable<any> {
  const headers = this.headers;
  // La URL debe coincidir exactamente con tu endpoint en el backend
  return this.http.patch(
    `http://localhost:3000/pedidos/${id_pedido}`, // Eliminado /estado-pago
    { nuevo_estado }, // Asegúrate que el backend espera este formato exacto
    { headers }
  ).pipe(
    catchError(error => {
      console.error('Error en la petición PATCH:', {
        url: `http://localhost:3000/pedidos/${id_pedido}`,
        status: error.status,
        error: error.error
      });
      return throwError(() => new Error(error.error?.message || 'Error al actualizar estado del pago'));
    })
  );
}
obtenerTodosLosProductos(): Observable<any[]> {
  const headers = this.headers;
  // Endpoint corregido - verifica el nombre exacto en tu backend
  return this.http.get<any[]>(`${this.productos}`, { headers }).pipe(
    catchError(error => {
      console.error('Error al obtener productos:', error);
      return throwError(() => this.manejarErrorPagos(error));
    })
  );
}
// Obtener pedidos pagados (estado_pago = 2)
obtenerPedidosPagados(): Observable<any[]> {
  const headers = this.headers;
  return this.http.get<any[]>('http://localhost:3000/pedidos-pagados', { headers }).pipe(
    catchError(error => {
      console.error('Error al obtener pedidos pagados:', error);
      return throwError(() => new Error('Error al cargar pedidos pagados'));
    })
  );
}
// Obtener pedidos con estado_pedido = 2
obtenerPedidosEstado2(): Observable<any[]> {
  const headers = this.headers;
  return this.http.get<any[]>('http://localhost:3000/pedidos-estado-2', { headers }).pipe(
    catchError(error => {
      console.error('Error al obtener pedidos con estado 2:', error);
      return throwError(() => new Error('Error al cargar pedidos con estado 2'));
    })
  );
}
obtenerPedidosEstado5(): Observable<any[]> {
  const headers = this.headers;
  return this.http.get<any[]>('http://localhost:3000/pedidos-listos', { headers }).pipe(
    catchError(error => {
      console.error('Error al obtener pedidos con estado 5:', error);
      return throwError(() => new Error('Error al cargar pedidos con estado 5'));
    })
  );
}

obtenerPedidoCompleto(id: number): Observable<any> {
  const headers = this.headers;
  return this.http.get<any>(`${this.pedido_completo}/${id}`, { headers }).pipe(
    catchError(error => {
      console.error('Error al obtener el pedido completo:', error);
      return throwError(() => new Error('Error al cargar el pedido completo'));
    })
  );
}

actualizarEstadoPedido(idPedido: number, nuevoEstado: number): Observable<any> {
  return this.http.patch(
    `${this.estado}/${idPedido}`,
    { estado_pedido: nuevoEstado }, // Nombre del parámetro que espera el backend
    { headers: this.headers }
  ).pipe(
    catchError(error => {
      console.error('Error detallado:', error);
      const errorMessage = error.error?.error || 
                         error.error?.message || 
                         'Error al actualizar estado';
      return throwError(() => new Error(errorMessage));
    })
  );
}
actualizarPedidoAEstadoPreparacion(idPedido: number): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'x-api-key': this.apiKey
  });

  return this.http.patch(
    `${this.pedidos}/${idPedido}/preparacion`,
    {},
    { headers }
  ).pipe(
    catchError(error => {
      console.error('Error al actualizar pedido a preparación:', error);
      return throwError(() => new Error('No se pudo actualizar el pedido.'));
    })
  );
}
actualizarPedidoAListoParaEntrega(idPedido: number): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'x-api-key': this.apiKey
  });

  return this.http.patch(
    `${this.pedidos}/${idPedido}/listo-para-entrega`,
    {},
    { headers }
  ).pipe(
    catchError(error => {
      console.error('Error al actualizar pedido a listo para entrega:', error);
      return throwError(() => new Error('No se pudo actualizar el pedido.'));
    })
  );
}
actualizarPedidoADespachado(idPedido: number): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'x-api-key': this.apiKey
  });

  return this.http.patch(
    `${this.pedidos}/${idPedido}/despachar`,
    {},
    { headers }
  ).pipe(
    catchError(error => {
      console.error('Error al actualizar pedido a despachado:', error);
      return throwError(() => new Error('No se pudo actualizar el pedido.'));
    })
  );
}

actualizarPedidoAEntregado(idPedido: number): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'x-api-key': this.apiKey
  });

  return this.http.patch(
    `${this.pedidos}/${idPedido}/entregar`,
    {},
    { headers }
  ).pipe(
    catchError(error => {
      console.error('Error al actualizar pedido a entregado:', error);
      return throwError(() => new Error('No se pudo actualizar el pedido.'));
    })
  );
}




obtenerTodosLosPedidos(): Observable<any[]> {
  const headers = this.headers;
  // Endpoint corregido - verifica el nombre exacto en tu backend
  return this.http.get<any[]>(`${this.pedidos}`, { headers }).pipe(
    catchError(error => {
      console.error('Error al obtener pedidos:', error);
      return throwError(() => this.manejarErrorPedidos(error));
    })
  );
}
private manejarErrorPagos(error: any): Error {
  if (error.status === 404) {
    return new Error('El endpoint de pagos no existe. Verifica la configuración del backend.');
  }
  return new Error(error.message || 'Error al obtener pagos');
}

private manejarErrorPedidos(error: any): Error {
  if (error.status === 404) {
    return new Error('El endpoint de pedidos no existe. Verifica la configuración del backend.');
  }
  return new Error(error.message || 'Error al obtener pedidos');
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
// Método para registrar pedido completo (pedido + pago + detalle)
registrarPedidoCompleto(pedidoData: any): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'x-api-key': this.apiKey
  });

  return this.http.post('http://localhost:3000/pedido-completo', pedidoData, { headers }).pipe(
    catchError(error => {
      console.error('Error al registrar el pedido completo:', error);
      return throwError(() => new Error('Error al registrar el pedido.'));
    }) 
  );
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
  private usuarioSubject = new BehaviorSubject<any | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

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
          this.usuarioSubject.next(response.usuario);
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
  private usuarioActual = new BehaviorSubject<any>(null);

  setUsuario(usuario: any) {
    this.usuarioActual.next(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }
// Método para obtener los datos del usuario actual desde localStorage
obtenerUsuarioActual(): any {
  const usuarioString = localStorage.getItem('usuario');
  if (usuarioString) {
    return JSON.parse(usuarioString);
  }
  return null;
}

  getUsuario(): Observable<any> {
    return this.usuarioActual.asObservable();
  }

  getTipoUsuario(): number | null {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    return usuario ? usuario.tipoUsuario : null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.loggedIn.next(false);
    this.requiereCambioClave.next(false);
    this.usuarioSubject.next(null); 
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

