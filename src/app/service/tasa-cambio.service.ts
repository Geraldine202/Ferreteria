// tasa-cambio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TasaCambioService {
  private readonly API_URL = 'https://mindicador.cl/api/dolar';

  constructor(private http: HttpClient) { }

  obtenerTasaCambio(): Observable<number> {
    return this.http.get<any>(this.API_URL).pipe(
      map((response: any) => {
        // Extraer el último valor del dólar
        if (response?.serie?.length > 0) {
          return response.serie[0].valor;
        }
        throw new Error('No hay datos de tasa de cambio disponibles');
      }),
      catchError((error: any) => {
        console.error('Error al obtener tasa de cambio:', error);
        // Valor por defecto (1 USD = 800 CLP aprox) si falla la API
        return of(800);
      })
    );
  }
}