using System;

namespace Entidad
{
    // ============================================
    // REPORTES GENERALES
    // ============================================

    public class Entidad_ReporteVentas
    {
        public decimal total_ventas { get; set; }
        public int total_ordenes { get; set; }
        public int ordenes_pendientes { get; set; }
        public int ordenes_completadas { get; set; }
        public decimal ticket_promedio { get; set; }
    }

    /// <summary>
    /// ✅ NUEVO: Entidad para ventas semanales (últimos 7 días)
    /// </summary>
    public class Entidad_VentasSemanales
    {
        public DateTime fecha { get; set; }
        public string dia_nombre { get; set; }
        public string fecha_corta { get; set; }
        public decimal total { get; set; }
        public int cantidad_ordenes { get; set; }
    }

    /// <summary>
    /// 📌 MANTENIDA: Para reportes mensuales históricos
    /// </summary>
    public class Entidad_VentasPorMes
    {
        public int mes { get; set; }
        public int año { get; set; }
        public string mes_nombre { get; set; }
        public decimal total { get; set; }
        public int cantidad_ordenes { get; set; }
    }

    public class Entidad_ProductoMasVendido
    {
        public int producto_id { get; set; }
        public string nombre_producto { get; set; }
        public int cantidad_vendida { get; set; }
        public decimal total_generado { get; set; }
        public string url_img { get; set; }
    }

    public class Entidad_VentasPorVendedor
    {
        public int vendedor_id { get; set; }
        public string nombre_vendedor { get; set; }
        public int total_productos_vendidos { get; set; }
        public decimal total_ventas { get; set; }
        public int cantidad_ordenes { get; set; }
    }

    // ============================================
    // REPORTES ESPECÍFICOS DE VENDEDOR
    // ============================================

    public class Entidad_ReporteVendedor
    {
        public int vendedor_id { get; set; }
        public string nombre_comercial { get; set; }
        public int total_productos_activos { get; set; }
        public decimal total_ventas { get; set; }
        public int total_ordenes { get; set; }
        public decimal promedio_por_orden { get; set; }
        public DateTime? fecha_primera_venta { get; set; }
        public DateTime? fecha_ultima_venta { get; set; }
    }

    public class Entidad_ProductoVendedor
    {
        public int producto_id { get; set; }
        public string nombre_producto { get; set; }
        public int stock_actual { get; set; }
        public int cantidad_vendida { get; set; }
        public decimal precio_actual { get; set; }
        public decimal total_generado { get; set; }
    }

    // ============================================
    // DASHBOARD KPIs
    // ============================================

    public class Entidad_DashboardKPIs
    {
        // Generales
        public decimal ventas_mes_actual { get; set; }
        public decimal ventas_mes_anterior { get; set; }
        public decimal crecimiento_porcentaje { get; set; }

        // Órdenes
        public int ordenes_pendientes { get; set; }
        public int ordenes_completadas_mes { get; set; }
        public int total_ordenes { get; set; }

        // Productos
        public int total_productos { get; set; }
        public int productos_sin_stock { get; set; }

        // Usuarios
        public int total_clientes { get; set; }
        public int vendedores_activos { get; set; }
        public int solicitudes_pendientes { get; set; }
    }

    // ============================================
    // COMPROBANTES PENDIENTES
    // ============================================

    public class Entidad_ComprobantePendiente
    {
        public int comprobante_id { get; set; }
        public int orden_id { get; set; }
        public string token_orden { get; set; }
        public string cliente_nombre { get; set; }
        public string cliente_email { get; set; }
        public decimal monto_total { get; set; }
        public DateTime fecha_orden { get; set; }
        public string numero_referencia { get; set; }
        public string url_comprobante { get; set; }
        public int dias_pendiente { get; set; }
    }
}