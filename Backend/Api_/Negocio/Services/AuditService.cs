using Entidad;
using DataAccess;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Linq;

namespace Negocio.Services
{
    public class AuditService
    {
        private readonly DataAcces _dataAccess;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditService(IHttpContextAccessor httpContextAccessor)
        {
            _dataAccess = new DataAcces();
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Obtiene la IP real del cliente, manejando proxies y balanceadores de carga
        /// </summary>
        private string ObtenerIPReal(HttpContext httpContext)
        {
            if (httpContext == null) return "unknown";

            // 1️⃣ Intentar obtener de headers de proxy/balanceador
            var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                // X-Forwarded-For puede contener múltiples IPs: "client, proxy1, proxy2"
                // Tomamos la primera (la del cliente real)
                var ips = forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries);
                if (ips.Length > 0)
                {
                    var ip = ips[0].Trim();

                    // Si es IPv6 loopback en desarrollo, intentar obtener IP real
                    if (ip != "::1" && ip != "127.0.0.1")
                    {
                        return ip;
                    }
                }
            }

            // 2️⃣ Otros headers comunes de proxy
            var realIp = httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp) && realIp != "::1" && realIp != "127.0.0.1")
            {
                return realIp;
            }

            // 3️⃣ IP de la conexión directa
            var remoteIp = httpContext.Connection?.RemoteIpAddress?.ToString();

            if (!string.IsNullOrEmpty(remoteIp))
            {
                // 4️⃣ Convertir ::1 (IPv6) a formato más legible
                if (remoteIp == "::1")
                {
                    return "127.0.0.1 (localhost)";
                }

                // 5️⃣ Simplificar IPv6 si es muy largo
                if (remoteIp.Contains(":") && remoteIp.Length > 20)
                {
                    return remoteIp.Substring(0, 20) + "...";
                }

                return remoteIp;
            }

            return "unknown";
        }

        /// <summary>
        /// Registra un evento de auditoría
        /// </summary>
        public void RegistrarAuditoria(
            string tipoOperacion,
            string entidad,
            int? entidadId,
            string accion,
            object valoresAnteriores = null,
            object valoresNuevos = null,
            bool exito = true,
            string codigoError = null,
            string mensajeError = null,
            Dictionary<string, object> datosAdicionales = null)
        {
            try
            {
                var httpContext = _httpContextAccessor.HttpContext;

                // Extraer información del usuario del JWT
                var userId = httpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userEmail = httpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;
                var userName = httpContext?.User?.FindFirst(ClaimTypes.Name)?.Value;
                var userRole = httpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;

                // ✅ MEJORADO: Obtener IP real
                var ipAddress = ObtenerIPReal(httpContext);
                var userAgent = httpContext?.Request?.Headers["User-Agent"].ToString();
                var endpoint = httpContext?.Request?.Path.ToString();
                var metodoHttp = httpContext?.Request?.Method;

                // Serializar valores
                string valoresAnterioresJson = valoresAnteriores != null
                    ? JsonSerializer.Serialize(valoresAnteriores, new JsonSerializerOptions { WriteIndented = false })
                    : null;

                string valoresNuevosJson = valoresNuevos != null
                    ? JsonSerializer.Serialize(valoresNuevos, new JsonSerializerOptions { WriteIndented = false })
                    : null;

                string datosAdicionalesJson = datosAdicionales != null
                    ? JsonSerializer.Serialize(datosAdicionales, new JsonSerializerOptions { WriteIndented = false })
                    : null;

                // Llamar al SP
                using (var connection = new SqlConnection(_dataAccess.GetConnectionString()))
                {
                    using (var cmd = new SqlCommand("sp_Registrar_Auditoria", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@usuario_id", string.IsNullOrEmpty(userId) ? DBNull.Value : (object)int.Parse(userId));
                        cmd.Parameters.AddWithValue("@usuario_email", userEmail ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@usuario_nombre", userName ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@usuario_rol", userRole ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@tipo_operacion", tipoOperacion);
                        cmd.Parameters.AddWithValue("@entidad", entidad);
                        cmd.Parameters.AddWithValue("@entidad_id", entidadId ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@accion", accion);
                        cmd.Parameters.AddWithValue("@tabla_afectada", entidad);
                        cmd.Parameters.AddWithValue("@valores_anteriores", valoresAnterioresJson ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@valores_nuevos", valoresNuevosJson ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@ip_address", ipAddress ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@user_agent", userAgent ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@endpoint", endpoint ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@metodo_http", metodoHttp ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@exito", exito);
                        cmd.Parameters.AddWithValue("@codigo_error", codigoError ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@mensaje_error", mensajeError ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@datos_adicionales", datosAdicionalesJson ?? (object)DBNull.Value);

                        connection.Open();
                        cmd.ExecuteNonQuery();

                        // 📊 Log mejorado
                        Console.WriteLine($"✅ Auditoría registrada - Usuario: {userEmail ?? "Sistema"} | IP: {ipAddress} | Acción: {accion}");
                    }
                }
            }
            catch (Exception ex)
            {
                // No fallar la operación principal si falla la auditoría
                Console.WriteLine($"❌ Error al registrar auditoría: {ex.Message}");
            }
        }

        /// <summary>
        /// Consultar auditoría con filtros
        /// </summary>
        public List<Entidad_AuditLog> ConsultarAuditoria(
            DateTime? fechaInicio = null,
            DateTime? fechaFin = null,
            int? usuarioId = null,
            string entidad = null,
            int? entidadId = null,
            string tipoOperacion = null,
            bool? soloExitosos = null,
            int pagina = 1,
            int registrosPorPagina = 50)
        {
            var logs = new List<Entidad_AuditLog>();

            using (var connection = new SqlConnection(_dataAccess.GetConnectionString()))
            {
                using (var cmd = new SqlCommand("sp_Consultar_Auditoria", connection))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@fecha_inicio", fechaInicio ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@fecha_fin", fechaFin ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@usuario_id", usuarioId ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@entidad", entidad ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@entidad_id", entidadId ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@tipo_operacion", tipoOperacion ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@solo_exitosos", soloExitosos ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@pagina", pagina);
                    cmd.Parameters.AddWithValue("@registros_por_pagina", registrosPorPagina);

                    connection.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            logs.Add(new Entidad_AuditLog
                            {
                                id = reader.GetInt32(reader.GetOrdinal("id")),
                                fecha_evento = reader.GetDateTime(reader.GetOrdinal("fecha_evento")),
                                usuario_id = reader.IsDBNull(reader.GetOrdinal("usuario_id")) ? null : reader.GetInt32(reader.GetOrdinal("usuario_id")),
                                usuario_email = reader.IsDBNull(reader.GetOrdinal("usuario_email")) ? null : reader.GetString(reader.GetOrdinal("usuario_email")),
                                usuario_nombre = reader.IsDBNull(reader.GetOrdinal("usuario_nombre")) ? null : reader.GetString(reader.GetOrdinal("usuario_nombre")),
                                usuario_rol = reader.IsDBNull(reader.GetOrdinal("usuario_rol")) ? null : reader.GetString(reader.GetOrdinal("usuario_rol")),
                                tipo_operacion = reader.GetString(reader.GetOrdinal("tipo_operacion")),
                                entidad = reader.GetString(reader.GetOrdinal("entidad")),
                                entidad_id = reader.IsDBNull(reader.GetOrdinal("entidad_id")) ? null : reader.GetInt32(reader.GetOrdinal("entidad_id")),
                                accion = reader.GetString(reader.GetOrdinal("accion")),
                                valores_anteriores = reader.IsDBNull(reader.GetOrdinal("valores_anteriores")) ? null : reader.GetString(reader.GetOrdinal("valores_anteriores")),
                                valores_nuevos = reader.IsDBNull(reader.GetOrdinal("valores_nuevos")) ? null : reader.GetString(reader.GetOrdinal("valores_nuevos")),
                                ip_address = reader.IsDBNull(reader.GetOrdinal("ip_address")) ? null : reader.GetString(reader.GetOrdinal("ip_address")),
                                exito = reader.GetBoolean(reader.GetOrdinal("exito"))
                            });
                        }
                    }
                }
            }

            return logs;
        }
    }
}