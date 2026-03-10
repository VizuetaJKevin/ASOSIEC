using Microsoft.AspNetCore.Http;
using Negocio.Services;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace ASOSIEC_backend.Middleware
{
    public class AuditMiddleware
    {
        private readonly RequestDelegate _next;

        public AuditMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, AuditService auditService)
        {
            // Solo auditar endpoints de API
            if (!context.Request.Path.StartsWithSegments("/api"))
            {
                await _next(context);
                return;
            }

            var startTime = DateTime.UtcNow;
            var originalBodyStream = context.Response.Body;

            try
            {
                using (var responseBody = new MemoryStream())
                {
                    context.Response.Body = responseBody;

                    // Ejecutar el siguiente middleware
                    await _next(context);

                    var duration = DateTime.UtcNow - startTime;
                    var statusCode = context.Response.StatusCode;

                    // Registrar en auditoría si es una operación importante
                    var method = context.Request.Method;
                    if (method == "POST" || method == "PUT" || method == "DELETE")
                    {
                        var endpoint = context.Request.Path.ToString();
                        var exito = statusCode >= 200 && statusCode < 300;

                        // Determinar tipo de operación
                        string tipoOperacion = method switch
                        {
                            "POST" => "INSERT",
                            "PUT" => "UPDATE",
                            "DELETE" => "DELETE",
                            _ => "OTHER"
                        };

                        // Determinar entidad del endpoint
                        string entidad = DeterminarEntidad(endpoint);

                        auditService.RegistrarAuditoria(
                            tipoOperacion: tipoOperacion,
                            entidad: entidad,
                            entidadId: null,
                            accion: $"{method} {endpoint}",
                            valoresAnteriores: null,
                            valoresNuevos: null,
                            exito: exito,
                            codigoError: exito ? null : statusCode.ToString(),
                            mensajeError: null,
                            datosAdicionales: new System.Collections.Generic.Dictionary<string, object>
                            {
                                { "duracion_ms", duration.TotalMilliseconds },
                                { "status_code", statusCode }
                            }
                        );
                    }

                    // Copiar la respuesta de vuelta
                    responseBody.Seek(0, SeekOrigin.Begin);
                    await responseBody.CopyToAsync(originalBodyStream);
                }
            }
            catch (Exception ex)
            {
                // Registrar error en auditoría
                auditService.RegistrarAuditoria(
                    tipoOperacion: "ERROR",
                    entidad: "Sistema",
                    entidadId: null,
                    accion: $"Error en {context.Request.Method} {context.Request.Path}",
                    valoresAnteriores: null,
                    valoresNuevos: null,
                    exito: false,
                    codigoError: "EXCEPTION",
                    mensajeError: ex.Message,
                    datosAdicionales: null
                );

                throw;
            }
            finally
            {
                context.Response.Body = originalBodyStream;
            }
        }

        /// <summary>
        /// Determina la entidad basándose en el endpoint
        /// ✅ MEJORADO: Reconoce todas las entidades del sistema
        /// </summary>
        private string DeterminarEntidad(string endpoint)
        {
            // Convertir a minúsculas para comparación case-insensitive
            var endpointLower = endpoint.ToLower();

            // ============================================
            // ENTIDADES PRINCIPALES
            // ============================================

            // Usuario y autenticación
            if (endpointLower.Contains("login") || endpointLower.Contains("logout"))
                return "Autenticación";

            if (endpointLower.Contains("usuario"))
                return "Usuario";

            // Productos
            if (endpointLower.Contains("producto"))
                return "Producto";

            // Órdenes e Items
            if (endpointLower.Contains("orden"))
                return "Orden";

            if (endpointLower.Contains("item"))
                return "Item";

            // Comprobantes y pagos
            if (endpointLower.Contains("comprobante"))
                return "ComprobantePago";

            if (endpointLower.Contains("upload") && endpointLower.Contains("comprobante"))
                return "ComprobantePago";

            if (endpointLower.Contains("verificar") && endpointLower.Contains("comprobante"))
                return "ComprobantePago";

            // Vendedores
            if (endpointLower.Contains("vendedor"))
                return "Vendedor";

            // ============================================
            // CATÁLOGOS Y CONFIGURACIÓN
            // ============================================

            if (endpointLower.Contains("categoria"))
                return "CategoriaProducto";

            if (endpointLower.Contains("marca"))
                return "MarcaProducto";

            if (endpointLower.Contains("estado"))
            {
                if (endpointLower.Contains("usuario"))
                    return "EstadoUsuario";
                if (endpointLower.Contains("producto"))
                    return "EstadoProducto";
                if (endpointLower.Contains("orden"))
                    return "EstadoOrden";
                if (endpointLower.Contains("item"))
                    return "EstadoItem";
                return "Estado";
            }

            // ============================================
            // OTROS MÓDULOS
            // ============================================

            if (endpointLower.Contains("perfil"))
                return "Perfil";

            if (endpointLower.Contains("mensaje"))
                return "Mensajes";

            if (endpointLower.Contains("rol"))
                return "Rol";

            if (endpointLower.Contains("datos") && endpointLower.Contains("bancarios"))
                return "DatosBancarios";

            if (endpointLower.Contains("configuracion"))
                return "Configuracion";

            if (endpointLower.Contains("reporteria") || endpointLower.Contains("reporte"))
                return "Reporteria";

            if (endpointLower.Contains("upload"))
                return "Archivo";

            // ============================================
            // AUDITORÍA
            // ============================================

            if (endpointLower.Contains("audit"))
                return "Auditoria";

            // ============================================
            // CASOS ESPECIALES
            // ============================================

            // Si llega aquí, intentar extraer la entidad del patrón /api/NombreEntidad
            var segments = endpoint.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (segments.Length >= 2)
            {
                // Tomar el segundo segmento (después de /api/)
                var possibleEntity = segments[1];

                // Limpiar números y caracteres especiales
                possibleEntity = System.Text.RegularExpressions.Regex.Replace(possibleEntity, @"\d+", "");
                possibleEntity = possibleEntity.Replace("_", "");

                // Si tiene al menos 3 caracteres, usarlo
                if (possibleEntity.Length >= 3)
                {
                    return char.ToUpper(possibleEntity[0]) + possibleEntity.Substring(1).ToLower();
                }
            }

            // ============================================
            // FALLBACK
            // ============================================
            return "Sistema";
        }
    }
}