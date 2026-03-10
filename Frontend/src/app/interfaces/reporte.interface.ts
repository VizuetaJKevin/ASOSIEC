// ============================================
// INTERFACES PARA REPORTERÍA
// Archivo: src/app/interfaces/reporte.interface.ts
// ============================================

/**
 * ✅ NUEVA: Interface para ventas semanales
 */
export interface VentasSemanales {
  fecha: Date;
  dia_nombre: string;
  fecha_corta: string;
  total: number;
  cantidad_ordenes: number;
}

/**
 * 📌 MANTENIDA: Para reportes mensuales históricos
 */
export interface VentasPorMes {
  mes: number;
  año: number;
  mes_nombre: string;
  total: number;
  cantidad_ordenes: number;
}

export interface ProductoMasVendido {
  producto_id: number;
  nombre_producto: string;
  cantidad_vendida: number;
  total_generado: number;
  url_img: string;
}

export interface VentasPorVendedor {
  vendedor_id: number;
  nombre_vendedor: string;
  total_productos_vendidos: number;
  total_ventas: number;
  cantidad_ordenes: number;
}

export interface DashboardKPIs {
  // Ventas
  ventas_mes_actual: number;
  ventas_mes_anterior: number;
  crecimiento_porcentaje: number;

  // Órdenes
  ordenes_pendientes: number;
  ordenes_completadas_mes: number;
  total_ordenes: number;

  // Productos
  total_productos: number;
  productos_sin_stock: number;

  // Usuarios
  total_clientes: number;
  vendedores_activos: number;
  solicitudes_pendientes: number;
}

/**
 * ✅ ACTUALIZADO: Agregado estadoOrdenId para filtrar comprobantes
 */
export interface ComprobantePendiente {
  comprobante_id: number;
  orden_id: number;
  token_orden: string;
  cliente_nombre: string;
  cliente_email: string;
  monto_total: number;
  fecha_orden: Date;
  numero_referencia: string;
  url_comprobante: string;
  dias_pendiente: number;
  estadoOrdenId: number;  // ✅ AGREGADO: Para filtrar por estado de orden
}

export interface ReporteVentas {
  total_ventas: number;
  total_ordenes: number;
  ordenes_pendientes: number;
  ordenes_completadas: number;
  ticket_promedio: number;
}

export interface ReporteVendedor {
  vendedor_id: number;
  nombre_comercial: string;
  total_productos_activos: number;
  total_ventas: number;
  total_ordenes: number;
  promedio_por_orden: number;
  fecha_primera_venta: Date | null;
  fecha_ultima_venta: Date | null;
}

export interface ProductoVendedor {
  producto_id: number;
  nombre_producto: string;
  stock_actual: number;
  cantidad_vendida: number;
  precio_actual: number;
  total_generado: number;
}
