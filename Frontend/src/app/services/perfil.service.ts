import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PerfilUsuario, CambioContrasena, MensajeUsuario, EstadisticasUsuario } from '../interfaces/perfil-usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private baseUrl: string = environment.api.baseUrl;
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // ============================================
  // GESTIÓN DE PERFIL
  // ============================================

  obtenerPerfil(usuarioId: number): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${this.baseUrl}perfil/${usuarioId}`, {
      headers: this.getHeaders()
    });
  }

  // ✅ ACTUALIZADO: Ahora usa el endpoint correcto con usuarioId en la URL
  actualizarPerfil(perfil: any): Observable<any> {
    const usuarioId = perfil.usuarioId;
    return this.http.put(`${this.baseUrl}perfil/actualizar/${usuarioId}`, perfil, {
      headers: this.getHeaders()
    });
  }

  actualizarRedesSociales(usuarioId: number, redes: any): Observable<any> {
    return this.http.put(`${this.baseUrl}perfil/redes-sociales/${usuarioId}`, redes, {
      headers: this.getHeaders()
    });
  }

  subirFotoPerfil(usuarioId: number, fotoUrl: string): Observable<any> {
    return this.http.put(`${this.baseUrl}perfil/foto/${usuarioId}`, { fotoUrl }, {
      headers: this.getHeaders()
    });
  }

  // ============================================
  // CAMBIO DE CONTRASEÑA
  // ============================================

  cambiarContrasena(datos: CambioContrasena): Observable<any> {
    return this.http.post(`${this.baseUrl}perfil/cambiar-contrasena`, datos, {
      headers: this.getHeaders()
    });
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  obtenerEstadisticas(usuarioId: number): Observable<EstadisticasUsuario> {
    return this.http.get<EstadisticasUsuario>(`${this.baseUrl}perfil/estadisticas/${usuarioId}`, {
      headers: this.getHeaders()
    });
  }

  // ============================================
  // MENSAJERÍA INTERNA
  // ============================================

  enviarMensaje(mensaje: MensajeUsuario): Observable<any> {
    return this.http.post(`${this.baseUrl}mensajes/enviar`, mensaje, {
      headers: this.getHeaders()
    });
  }

  obtenerMensajes(usuarioId: number): Observable<MensajeUsuario[]> {
    return this.http.get<MensajeUsuario[]>(`${this.baseUrl}mensajes/${usuarioId}`, {
      headers: this.getHeaders()
    });
  }

  marcarComoLeido(mensajeId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}mensajes/marcar-leido/${mensajeId}`, {}, {
      headers: this.getHeaders()
    });
  }

  eliminarMensaje(mensajeId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}mensajes/${mensajeId}`, {
      headers: this.getHeaders()
    });
  }
}
