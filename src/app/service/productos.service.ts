import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs'; // <-- Añade esto

// Interfaces para tipos de datos
export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  stock: number;
  id_marca: number;
  id_inventario: number;
  id_categoria: number;
}
export interface UploadResponse {
  message: string;
  filePath: string;
}
export interface Marca {
  id_marca: number;
  descripcion: string;
}
export interface Categoria {
  id_categoria: number;
  descripcion: string;
}
export interface Inventario {
  id_inventario: number;
  cantidad_disponible:number;
  descripcion:string;
  id_sucursal:number;
}
export interface Estado_pedido {
  id_estado_pedido: number;
  descripcion:string;
}
export interface Tipo_entrega {
  id_entrega: number;
  descripcion:string;
}
export interface Estado_pago {
  id_estado_pago: number;
  descripcion:string;
}
export interface Tipo_pago {
  id_tipo_pago: number;
  descripcion:string;
}
@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private baseUrl = 'http://localhost:8080/productos';
  private marcas = '/marcas';
  private categorias = '/categorias';
  private inventario = '/inventario';
  private estado_pedido = '/estado_pedido';
  private tipo_entrega = '/tipo_entrega';
  private estado_pago = '/estado_pago';
  private tipo_pago = '/tipo_pago';

  constructor() {}

  private async handleRequest<T>(endpoint: string, method: string, body?: any): Promise<T> { 
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const options: RequestInit = { 
      method, 
      headers, 
      body: body ? JSON.stringify(body) : undefined 
    };
    
    try {
      const response = await fetch(url, options);
      
      // No intentar parsear JSON si la respuesta está vacía (como en algunos DELETE)
      if (response.status === 204) {
        return undefined as T;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.detail || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }
      
      return data as T;
    } catch (error) {
      console.error(`Error en ${method} ${url}:`, error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData
        // No establecer Content-Type, el navegador lo hará con el boundary correcto
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al subir la imagen');
      }
      
      const result = await response.json() as UploadResponse;
      return result.filePath;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  }

  // Obtener todos los productos
async obtenerProductos(): Promise<Producto[]> {
  return this.handleRequest<Producto[]>('', 'GET');
}
async obtenerInventario(): Promise<Inventario[]> {
  return this.handleRequest<Inventario[]>(this.inventario, 'GET');
}
async obtenerMarcas(): Promise<Marca[]> {
  return this.handleRequest<Marca[]>(this.marcas, 'GET');
}
async obtenerCategorias(): Promise<Categoria[]> {
  return this.handleRequest<Categoria[]>(this.categorias, 'GET');

}async obtener_estados_pedidos(): Promise<Estado_pedido[]> {
  return this.handleRequest<Estado_pedido[]>(this.estado_pedido, 'GET');
}
async obtener_tipo_entregas(): Promise<Tipo_entrega[]> {
  return this.handleRequest<Tipo_entrega[]>(this.tipo_entrega, 'GET');
}
async obtener_estados_pagos(): Promise<Estado_pago[]> {
  return this.handleRequest<Estado_pago[]>(this.estado_pago, 'GET');
}
async obtener_tipo_pagos(): Promise<Tipo_pago[]> {
  return this.handleRequest<Tipo_pago[]>(this.tipo_pago, 'GET');
}

  // Obtener un producto por ID
async obtenerProductoPorId(id: number): Promise<Producto> { 
  if (id == null || isNaN(id)) {
    throw new Error('ID de producto inválido');
  }
  return this.handleRequest<Producto>(`/${id}`, 'GET');
}

  // Agregar un nuevo producto
async guardarProducto(producto: any) {
  // Convertir el objeto producto a query params
  const params = new URLSearchParams();
  
  // Mapear campos (nota los nombres que espera el backend)
  params.append('id_producto', producto.id || undefined);
  params.append('nombre', producto.nombre || '');
  params.append('descripcion', producto.descripcion || '');
  params.append('imagen', producto.imagen || '');
  params.append('precio', producto.precio?.toString() || '');
  params.append('stock', producto.stock?.toString() || '');
  params.append('id_marca', producto.marca?.toString() || '');
  params.append('id_inventario', producto.inventario?.toString() || '');
  params.append('id_categoria', producto.categoria?.toString() || '');

  try {
    const url = `http://localhost:8080/productos/?${params.toString()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // IMPORTANTE: No enviamos body
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(JSON.stringify(errorDetails));
    }

    return await response.json();
  } catch (error) {
    console.error("Error al guardar:", error);
    throw error;
  }
}
  // Actualizar un producto completo (PUT)
  async actualizarProducto(id: number, data: any): Promise<void> {
    const url = `${this.baseUrl}/${id}`;
    const headers = { 'Content-Type': 'application/json' };
    const options: RequestInit = {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.detail || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error en actualizarProducto:', error);
      throw error;
    }
  }

  // Actualización parcial (PATCH)
  async actualizarParcialProducto(
    id: number, 
    camposActualizados: Partial<Producto>
  ): Promise<{message: string}> {
    return this.handleRequest(`/${id}`, 'PATCH', camposActualizados);
  }

 private handleError(error: any): Observable<never> {
    console.error('Error en ProductosService:', error);
    let errorMessage = 'Ocurrió un error';
    if (error.error) {
      if (typeof error.error === 'string') {
        try {
          const parsedError = JSON.parse(error.error);
          errorMessage = parsedError.detail || errorMessage;
        } catch {
          errorMessage = error.error;
        }
      } else if (error.error.detail) {
        errorMessage = error.error.detail;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  // Dentro de tu ProductosService (productos.service.ts)

/**
 * Elimina un producto por su ID
 * @param id ID del producto a eliminar
 * @returns Promesa con el mensaje de éxito o error
 */
async eliminarProducto(id: number): Promise<{message: string}> {
  try {
    const url = `${this.baseUrl}/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Si la respuesta es exitosa pero no tiene contenido (204 No Content)
    if (response.status === 204) {
      return { message: 'Producto eliminado con éxito' };
    }

    // Si la respuesta tiene contenido, lo parseamos
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
}



}