using Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using Negocio.Services;
using Negocio.Validators;
using DataAccess;
using ASOSIEC.Services;  // ✅ NUEVO: ConfiguracionService
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Claims;

namespace ASOSIEC.Controllers
{
    [ApiController]
    [Route("api")]
    public class LoginController : Controller
    {
        private readonly negocio _Helper;
        private readonly TokenService _tokenService;
        private readonly DataAcces _dataAccess;
        private readonly AuditService _auditService;
        private readonly ConfiguracionService _configuracionService;
        private readonly EmailService _emailService; 

        public LoginController(
            negocio login,
            TokenService tokenService,
            AuditService auditService,
            ConfiguracionService configuracionService,
            EmailService emailService)            
        {
            this._Helper = login;
            this._tokenService = tokenService;
            this._dataAccess = new DataAcces();
            this._auditService = auditService;
            this._configuracionService = configuracionService;
            this._emailService = emailService;     
        }

        // ============================================
        // LOGIN - ✅ ACTUALIZADO CON CONFIGURACIÓN DE BLOQUEO
        // ============================================
        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login([FromBody] Entidad_Login credenciales)
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

            try
            {
                Console.WriteLine($"🔐 Intento de login: {credenciales.email} desde IP: {ipAddress}");

                // ⚠️ RECAPTCHA COMENTADO - Descomentar cuando implementes ReCaptchaService
                /*
                // ✅ VERIFICAR RECAPTCHA
                var (esValido, score, mensaje) = await _reCaptchaService.VerificarToken(datos.recaptchaToken, "login");

                if (!esValido)
                {
                    Console.WriteLine($"🤖 reCAPTCHA rechazado: {mensaje}");
                    
                    // Auditar intento rechazado por reCAPTCHA
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "Autenticación",
                        entidadId: null,
                        accion: $"Login rechazado por reCAPTCHA",
                        valoresNuevos: new { email = credenciales.email },
                        exito: false,
                        codigoError: "RECAPTCHA_FAILED",
                        mensajeError: mensaje,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress },
                            { "user_agent", userAgent },
                            { "recaptcha_score", score }
                        }
                    );

                    return Ok(new
                    {
                        statusok = false,
                        mensaje = "Verificación de seguridad falló. Por favor, recarga la página e intenta de nuevo.",
                        codigoError = "RECAPTCHA_FAILED"
                    });
                }

                Console.WriteLine($"✅ reCAPTCHA válido - Score: {score}");
                */

                // ✅ LEER CONFIGURACIONES
                int maxIntentos = _configuracionService.ObtenerEntero("max_intentos_login", 5);
                int tiempoBloqueoMinutos = _configuracionService.ObtenerEntero("tiempo_bloqueo_login_minutos", 15);

                Console.WriteLine($"🔍 Config max_intentos_login: {maxIntentos}");
                Console.WriteLine($"🔍 Config tiempo_bloqueo_login_minutos: {tiempoBloqueoMinutos}");

                // ✅ VERIFICAR SI EL USUARIO ESTÁ BLOQUEADO (usando ConsultarConParametros)
                var verificacionBloqueo = _dataAccess.ConsultarConParametros<UsuarioBloqueado>(
                    "sp_Verificar_Usuario_Bloqueado",
                    new { email = credenciales.email }
                );

                if (verificacionBloqueo != null && verificacionBloqueo.esta_bloqueado == 1)
                {
                    Console.WriteLine($"🔒 Usuario bloqueado: {credenciales.email}. Tiempo restante: {verificacionBloqueo.minutos_restantes} minutos");

                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "Autenticación",
                        entidadId: null,
                        accion: "Login rechazado por cuenta bloqueada",
                        valoresNuevos: new { email = credenciales.email },
                        exito: false,
                        codigoError: "USUARIO_BLOQUEADO",
                        mensajeError: $"Cuenta bloqueada por {tiempoBloqueoMinutos} minutos",
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress },
                            { "minutos_restantes", verificacionBloqueo.minutos_restantes },
                            { "intentos_fallidos", verificacionBloqueo.intentos_fallidos }
                        }
                    );

                    return Ok(new
                    {
                        statusok = false,
                        mensaje = $"Cuenta bloqueada. Intenta nuevamente en {verificacionBloqueo.minutos_restantes} minutos.",
                        codigoError = "USUARIO_BLOQUEADO",
                        minutosRestantes = verificacionBloqueo.minutos_restantes
                    });
                }

                // ✅ INTENTAR LOGIN
                var usuario = _Helper.Login(credenciales);

                if (usuario.statusok)
                {
                    Console.WriteLine($"✅ Login exitoso para: {credenciales.email}");

                    // ✅ RESETEAR INTENTOS FALLIDOS
                    _dataAccess.Ejecutar("sp_Limpiar_Intentos_Fallidos", new { email = credenciales.email });

                    // ✅ RESETEAR RATE LIMITING
                    ASOSIEC_backend.Middleware.RateLimitingMiddleware.ResetLoginAttempts(credenciales.email);

                    // ✅ AUDITAR LOGIN EXITOSO
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "Autenticación",
                        entidadId: usuario.id,
                        accion: "Login exitoso",
                        valoresNuevos: new
                        {
                            email = usuario.email,
                            nombre = usuario.nombre,
                            apellido = usuario.apellido,
                            rolId = usuario.rolid
                        },
                        exito: true,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress },
                            { "user_agent", userAgent }
                        }
                    );

                    string token = _tokenService.GenerarToken(
                        usuario.id,
                        usuario.email,
                        usuario.rolid,
                        $"{usuario.nombre} {usuario.apellido}"
                    );

                    Console.WriteLine($"🔑 Token JWT generado para: {usuario.email}");

                    return Ok(new
                    {
                        statusok = true,
                        usuario = new
                        {
                            id = usuario.id,
                            nombre = usuario.nombre,
                            apellido = usuario.apellido,
                            email = usuario.email,
                            rolid = usuario.rolid
                        },
                        token = token,
                        mensaje = "Login exitoso"
                    });
                }
                else
                {
                    // ✅ LOGIN FALLIDO - REGISTRAR INTENTO
                    Console.WriteLine($"❌ Login fallido para: {credenciales.email}");

                    // ✅ REGISTRAR INTENTO FALLIDO CON CONFIGURACIONES (usando ConsultarConParametros)
                    var resultadoIntento = _dataAccess.ConsultarConParametros<ResultadoIntentoFallido>(
                        "sp_Registrar_Intento_Fallido",
                        new
                        {
                            email = credenciales.email,
                            max_intentos = maxIntentos,
                            tiempo_bloqueo_minutos = tiempoBloqueoMinutos
                        }
                    );

                    bool cuentaBloqueada = resultadoIntento?.bloqueado_hasta != null;

                    // ✅ AUDITAR INTENTO FALLIDO
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "Autenticación",
                        entidadId: null,
                        accion: "Login fallido - Credenciales incorrectas",
                        valoresNuevos: new { email = credenciales.email },
                        exito: false,
                        codigoError: cuentaBloqueada ? "CUENTA_BLOQUEADA_POR_INTENTOS" : "CREDENCIALES_INVALIDAS",
                        mensajeError: cuentaBloqueada
                            ? $"Cuenta bloqueada por {tiempoBloqueoMinutos} minutos tras {maxIntentos} intentos fallidos"
                            : "Credenciales inválidas",
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress },
                            { "user_agent", userAgent },
                            { "intentos_fallidos", resultadoIntento?.intentos_fallidos ?? 0 },
                            { "max_intentos", maxIntentos },
                            { "bloqueado", cuentaBloqueada }
                        }
                    );

                    if (cuentaBloqueada)
                    {
                        Console.WriteLine($"🔒 Cuenta bloqueada: {credenciales.email} por {tiempoBloqueoMinutos} minutos");
                        return Ok(new
                        {
                            statusok = false,
                            mensaje = $"Demasiados intentos fallidos. Cuenta bloqueada por {tiempoBloqueoMinutos} minutos.",
                            codigoError = "CUENTA_BLOQUEADA_POR_INTENTOS",
                            intentosRestantes = 0,
                            bloqueado = true,
                            tiempoBloqueoMinutos = tiempoBloqueoMinutos
                        });
                    }
                    else
                    {
                        int intentosRestantes = maxIntentos - (resultadoIntento?.intentos_fallidos ?? 0);
                        Console.WriteLine($"⚠️ Intentos restantes para {credenciales.email}: {intentosRestantes}");

                        return Ok(new
                        {
                            statusok = false,
                            mensaje = "Email o contraseña incorrectos",
                            codigoError = "CREDENCIALES_INVALIDAS",
                            intentosRestantes = intentosRestantes,
                            maxIntentos = maxIntentos
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en login: {ex.Message}");

                // ✅ AUDITAR ERROR DE LOGIN
                try
                {
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "Autenticación",
                        entidadId: null,
                        accion: "Error en proceso de login",
                        valoresNuevos: new { email = credenciales.email },
                        exito: false,
                        codigoError: "LOGIN_ERROR",
                        mensajeError: ex.Message,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress },
                            { "user_agent", userAgent }
                        }
                    );
                }
                catch { }

                return StatusCode(500, new
                {
                    statusok = false,
                    mensaje = "Error al procesar login",
                    codigoError = "LOGIN_ERROR"
                });
            }
        }

        // ============================================
        // VERIFICAR EMAIL
        // ============================================
        [HttpGet("Verificarmail/{mail}")]
        [AllowAnonymous]
        public IActionResult VerificarMail(string mail)
        {
            try
            {
                var usuario = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuario")
                    .Where(p => p.email == mail).FirstOrDefault();

                return Ok(usuario != null);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error verificando email: {ex.Message}");
                return StatusCode(500, false);
            }
        }

        // ============================================
        // SOLICITAR RECUPERACIÓN DE CONTRASEÑA (✅ CON AUDITORÍA)
        // ============================================
        [HttpPost("SolicitarRecuperacion")]
        [AllowAnonymous]
        public IActionResult SolicitarRecuperacion([FromBody] SolicitudRecuperacionDTO datos)
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            try
            {
                Console.WriteLine($"📧 Solicitud de recuperación para: {datos.email}");

                var usuario = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuario")
                    .Where(p => p.email == datos.email).FirstOrDefault();

                if (usuario == null)
                {
                    Console.WriteLine($"❌ Usuario no encontrado: {datos.email}");

                    // ✅ AUDITAR INTENTO FALLIDO
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "RecuperaciónContraseña",
                        entidadId: null,
                        accion: "Solicitud de recuperación para email no registrado",
                        valoresNuevos: new { email = datos.email },
                        exito: false,
                        codigoError: "EMAIL_NO_ENCONTRADO",
                        mensajeError: "Email no registrado en el sistema",
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress }
                        }
                    );

                    return Ok(new
                    {
                        statusok = false,
                        mensaje = "Si el correo está registrado, recibirás un enlace de recuperación."
                    });
                }

                var token = Guid.NewGuid().ToString();
                var expiracion = DateTime.Now.AddHours(1);

                var resultado = _dataAccess.Ejecutar("sp_Crear_Token_Recuperacion", new
                {
                    email = datos.email,
                    token = token,
                    expiracion = expiracion
                });

                if (resultado > 0)
                {
                    Console.WriteLine($"✅ Token de recuperación creado para: {datos.email}");

                    // ✅ AUDITAR CREACIÓN DE TOKEN
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "RecuperaciónContraseña",
                        entidadId: usuario.id,
                        accion: "Token de recuperación generado",
                        valoresNuevos: new
                        {
                            email = datos.email,
                            token_expiracion = expiracion
                        },
                        exito: true,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress },
                            { "expiracion", expiracion }
                        }
                    );

                    Console.WriteLine($"🔗 Link de recuperación: /recuperar-password?token={token}");

                    return Ok(new
                    {
                        statusok = true,
                        mensaje = "Si el correo está registrado, recibirás un enlace de recuperación.",
                        token = token
                    });
                }

                return StatusCode(500, new
                {
                    statusok = false,
                    mensaje = "Error al procesar la solicitud"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en solicitud de recuperación: {ex.Message}");

                // ✅ AUDITAR ERROR
                try
                {
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "RecuperaciónContraseña",
                        entidadId: null,
                        accion: "Error al solicitar recuperación",
                        valoresNuevos: new { email = datos.email },
                        exito: false,
                        codigoError: "RECUPERACION_ERROR",
                        mensajeError: ex.Message,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress }
                        }
                    );
                }
                catch { }

                return StatusCode(500, new
                {
                    statusok = false,
                    mensaje = "Error al procesar la solicitud"
                });
            }
        }

        // ============================================
        // RESTABLECER CONTRASEÑA (✅ CON AUDITORÍA)
        // ============================================
        [HttpPost("RestablecerPassword")]
        [AllowAnonymous]
        public IActionResult RestablecerPassword([FromBody] RestablecerPasswordDTO datos)
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            try
            {
                Console.WriteLine($"🔐 Intentando restablecer password con token: {datos.token.Substring(0, 8)}...");

                var tokenData = _dataAccess.Consultar<Entidad_TokenRecuperacion>(
                    "sp_Verificar_Token_Recuperacion"
                ).Where(t => t.token == datos.token).FirstOrDefault();

                if (tokenData == null)
                {
                    Console.WriteLine("❌ Token inválido o expirado");

                    // ✅ AUDITAR TOKEN INVÁLIDO
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "UPDATE",
                        entidad: "Usuario",
                        entidadId: null,
                        accion: "Intento de restablecer contraseña con token inválido",
                        exito: false,
                        codigoError: "TOKEN_INVALIDO",
                        mensajeError: "Token de recuperación inválido o expirado",
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress }
                        }
                    );

                    return Ok(new
                    {
                        statusok = false,
                        mensaje = "El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo."
                    });
                }

                // Hashear la nueva contraseña
                var passwordHash = DataAcces.HashPassword(datos.nuevaPassword);

                // Actualizar contraseña
                var resultado = _dataAccess.Ejecutar("sp_Actualizar_Password_Usuario", new
                {
                    email = tokenData.email,
                    password_hash = passwordHash
                });

                if (resultado > 0)
                {
                    // Marcar token como usado
                    _dataAccess.Ejecutar("sp_Usar_Token_Recuperacion", new { token = datos.token });

                    Console.WriteLine($"✅ Contraseña actualizada exitosamente para: {tokenData.email}");

                    // Buscar el ID del usuario para la auditoría
                    var usuario = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuario")
                        .Where(p => p.email == tokenData.email).FirstOrDefault();

                    // ✅ AUDITAR RESTABLECIMIENTO EXITOSO
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "UPDATE",
                        entidad: "Usuario",
                        entidadId: usuario?.id,
                        accion: "Contraseña restablecida mediante token",
                        valoresNuevos: new
                        {
                            email = tokenData.email,
                            password_cambiado = true
                        },
                        exito: true,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress },
                            { "metodo", "token_recuperacion" }
                        }
                    );

                    return Ok(new
                    {
                        statusok = true,
                        mensaje = "Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión."
                    });
                }

                return StatusCode(500, new
                {
                    statusok = false,
                    mensaje = "Error al actualizar la contraseña. Intenta de nuevo."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en restablecer password: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");

                // ✅ AUDITAR ERROR
                try
                {
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "UPDATE",
                        entidad: "Usuario",
                        entidadId: null,
                        accion: "Error al restablecer contraseña",
                        exito: false,
                        codigoError: "PASSWORD_RESET_ERROR",
                        mensajeError: ex.Message,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress }
                        }
                    );
                }
                catch { }

                return StatusCode(500, new
                {
                    statusok = false,
                    mensaje = "Error al procesar la solicitud"
                });
            }
        }

        // ============================================
        // VERIFICAR TOKEN
        // ============================================
        [HttpGet("VerificarToken/{token}")]
        [AllowAnonymous]
        public IActionResult VerificarToken(string token)
        {
            try
            {
                var tokenData = _dataAccess.Consultar<Entidad_TokenRecuperacion>(
                    "sp_Verificar_Token_Recuperacion"
                ).Where(t => t.token == token).FirstOrDefault();

                if (tokenData != null)
                {
                    return Ok(new
                    {
                        statusok = true,
                        email = tokenData.email,
                        expira = tokenData.fecha_expiracion
                    });
                }

                return Ok(new
                {
                    statusok = false,
                    mensaje = "Token inválido o expirado"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error verificando token: {ex.Message}");
                return StatusCode(500, new { statusok = false });
            }
        }

        // ============================================================
        // PASO 1: ENVIAR CÓDIGO DE 6 DÍGITOS AL CORREO
        // POST /api/Login/EnviarCodigoRecuperacion
        // ============================================================
        [HttpPost("EnviarCodigoRecuperacion")]
        [AllowAnonymous]
        public async Task<IActionResult> EnviarCodigoRecuperacion([FromBody] SolicitudRecuperacionDTO datos)
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            try
            {
                if (string.IsNullOrWhiteSpace(datos?.email))
                    return BadRequest(new { statusok = false, mensaje = "El correo es requerido." });

                Console.WriteLine($"📧 Solicitud de código de recuperación para: {datos.email}");

                // 1. Verificar que el email exista en el sistema
                var usuario = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuario")
                    .Where(p => p.email == datos.email).FirstOrDefault();

                if (usuario == null)
                {
                    // Respuesta genérica para no revelar si el email está registrado
                    Console.WriteLine($"⚠️ Email no encontrado (respuesta genérica): {datos.email}");
                    return Ok(new
                    {
                        statusok = true,
                        mensaje = "Si el correo está registrado, recibirás un código de verificación."
                    });
                }

                // 2. Generar código de 6 dígitos aleatorio
                var random = new Random();
                string codigo = random.Next(100000, 999999).ToString();

                // 3. Guardar código en BD (expira en 15 minutos)
                // Reutilizamos sp_Crear_Token_Recuperacion: el "token" es el código de 6 dígitos
                var resultado = _dataAccess.Ejecutar("sp_Crear_Token_Recuperacion", new
                {
                    email = datos.email,
                    token = codigo,
                    fecha_expiracion = DateTime.Now.AddMinutes(15),
                    ip_solicitud = ipAddress
                });

                if (resultado <= 0)
                {
                    Console.WriteLine($"❌ Error al guardar código de recuperación para: {datos.email}");
                    return StatusCode(500, new { statusok = false, mensaje = "Error interno. Intenta de nuevo." });
                }

                // 4. Enviar email con el código
                string nombreCompleto = $"{usuario.nombre} {usuario.apellido}".Trim();
                bool emailEnviado = await _emailService.EnviarCodigoRecuperacion(datos.email, nombreCompleto, codigo);

                if (!emailEnviado)
                    Console.WriteLine($"⚠️ El código se guardó pero el email falló para: {datos.email}");

                // Auditoría
                _auditService.RegistrarAuditoria(
                    tipoOperacion: "INSERT",
                    entidad: "RecuperaciónContraseña",
                    entidadId: usuario.id,
                    accion: "Código de 6 dígitos generado y enviado",
                    valoresNuevos: new { email = datos.email, metodo = "codigo_6_digitos" },
                    exito: true,
                    datosAdicionales: new Dictionary<string, object> { { "ip_address", ipAddress } }
                );

                Console.WriteLine($"✅ Código enviado a: {datos.email}");
                return Ok(new
                {
                    statusok = true,
                    mensaje = "Si el correo está registrado, recibirás un código de verificación."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en EnviarCodigoRecuperacion: {ex.Message}");
                return StatusCode(500, new { statusok = false, mensaje = "Error interno del servidor." });
            }
        }

        // ============================================================
        // PASO 2: VERIFICAR CÓDIGO DE 6 DÍGITOS
        // POST /api/Login/VerificarCodigoRecuperacion
        // ============================================================
        [HttpPost("VerificarCodigoRecuperacion")]
        [AllowAnonymous]
        public IActionResult VerificarCodigoRecuperacion([FromBody] VerificarCodigoDTO datos)
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            try
            {
                if (string.IsNullOrWhiteSpace(datos?.email) || string.IsNullOrWhiteSpace(datos?.codigo))
                    return BadRequest(new { statusok = false, mensaje = "Email y código son requeridos." });

                // Solo se aceptan exactamente 6 dígitos numéricos
                if (datos.codigo.Length != 6 || !datos.codigo.All(char.IsDigit))
                    return Ok(new { statusok = false, mensaje = "El código debe tener exactamente 6 dígitos." });

                Console.WriteLine($"🔍 Verificando código para: {datos.email}");

                // Usamos sp_Verificar_Token_Recuperacion existente (el "token" es el código de 6 dígitos)
                var tokenData = _dataAccess.ConsultarConParametros<Entidad_TokenRecuperacion>(
                    "sp_Verificar_Token_Recuperacion",
                    new { token = datos.codigo }
                );
                // Validar también que el email coincida
                if (tokenData != null && tokenData.email != datos.email)
                    tokenData = null;

                if (tokenData == null)
                {
                    Console.WriteLine($"❌ Código inválido o expirado para: {datos.email}");

                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "SELECT",
                        entidad: "RecuperaciónContraseña",
                        entidadId: null,
                        accion: "Intento de verificación de código fallido",
                        valoresNuevos: new { email = datos.email },
                        exito: false,
                        codigoError: "CODIGO_INVALIDO",
                        mensajeError: "Código inválido o expirado",
                        datosAdicionales: new Dictionary<string, object> { { "ip_address", ipAddress } }
                    );

                    return Ok(new { statusok = false, mensaje = "El código es incorrecto o ya expiró. Solicita uno nuevo." });
                }

                Console.WriteLine($"✅ Código válido para: {datos.email}");
                return Ok(new
                {
                    statusok = true,
                    mensaje = "Código verificado correctamente. Ahora puedes cambiar tu contraseña."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en VerificarCodigoRecuperacion: {ex.Message}");
                return StatusCode(500, new { statusok = false, mensaje = "Error interno del servidor." });
            }
        }

        // ============================================================
        // PASO 3: CAMBIAR CONTRASEÑA (tras verificar código)
        // POST /api/Login/CambiarPasswordConCodigo
        // ============================================================
        [HttpPost("CambiarPasswordConCodigo")]
        [AllowAnonymous]
        public IActionResult CambiarPasswordConCodigo([FromBody] CambiarPasswordConCodigoDTO datos)
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            try
            {
                if (string.IsNullOrWhiteSpace(datos?.email) ||
                    string.IsNullOrWhiteSpace(datos?.codigo) ||
                    string.IsNullOrWhiteSpace(datos?.nuevaPassword))
                    return BadRequest(new { statusok = false, mensaje = "Todos los campos son requeridos." });

                Console.WriteLine($"🔐 Intentando cambiar contraseña para: {datos.email}");

                // 1. Verificar código una vez más (seguridad extra)
                var tokenData = _dataAccess.ConsultarConParametros<Entidad_TokenRecuperacion>(
                    "sp_Verificar_Token_Recuperacion",
                    new { token = datos.codigo }
                );
                if (tokenData != null && tokenData.email != datos.email)
                    tokenData = null;

                if (tokenData == null)
                {
                    Console.WriteLine($"❌ Código inválido al cambiar contraseña: {datos.email}");
                    return Ok(new { statusok = false, mensaje = "El código es inválido o expiró. Inicia el proceso de nuevo." });
                }

                // 2. Hashear nueva contraseña
                var passwordHash = DataAcces.HashPassword(datos.nuevaPassword);

                // 3. Actualizar contraseña en BD
                var resultadoUpdate = _dataAccess.Ejecutar("sp_Actualizar_Password_Usuario", new
                {
                    email = datos.email,
                    password_hash = passwordHash
                });

                if (resultadoUpdate <= 0)
                {
                    Console.WriteLine($"❌ Error al actualizar contraseña para: {datos.email}");
                    return StatusCode(500, new { statusok = false, mensaje = "Error al actualizar contraseña. Intenta de nuevo." });
                }

                // 4. Marcar código como usado (sp_Usar_Token_Recuperacion recibe el token/codigo)
                _dataAccess.Ejecutar("sp_Usar_Token_Recuperacion", new
                {
                    token = datos.codigo
                });

                // Auditoría
                var usuario = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuario")
                    .Where(p => p.email == datos.email).FirstOrDefault();

                _auditService.RegistrarAuditoria(
                    tipoOperacion: "UPDATE",
                    entidad: "Usuario",
                    entidadId: usuario?.id,
                    accion: "Contraseña restablecida con código de verificación",
                    valoresNuevos: new { email = datos.email, metodo = "codigo_6_digitos" },
                    exito: true,
                    datosAdicionales: new Dictionary<string, object>
                    {
                        { "ip_address", ipAddress },
                        { "metodo", "codigo_recuperacion_email" }
                    }
                );

                Console.WriteLine($"✅ Contraseña cambiada exitosamente para: {datos.email}");
                return Ok(new { statusok = true, mensaje = "Contraseña actualizada exitosamente." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en CambiarPasswordConCodigo: {ex.Message}");
                return StatusCode(500, new { statusok = false, mensaje = "Error interno del servidor." });
            }
        }


        // ============================================
        // DESBLOQUEAR USUARIO MANUALMENTE (ADMIN) - ✅ NUEVO
        // ============================================
        [HttpPost("DesbloquearUsuario")]
        [Authorize(Roles = "Admin")]
        public IActionResult DesbloquearUsuario([FromBody] string email)
        {
            try
            {
                Console.WriteLine($"🔓 Desbloqueando usuario: {email}");

                // Limpiar intentos fallidos y bloqueo
                _dataAccess.Ejecutar("sp_Limpiar_Intentos_Fallidos", new { email = email });

                // ✅ AUDITAR SIN PARÁMETRO 'usuario'
                _auditService.RegistrarAuditoria(
                    tipoOperacion: "UPDATE",
                    entidad: "Usuario",
                    entidadId: null,
                    accion: $"Usuario desbloqueado manualmente: {email}",
                    exito: true
                );

                return Ok(new
                {
                    mensaje = $"Usuario {email} desbloqueado exitosamente"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al desbloquear usuario: {ex.Message}");
                return BadRequest(new
                {
                    mensaje = "Error al desbloquear usuario",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR ESTADO DE BLOQUEO (PÚBLICO) - ✅ NUEVO
        // ============================================
        [HttpGet("ConsultarEstadoBloqueo/{email}")]
        [AllowAnonymous]
        public IActionResult ConsultarEstadoBloqueo(string email)
        {
            try
            {
                // ✅ USAR ConsultarConParametros en lugar de Consultar con 2 argumentos
                var verificacionBloqueo = _dataAccess.ConsultarConParametros<UsuarioBloqueado>(
                    "sp_Verificar_Usuario_Bloqueado",
                    new { email = email }
                );

                if (verificacionBloqueo == null)
                {
                    return NotFound(new { mensaje = "Usuario no encontrado" });
                }

                int maxIntentos = _configuracionService.ObtenerEntero("max_intentos_login", 5);
                int intentosRestantes = maxIntentos - verificacionBloqueo.intentos_fallidos;

                return Ok(new
                {
                    bloqueado = verificacionBloqueo.esta_bloqueado == 1,
                    bloqueadoHasta = verificacionBloqueo.bloqueado_hasta,
                    minutosRestantes = verificacionBloqueo.minutos_restantes,
                    intentosFallidos = verificacionBloqueo.intentos_fallidos,
                    intentosRestantes = intentosRestantes > 0 ? intentosRestantes : 0,
                    maxIntentos = maxIntentos
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al consultar estado de bloqueo: {ex.Message}");
                return StatusCode(500, new
                {
                    mensaje = "Error al consultar estado",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ⚠️ DEPRECADO: Mantener por compatibilidad pero corregido
        // ============================================
        [HttpPut("recuperarpsw/{mail}/{psw}")]
        [AllowAnonymous]
        [Obsolete("Usar SolicitarRecuperacion y RestablecerPassword en su lugar")]
        public IActionResult RecuperarPsw(string mail, string psw)
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            // Este endpoint es inseguro, mantenerlo solo si tienes código legacy que lo usa
            // Eventualmente eliminar
            Console.WriteLine($"⚠️ Usando endpoint DEPRECADO de recuperación para: {mail}");

            var usuario = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuario")
                .Where(p => p.email == mail).FirstOrDefault();

            if (usuario != null)
            {
                // ✅ CORREGIDO: Usar el SP específico para actualizar contraseña
                // NO usar sp_Actualizar_Usuario porque ahora tiene demasiados campos
                Console.WriteLine($"🔒 Contraseña hasheada para actualización");
                var passwordHash = DataAcces.HashPassword(psw);

                var resultado = _dataAccess.Ejecutar("sp_Actualizar_Password_Usuario", new
                {
                    email = mail,
                    password_hash = passwordHash
                });

                bool Response = resultado > 0;

                // ✅ AUDITAR USO DE ENDPOINT DEPRECADO
                try
                {
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "UPDATE",
                        entidad: "Usuario",
                        entidadId: usuario.id,
                        accion: "Contraseña actualizada (endpoint DEPRECADO)",
                        valoresNuevos: new
                        {
                            email = mail,
                            metodo = "endpoint_legacy"
                        },
                        exito: Response,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress },
                            { "warning", "Endpoint deprecado usado" }
                        }
                    );
                }
                catch { }

                Console.WriteLine($"{(Response ? "✅" : "❌")} Contraseña actualizada: {mail}");

                return Ok(Response);
            }

            return Ok(false);
        }
    }

    // ============================================
    // CLASES DE APOYO PARA LOGIN - ✅ NUEVO
    // ============================================
    public class UsuarioBloqueado
    {
        public int esta_bloqueado { get; set; }
        public DateTime? bloqueado_hasta { get; set; }
        public int intentos_fallidos { get; set; }
        public int minutos_restantes { get; set; }
    }

    public class ResultadoIntentoFallido
    {
        public int intentos_fallidos { get; set; }
        public int max_intentos { get; set; }
        public DateTime? bloqueado_hasta { get; set; }
    }

    // ============================================
    // DTOs
    // ============================================
    public class SolicitudRecuperacionDTO
    {
        public string email { get; set; }
    }

    public class RestablecerPasswordDTO
    {
        public string token { get; set; }
        public string nuevaPassword { get; set; }
    }
    public class VerificarCodigoDTO
    {
        public string email { get; set; }
        public string codigo { get; set; }
    }

    public class CambiarPasswordConCodigoDTO
    {
        public string email { get; set; }
        public string codigo { get; set; }
        public string nuevaPassword { get; set; }
    }
}