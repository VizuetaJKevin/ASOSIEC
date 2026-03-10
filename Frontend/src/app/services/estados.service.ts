import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EstadoItem } from '../interfaces/estado-item.interface';
import { EstadoOrden } from '../interfaces/estado-oden.interface';
import { EstadoProducto } from '../interfaces/estado-producto.interface';
import { EstadoUsuario } from '../interfaces/estado-usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class EstadosService {
  private baseUrl: string = environment.api.baseUrl;
  private http = inject(HttpClient);
  private headers: HttpHeaders = new HttpHeaders();

  private setHeaders() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    this.headers = headers;
  }

  // ============================================
  // ESTADO ITEM
  // ============================================
  ConsultarEstadosItem(): Observable<EstadoItem[]> {
    this.setHeaders();
    return this.http.get<EstadoItem[]>(`${this.baseUrl}ConsultarEstadosItem`, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  ConsultarEstadoItem(id: number): Observable<EstadoItem> {
    this.setHeaders();
    return this.http.get<EstadoItem>(`${this.baseUrl}ConsultarEstadoItem/${id}`, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  RegistrarEstadoItem(estado: EstadoItem): Observable<any> {
    this.setHeaders();
    return this.http.post<any>(`${this.baseUrl}RegistrarEstadoItem`, estado, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  ActualizarEstadoItem(estado: EstadoItem): Observable<any> {
    this.setHeaders();
    return this.http.put<any>(`${this.baseUrl}ActualizarEstadoItem`, estado, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  EliminarEstadoItem(id: number): Observable<any> {
    this.setHeaders();
    return this.http.delete<any>(`${this.baseUrl}EliminarEstadoItem/${id}`, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  // ============================================
  // ESTADO ORDEN
  // ============================================
  ConsultarEstadosOrden(): Observable<EstadoOrden[]> {
    this.setHeaders();
    return this.http.get<EstadoOrden[]>(`${this.baseUrl}ConsultarEstadosOrden`, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  ConsultarEstadoOrden(id: number): Observable<EstadoOrden> {
    this.setHeaders();
    return this.http.get<EstadoOrden>(`${this.baseUrl}ConsultarEstadoOrden/${id}`, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  RegistrarEstadoOrden(estado: EstadoOrden): Observable<any> {
    this.setHeaders();
    return this.http.post<any>(`${this.baseUrl}RegistrarEstadoOrden`, estado, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  ActualizarEstadoOrden(estado: EstadoOrden): Observable<any> {
    this.setHeaders();
    return this.http.put<any>(`${this.baseUrl}ActualizarEstadoOrden`, estado, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  EliminarEstadoOrden(id: number): Observable<any> {
    this.setHeaders();
    return this.http.delete<any>(`${this.baseUrl}EliminarEstadoOrden/${id}`, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  // ============================================
  // ESTADO PRODUCTO
  // ============================================
  ConsultarEstadosProducto(): Observable<EstadoProducto[]> {
    this.setHeaders();
    return this.http.get<EstadoProducto[]>(`${this.baseUrl}ConsultarEstadosProducto`, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  ConsultarEstadoProducto(id: number): Observable<EstadoProducto> {
    this.setHeaders();
    return this.http.get<EstadoProducto>(`${this.baseUrl}ConsultarEstadoProducto/${id}`, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  RegistrarEstadoProducto(estado: EstadoProducto): Observable<any> {
    this.setHeaders();
    return this.http.post<any>(`${this.baseUrl}RegistrarEstadoProducto`, estado, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  ActualizarEstadoProducto(estado: EstadoProducto): Observable<any> {
    this.setHeaders();
    return this.http.put<any>(`${this.baseUrl}ActualizarEstadoProducto`, estado, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  EliminarEstadoProducto(id: number): Observable<any> {
    this.setHeaders();
    return this.http.delete<any>(`${this.baseUrl}EliminarEstadoProducto/${id}`, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  // ============================================
  // ESTADO USUARIO
  // ============================================
  ConsultarEstadosUsuario(): Observable<EstadoUsuario[]> {
    this.setHeaders();
    return this.http.get<EstadoUsuario[]>(`${this.baseUrl}ConsultarEstadosUsuario`, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  ConsultarEstadoUsuario(id: number): Observable<EstadoUsuario> {
    this.setHeaders();
    return this.http.get<EstadoUsuario>(`${this.baseUrl}ConsultarEstadoUsuario/${id}`, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  RegistrarEstadoUsuario(estado: EstadoUsuario): Observable<any> {
    this.setHeaders();
    return this.http.post<any>(`${this.baseUrl}RegistrarEstadoUsuario`, estado, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  ActualizarEstadoUsuario(estado: EstadoUsuario): Observable<any> {
    this.setHeaders();
    return this.http.put<any>(`${this.baseUrl}ActualizarEstadoUsuario`, estado, {
      headers: this.headers,
      responseType: 'json'
    });
  }

  EliminarEstadoUsuario(id: number): Observable<any> {
    this.setHeaders();
    return this.http.delete<any>(`${this.baseUrl}EliminarEstadoUsuario/${id}`, {
      headers: this.headers,
      responseType: 'json'
    });
  }
}
