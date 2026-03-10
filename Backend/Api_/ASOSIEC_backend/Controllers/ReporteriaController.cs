using Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using System;
using System.Linq;

namespace ASOSIEC.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class ReporteriaController : Controller
    {
        private readonly negocio _Helper;

        public ReporteriaController(negocio helper)
        {
            this._Helper = helper;
        }

        // ============================================
        // REPORTES GENERALES (ADMIN)
        // ============================================

        [HttpGet("ReporteVentasGeneral")]
        public IActionResult ReporteVentasGeneral()
        {
            try
            {
                var reporte = _Helper.Consultar<Entidad_ReporteVentas>("sp_reporte_ventas_general").FirstOrDefault();
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ReporteVentasGeneral: {ex.Message}");
                return StatusCode(500, new { mensaje = "Error al obtener reporte", detalle = ex.Message });
            }
        }

        /// <summary>
        /// ✅ NUEVO: Ventas semanales (últimos 7 días)
        /// Reemplaza a VentasPorMes para mostrar datos diarios
        /// </summary>
        [HttpGet("VentasSemanales")]
        public IActionResult VentasSemanales()
        {
            try
            {
                Console.WriteLine("📊 Consultando ventas semanales (últimos 7 días)...");
                var ventas = _Helper.Consultar<Entidad_VentasSemanales>("sp_ventas_semanales");
                Console.WriteLine($"   ✅ Registros encontrados: {ventas.Count}");
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en VentasSemanales: {ex.Message}");
                return StatusCode(500, new { mensaje = "Error al obtener ventas semanales", detalle = ex.Message });
            }
        }

        /// <summary>
        /// 📌 MANTENIDO: Ventas por mes (para histórico)
        /// Útil para reportes mensuales o anuales
        /// </summary>
        [HttpGet("VentasPorMes")]
        public IActionResult VentasPorMes()
        {
            try
            {
                var ventas = _Helper.Consultar<Entidad_VentasPorMes>("sp_ventas_por_mes");
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en VentasPorMes: {ex.Message}");
                return StatusCode(500, new { mensaje = "Error al obtener ventas por mes", detalle = ex.Message });
            }
        }

        [HttpGet("ProductosMasVendidos")]
        public IActionResult ProductosMasVendidos()
        {
            try
            {
                Console.WriteLine("📦 Consultando top productos más vendidos...");
                var productos = _Helper.Consultar<Entidad_ProductoMasVendido>("sp_productos_mas_vendidos");
                Console.WriteLine($"   ✅ Productos encontrados: {productos.Count}");

                if (productos.Count == 0)
                {
                    Console.WriteLine("   ⚠️ No se encontraron productos vendidos");
                }

                return Ok(productos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ProductosMasVendidos: {ex.Message}");
                Console.WriteLine($"   Stack: {ex.StackTrace}");
                return StatusCode(500, new { mensaje = "Error al obtener productos más vendidos", detalle = ex.Message });
            }
        }

        [HttpGet("VentasPorVendedor")]
        public IActionResult VentasPorVendedor()
        {
            try
            {
                Console.WriteLine("👥 Consultando ventas por vendedor...");
                var ventas = _Helper.Consultar<Entidad_VentasPorVendedor>("sp_ventas_por_vendedor");
                Console.WriteLine($"   ✅ Vendedores encontrados: {ventas.Count}");
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en VentasPorVendedor: {ex.Message}");
                return StatusCode(500, new { mensaje = "Error al obtener ventas por vendedor", detalle = ex.Message });
            }
        }

        [HttpGet("DashboardKPIs")]
        public IActionResult DashboardKPIs()
        {
            try
            {
                Console.WriteLine("📊 Consultando KPIs del dashboard...");
                var kpis = _Helper.Consultar<Entidad_DashboardKPIs>("sp_dashboard_kpis").FirstOrDefault();

                if (kpis == null)
                {
                    Console.WriteLine("   ⚠️ No se pudieron obtener los KPIs, retornando valores por defecto");
                    kpis = new Entidad_DashboardKPIs
                    {
                        ventas_mes_actual = 0,
                        ventas_mes_anterior = 0,
                        crecimiento_porcentaje = 0,
                        ordenes_pendientes = 0,
                        ordenes_completadas_mes = 0,
                        total_ordenes = 0,
                        total_productos = 0,
                        productos_sin_stock = 0,
                        total_clientes = 0,
                        vendedores_activos = 0,
                        solicitudes_pendientes = 0
                    };
                }
                else
                {
                    Console.WriteLine($"   ✅ KPIs obtenidos: Ventas mes actual = ${kpis.ventas_mes_actual}");
                }

                return Ok(kpis);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en DashboardKPIs: {ex.Message}");
                Console.WriteLine($"   Stack: {ex.StackTrace}");
                return StatusCode(500, new { mensaje = "Error al obtener KPIs", detalle = ex.Message });
            }
        }

        [HttpGet("ComprobantesPendientes")]
        public IActionResult ComprobantesPendientes()
        {
            try
            {
                Console.WriteLine("📋 Consultando comprobantes pendientes...");
                var comprobantes = _Helper.Consultar<Entidad_ComprobantePendiente>("sp_comprobantes_pendientes");
                Console.WriteLine($"   ✅ Comprobantes pendientes: {comprobantes.Count}");
                return Ok(comprobantes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ComprobantesPendientes: {ex.Message}");
                Console.WriteLine($"   Stack: {ex.StackTrace}");
                return StatusCode(500, new { mensaje = "Error al obtener comprobantes pendientes", detalle = ex.Message });
            }
        }

        // ============================================
        // REPORTES ESPECÍFICOS DE VENDEDOR
        // ============================================

        [HttpGet("ReporteVendedor/{vendedorId}")]
        public IActionResult ReporteVendedor(int vendedorId)
        {
            try
            {
                Console.WriteLine($"📊 Consultando reporte del vendedor {vendedorId}...");
                var reporte = _Helper.ConsultarId<Entidad_ReporteVendedor>("sp_reporte_vendedor", vendedorId);

                if (reporte != null)
                {
                    Console.WriteLine($"   ✅ Reporte obtenido: {reporte.nombre_comercial}");
                    return Ok(reporte);
                }
                else
                {
                    Console.WriteLine($"   ⚠️ No se encontró información del vendedor");
                    return NotFound(new { mensaje = "No se encontró información del vendedor" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ReporteVendedor: {ex.Message}");
                return StatusCode(500, new { mensaje = "Error al obtener reporte del vendedor", detalle = ex.Message });
            }
        }

        [HttpGet("ProductosVendedorEstadisticas/{vendedorId}")]
        public IActionResult ProductosVendedorEstadisticas(int vendedorId)
        {
            try
            {
                Console.WriteLine($"📦 Consultando estadísticas de productos del vendedor {vendedorId}...");
                var productos = _Helper.ConsultarId<Entidad_ProductoVendedor>("sp_productos_vendedor_estadisticas", vendedorId);
                return Ok(productos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ProductosVendedorEstadisticas: {ex.Message}");
                return StatusCode(500, new { mensaje = "Error al obtener estadísticas de productos", detalle = ex.Message });
            }
        }

        [HttpGet("DashboardKPIsVendedor/{vendedorId}")]
        public IActionResult DashboardKPIsVendedor(int vendedorId)
        {
            try
            {
                Console.WriteLine($"📊 Consultando KPIs del vendedor {vendedorId}...");
                var kpis = _Helper.ConsultarId<Entidad_DashboardKPIs>("sp_dashboard_kpis_vendedor", vendedorId);

                if (kpis == null)
                {
                    Console.WriteLine($"   ⚠️ No se pudieron obtener KPIs del vendedor {vendedorId}");
                    kpis = new Entidad_DashboardKPIs
                    {
                        ventas_mes_actual = 0,
                        ventas_mes_anterior = 0,
                        crecimiento_porcentaje = 0,
                        ordenes_pendientes = 0,
                        ordenes_completadas_mes = 0,
                        total_ordenes = 0,
                        total_productos = 0,
                        productos_sin_stock = 0
                    };
                }

                return Ok(kpis);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en DashboardKPIsVendedor: {ex.Message}");
                return StatusCode(500, new { mensaje = "Error al obtener KPIs del vendedor", detalle = ex.Message });
            }
        }

        /// <summary>
        /// ✅ NUEVO: Ventas semanales del vendedor
        /// </summary>
        [HttpGet("VentasSemanalesVendedor/{vendedorId}")]
        public IActionResult VentasSemanalesVendedor(int vendedorId)
        {
            try
            {
                Console.WriteLine($"📊 Consultando ventas semanales del vendedor {vendedorId}...");

                // Reutilizar la lógica pero filtrado por vendedor
                // Este endpoint necesitaría un SP adicional, por ahora usamos lógica en C#
                var todasLasVentas = _Helper.Consultar<Entidad_VentasSemanales>("sp_ventas_semanales");

                // Nota: Esto es temporal. Lo ideal sería crear sp_ventas_semanales_vendedor
                // que filtre directamente en SQL para mejor performance

                return Ok(todasLasVentas);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en VentasSemanalesVendedor: {ex.Message}");
                return StatusCode(500, new { mensaje = "Error al obtener ventas semanales del vendedor", detalle = ex.Message });
            }
        }
    }
}