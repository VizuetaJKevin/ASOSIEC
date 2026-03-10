// ============================================
// SERVICIO DE REPORTERÍA
// Archivo: src/app/Services/reporteria.service.ts
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  DashboardKPIs,
  VentasSemanales,
  VentasPorMes,
  ProductoMasVendido,
  VentasPorVendedor,
  ComprobantePendiente,
  ReporteVentas,
  ReporteVendedor,
  ProductoVendedor
} from '../interfaces/reporte.interface';

@Injectable({
  providedIn: 'root'
})
export class ReporteriaService {
  private baseUrl: string = environment.api.baseUrl;

  constructor(private http: HttpClient) { }

  // ============================================
  // REPORTES GENERALES (ADMIN)
  // ============================================

  /**
   * Obtiene el reporte general de ventas
   */
  ReporteVentasGeneral(): Observable<ReporteVentas> {
    return this.http.get<ReporteVentas>(`${this.baseUrl}ReporteVentasGeneral`);
  }

  /**
   * ✅ NUEVO: Obtiene las ventas de los últimos 7 días
   */
  VentasSemanales(): Observable<VentasSemanales[]> {
    return this.http.get<VentasSemanales[]>(`${this.baseUrl}VentasSemanales`);
  }

  /**
   * 📌 MANTENIDO: Obtiene ventas por mes (histórico)
   */
  VentasPorMes(): Observable<VentasPorMes[]> {
    return this.http.get<VentasPorMes[]>(`${this.baseUrl}VentasPorMes`);
  }

  /**
   * Obtiene el top 10 de productos más vendidos
   */
  ProductosMasVendidos(): Observable<ProductoMasVendido[]> {
    return this.http.get<ProductoMasVendido[]>(`${this.baseUrl}ProductosMasVendidos`);
  }

  /**
   * Obtiene las ventas agrupadas por vendedor
   */
  VentasPorVendedor(): Observable<VentasPorVendedor[]> {
    return this.http.get<VentasPorVendedor[]>(`${this.baseUrl}VentasPorVendedor`);
  }

  /**
   * Obtiene los KPIs del dashboard administrativo
   */
  DashboardKPIs(): Observable<DashboardKPIs> {
    return this.http.get<DashboardKPIs>(`${this.baseUrl}DashboardKPIs`);
  }

  /**
   * Obtiene los comprobantes pendientes de verificación
   */
  ComprobantesPendientes(): Observable<ComprobantePendiente[]> {
    return this.http.get<ComprobantePendiente[]>(`${this.baseUrl}ComprobantesPendientes`);
  }

  // ============================================
  // REPORTES ESPECÍFICOS DE VENDEDOR
  // ============================================

  /**
   * Obtiene el reporte completo de un vendedor específico
   */
  ReporteVendedor(vendedorId: number): Observable<ReporteVendedor> {
    return this.http.get<ReporteVendedor>(`${this.baseUrl}ReporteVendedor/${vendedorId}`);
  }

  /**
   * Obtiene las estadísticas de productos de un vendedor
   */
  ProductosVendedorEstadisticas(vendedorId: number): Observable<ProductoVendedor> {
    return this.http.get<ProductoVendedor>(`${this.baseUrl}ProductosVendedorEstadisticas/${vendedorId}`);
  }

  /**
   * Obtiene los KPIs del dashboard de un vendedor específico
   */
  DashboardKPIsVendedor(vendedorId: number): Observable<DashboardKPIs> {
    return this.http.get<DashboardKPIs>(`${this.baseUrl}DashboardKPIsVendedor/${vendedorId}`);
  }

  /**
   * ✅ NUEVO: Obtiene las ventas semanales de un vendedor específico
   */
  VentasSemanalesVendedor(vendedorId: number): Observable<VentasSemanales[]> {
    return this.http.get<VentasSemanales[]>(`${this.baseUrl}VentasSemanalesVendedor/${vendedorId}`);
  }
}
