import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AuditLog {
  id: number;
  fecha_evento: Date;
  usuario_id?: number;
  usuario_email?: string;
  usuario_nombre?: string;
  usuario_rol?: string;
  tipo_operacion: string;
  entidad: string;
  entidad_id?: number;
  accion: string;
  valores_anteriores?: string;
  valores_nuevos?: string;
  ip_address?: string;
  user_agent?: string;
  exito: boolean;
  codigo_error?: string;
  mensaje_error?: string;
}

export interface AuditStats {
  total_operaciones: number;
  operaciones_exitosas: number;
  operaciones_fallidas: number;
  usuarios_activos: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  // ✅ CORREGIDO: Quitamos el /api duplicado
  private apiUrl = `${environment.api.baseUrl}audit`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener logs de auditoría con filtros
   */
  getLogs(filters: {
    fechaInicio?: Date;
    fechaFin?: Date;
    usuarioId?: number;
    entidad?: string;
    entidadId?: number;
    tipoOperacion?: string;
    soloExitosos?: boolean;
    pagina?: number;
    registrosPorPagina?: number;
  }): Observable<any> {
    let params = new HttpParams();

    if (filters.fechaInicio) {
      params = params.set('fechaInicio', filters.fechaInicio.toISOString());
    }
    if (filters.fechaFin) {
      params = params.set('fechaFin', filters.fechaFin.toISOString());
    }
    if (filters.usuarioId) {
      params = params.set('usuarioId', filters.usuarioId.toString());
    }
    if (filters.entidad) {
      params = params.set('entidad', filters.entidad);
    }
    if (filters.entidadId) {
      params = params.set('entidadId', filters.entidadId.toString());
    }
    if (filters.tipoOperacion) {
      params = params.set('tipoOperacion', filters.tipoOperacion);
    }
    if (filters.soloExitosos !== undefined) {
      params = params.set('soloExitosos', filters.soloExitosos.toString());
    }
    if (filters.pagina) {
      params = params.set('pagina', filters.pagina.toString());
    }
    if (filters.registrosPorPagina) {
      params = params.set('registrosPorPagina', filters.registrosPorPagina.toString());
    }

    return this.http.get(`${this.apiUrl}/logs`, { params });
  }

  /**
   * Obtener estadísticas de auditoría
   */
  getStats(fechaInicio?: Date, fechaFin?: Date): Observable<any> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio.toISOString());
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin.toISOString());
    }

    return this.http.get(`${this.apiUrl}/stats`, { params });
  }

  /**
   * Obtener historial de una entidad
   */
  getEntityHistory(entidad: string, id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/entity/${entidad}/${id}`);
  }

  /**
   * Obtener actividad de un usuario
   */
  getUserActivity(userId: number, dias: number = 30): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`, {
      params: { dias: dias.toString() }
    });
  }
}
