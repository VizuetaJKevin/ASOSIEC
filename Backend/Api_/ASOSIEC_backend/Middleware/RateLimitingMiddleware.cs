using Microsoft.AspNetCore.Http;
using ASOSIEC.Services;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ASOSIEC_backend.Middleware
{
    /// <summary>
    /// Middleware mejorado para limitar intentos de login POR CUENTA INDIVIDUAL
    /// Previene ataques de fuerza bruta sin bloquear a todos los usuarios de la misma IP
    /// ✅ CORREGIDO: Usa IServiceScopeFactory para resolver servicios Scoped
    /// </summary>
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _scopeFactory; // ✅ CAMBIO: IServiceScopeFactory en lugar de ConfiguracionService

        // Almacena intentos por EMAIL (para login)
        private static readonly ConcurrentDictionary<string, List<DateTime>> _loginAttemptsByEmail = new();

        // Almacena intentos por IP (para endpoints sin autenticación)
        private static readonly ConcurrentDictionary<string, List<DateTime>> _requestsByIp = new();

        // ⚙️ VALORES POR DEFECTO (usados si falla la lectura de configuración)
        private const int DEFAULT_MAX_LOGIN_ATTEMPTS = 5;
        private const int DEFAULT_LOGIN_LOCKOUT_MINUTES = 5;
        private const int DEFAULT_MAX_IP_REQUESTS = 10;
        private const int DEFAULT_IP_WINDOW_MINUTES = 5;

        public RateLimitingMiddleware(RequestDelegate next, IServiceScopeFactory scopeFactory)
        {
            _next = next;
            _scopeFactory = scopeFactory; // ✅ CAMBIO: Guardar el factory
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var endpoint = context.Request.Path.ToString().ToLower();

            // ✅ CREAR UN SCOPE TEMPORAL para obtener el servicio Scoped
            using (var scope = _scopeFactory.CreateScope())
            {
                var configuracionService = scope.ServiceProvider.GetRequiredService<ConfiguracionService>();

                // ✅ LEER CONFIGURACIONES DINÁMICAS
                int maxLoginAttempts = configuracionService.ObtenerEntero("max_intentos_login", DEFAULT_MAX_LOGIN_ATTEMPTS);
                int loginLockoutMinutes = configuracionService.ObtenerEntero("tiempo_bloqueo_login_minutos", DEFAULT_LOGIN_LOCKOUT_MINUTES);

                // ✅ LÓGICA MEJORADA: Diferenciar entre login y otros endpoints
                if (endpoint.Contains("/api/login"))
                {
                    // Para LOGIN: bloquear por EMAIL (cuenta individual)
                    var email = await GetEmailFromRequest(context);

                    if (!string.IsNullOrEmpty(email))
                    {
                        var key = $"login:{email.ToLower()}";

                        if (!IsLoginAllowed(key, maxLoginAttempts, loginLockoutMinutes))
                        {
                            Console.WriteLine($"🚫 [RateLimiting] Login bloqueado para: {email} (máx: {maxLoginAttempts} intentos en {loginLockoutMinutes} min)");

                            context.Response.StatusCode = 429; // Too Many Requests
                            context.Response.ContentType = "application/json";

                            await context.Response.WriteAsJsonAsync(new
                            {
                                statusok = false,
                                mensaje = $"Demasiados intentos fallidos para esta cuenta. Por favor, espera {loginLockoutMinutes} minutos.",
                                codigoError = "ACCOUNT_RATE_LIMIT_EXCEEDED",
                                tiempoEspera = loginLockoutMinutes,
                                email = email
                            });

                            return;
                        }

                        // Registrar el intento ANTES de ejecutar el login
                        // (se registra incluso si es exitoso para evitar spam)
                        LogLoginAttempt(key, maxLoginAttempts);
                    }
                }
                else if (ShouldApplyIpRateLimit(endpoint))
                {
                    // Para OTROS ENDPOINTS SENSIBLES: bloquear por IP
                    var ip = GetClientIp(context);
                    var key = $"ip:{ip}:{endpoint}";

                    if (!IsIpRequestAllowed(key, DEFAULT_MAX_IP_REQUESTS, DEFAULT_IP_WINDOW_MINUTES))
                    {
                        Console.WriteLine($"🚫 [RateLimiting] Rate limit por IP excedido: {ip} en {endpoint}");

                        context.Response.StatusCode = 429;
                        context.Response.ContentType = "application/json";

                        await context.Response.WriteAsJsonAsync(new
                        {
                            statusok = false,
                            mensaje = $"Demasiados intentos. Por favor, espera {DEFAULT_IP_WINDOW_MINUTES} minutos.",
                            codigoError = "IP_RATE_LIMIT_EXCEEDED",
                            tiempoEspera = DEFAULT_IP_WINDOW_MINUTES
                        });

                        return;
                    }

                    LogIpRequest(key);
                }
            } // ✅ El scope se libera automáticamente aquí

            await _next(context);
        }

        /// <summary>
        /// Extrae el email del body de la petición (para login)
        /// </summary>
        private async Task<string> GetEmailFromRequest(HttpContext context)
        {
            try
            {
                // Habilitar buffering para poder leer el body múltiples veces
                context.Request.EnableBuffering();

                using (var reader = new StreamReader(
                    context.Request.Body,
                    encoding: Encoding.UTF8,
                    detectEncodingFromByteOrderMarks: false,
                    bufferSize: 1024,
                    leaveOpen: true))
                {
                    var body = await reader.ReadToEndAsync();

                    // Resetear la posición del stream para que el controller pueda leerlo
                    context.Request.Body.Position = 0;

                    if (string.IsNullOrWhiteSpace(body))
                        return null;

                    // Parsear el JSON
                    var jsonDoc = JsonDocument.Parse(body);

                    // Intentar obtener el email (puede estar en diferentes formatos)
                    if (jsonDoc.RootElement.TryGetProperty("email", out var emailElement))
                    {
                        return emailElement.GetString();
                    }

                    if (jsonDoc.RootElement.TryGetProperty("Email", out var emailElement2))
                    {
                        return emailElement2.GetString();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Error extrayendo email del request: {ex.Message}");
            }

            return null;
        }

        /// <summary>
        /// Determina si el endpoint debe tener rate limiting por IP
        /// </summary>
        private bool ShouldApplyIpRateLimit(string endpoint)
        {
            var sensitiveEndpoints = new[]
            {
                "/api/registrarusuario",
                "/api/recuperarpsw",
                "/api/verificarmail",
                "/api/solicitarrecuperacion",
                "/api/restablecerpassword"
            };

            return sensitiveEndpoints.Any(e => endpoint.Contains(e));
        }

        /// <summary>
        /// Obtiene la IP real del cliente (considerando proxies)
        /// </summary>
        private string GetClientIp(HttpContext context)
        {
            var xForwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(xForwardedFor))
            {
                var ips = xForwardedFor.Split(',');
                return ips[0].Trim();
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        /// <summary>
        /// ✅ ACTUALIZADO: Recibe parámetros dinámicos
        /// Verifica si el login está permitido para este EMAIL
        /// </summary>
        private bool IsLoginAllowed(string key, int maxAttempts, int lockoutMinutes)
        {
            if (!_loginAttemptsByEmail.ContainsKey(key))
                return true;

            var attempts = _loginAttemptsByEmail[key];

            // Limpiar intentos antiguos
            attempts.RemoveAll(t => (DateTime.Now - t).TotalMinutes > lockoutMinutes);

            return attempts.Count < maxAttempts;
        }

        /// <summary>
        /// ✅ ACTUALIZADO: Recibe parámetros dinámicos
        /// Verifica si la petición por IP está permitida
        /// </summary>
        private bool IsIpRequestAllowed(string key, int maxRequests, int windowMinutes)
        {
            if (!_requestsByIp.ContainsKey(key))
                return true;

            var requests = _requestsByIp[key];

            requests.RemoveAll(t => (DateTime.Now - t).TotalMinutes > windowMinutes);

            return requests.Count < maxRequests;
        }

        /// <summary>
        /// ✅ ACTUALIZADO: Muestra el límite dinámico en el log
        /// Registra un intento de login por EMAIL
        /// </summary>
        private void LogLoginAttempt(string key, int maxAttempts)
        {
            if (!_loginAttemptsByEmail.ContainsKey(key))
            {
                _loginAttemptsByEmail[key] = new List<DateTime>();
            }

            _loginAttemptsByEmail[key].Add(DateTime.Now);
            Console.WriteLine($"📝 [RateLimiting] Intento registrado: {key} (Total: {_loginAttemptsByEmail[key].Count}/{maxAttempts})");
        }

        /// <summary>
        /// Registra una petición por IP
        /// </summary>
        private void LogIpRequest(string key)
        {
            if (!_requestsByIp.ContainsKey(key))
            {
                _requestsByIp[key] = new List<DateTime>();
            }

            _requestsByIp[key].Add(DateTime.Now);
        }

        /// <summary>
        /// Limpia el caché de rate limiting (llamar periódicamente)
        /// </summary>
        public static void CleanupOldEntries()
        {
            // Limpiar intentos de login (usar valores por defecto para limpieza)
            foreach (var key in _loginAttemptsByEmail.Keys.ToList())
            {
                _loginAttemptsByEmail[key].RemoveAll(t => (DateTime.Now - t).TotalMinutes > DEFAULT_LOGIN_LOCKOUT_MINUTES);

                if (_loginAttemptsByEmail[key].Count == 0)
                {
                    _loginAttemptsByEmail.TryRemove(key, out _);
                }
            }

            // Limpiar peticiones por IP
            foreach (var key in _requestsByIp.Keys.ToList())
            {
                _requestsByIp[key].RemoveAll(t => (DateTime.Now - t).TotalMinutes > DEFAULT_IP_WINDOW_MINUTES);

                if (_requestsByIp[key].Count == 0)
                {
                    _requestsByIp.TryRemove(key, out _);
                }
            }

            Console.WriteLine($"🧹 [RateLimiting] Cache limpiado - Cuentas monitoreadas: {_loginAttemptsByEmail.Count}, IPs monitoreadas: {_requestsByIp.Count}");
        }

        /// <summary>
        /// ✅ Método para resetear el contador de una cuenta específica
        /// Útil para cuando un usuario hace login exitoso
        /// </summary>
        public static void ResetLoginAttempts(string email)
        {
            if (string.IsNullOrEmpty(email))
                return;

            var key = $"login:{email.ToLower()}";

            if (_loginAttemptsByEmail.ContainsKey(key))
            {
                _loginAttemptsByEmail.TryRemove(key, out _);
                Console.WriteLine($"✅ [RateLimiting] Contador reseteado para: {email}");
            }
        }
    }
}