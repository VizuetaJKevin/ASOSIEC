using Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using Negocio.Services;
using Negocio.Validators;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace tienda_instrumentos.Controllers
{
    [ApiController]
    [Route("api")]
    //[Authorize] 
    public class UsuarioController : ControllerBase
    {
        private readonly negocio _Helper;
        private readonly EmailService _emailService;
        private readonly AuditService _auditService;

        public UsuarioController(negocio Usuario, AuditService auditService, EmailService emailService)
        {
            this._Helper = Usuario;
            this._emailService = emailService;
            this._auditService = auditService;
        }

        // ============================================
        // CONSULTAR TODOS LOS USUARIOS
        // ============================================
        [HttpGet("ConsultarUsuarios")]
        //[Authorize(Roles = "Admin")] 
        public IActionResult Consultar()
        {
            IActionResult Result = Unauthorized();
            var usuarios = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuario");
            if (usuarios.Count > 0)
            {
                Result = Ok(usuarios);
            }
            else
            {
                Result = NotFound();
            }
            return Result;
        }

        // ============================================
        // CONSULTAR USUARIOS PENDIENTES DE APROBACIÓN
        // ============================================
        [HttpGet("ConsultarUsuariosPendientes")]
        //[Authorize(Roles = "Admin")] 
        public IActionResult ConsultarUsuariosPendientes()
        {
            try
            {
                Console.WriteLine("📋 Consultando usuarios pendientes de aprobación...");

                var usuariosPendientes = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuarios_pendientes");

                Console.WriteLine($"   Encontrados: {usuariosPendientes.Count} usuarios pendientes");

                return Ok(usuariosPendientes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarUsuariosPendientes: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar usuarios pendientes",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // REGISTRAR USUARIO (✅ CON AUDITORÍA COMPLETA)
        // ============================================
        [HttpPost("Registrar_usuario")]
        public async Task<IActionResult> Registrar([FromBody] Entidad_Usuario Usuario)
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            try
            {
                Console.WriteLine("🔍 ===== REGISTRAR USUARIO =====");
                Console.WriteLine($"   rolId: {Usuario.rolId}");
                Console.WriteLine($"   estadoUsuarioId: {Usuario.estadoUsuarioId}");
                Console.WriteLine($"   email: {Usuario.email}");

                // ✅ VALIDAR CONTRASEÑA FUERTE
                var (esValida, mensajeValidacion) = PasswordValidator.ValidarPassword(Usuario.password);

                if (!esValida)
                {
                    Console.WriteLine($"❌ Contraseña rechazada: {mensajeValidacion}");

                    // ✅ AUDITAR INTENTO FALLIDO
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "Usuario",
                        entidadId: null,
                        accion: "Intento de registro con contraseña débil",
                        valoresNuevos: new { email = Usuario.email },
                        exito: false,
                        codigoError: "PASSWORD_DEBIL",
                        mensajeError: mensajeValidacion,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress }
                        }
                    );

                    return BadRequest(new
                    {
                        success = false,
                        mensaje = mensajeValidacion,
                        codigoError = "PASSWORD_DEBIL"
                    });
                }

                Console.WriteLine($"✅ Contraseña validada correctamente");

                bool esVendedorPublico = Usuario.rolId == 3 && Usuario.estadoUsuarioId == 4;
                bool esVendedorAdmin = Usuario.rolId == 3 && Usuario.estadoUsuarioId == 1;

                if (esVendedorPublico)
                {
                    Console.WriteLine("📢 CASO: Registro público de vendedor (requiere aprobación)");
                }
                else if (esVendedorAdmin)
                {
                    Console.WriteLine("✅ CASO: Admin creando vendedor (activo inmediatamente)");
                }
                else
                {
                    Console.WriteLine("👤 CASO: Usuario normal (cliente)");
                }

                var Response = _Helper.Registrar("sp_Registrar_Usuario", Usuario);

                if (Response)
                {
                    // ✅ AUDITORÍA: Registrar creación de usuario
                    try
                    {
                        _auditService.RegistrarAuditoria(
                            tipoOperacion: "INSERT",
                            entidad: "Usuario",
                            entidadId: null,
                            accion: $"Registro de nuevo usuario: {Usuario.email} con rol {Usuario.rolId}",
                            valoresNuevos: new
                            {
                                email = Usuario.email,
                                nombre = Usuario.nombre,
                                apellido = Usuario.apellido,
                                rolId = Usuario.rolId,
                                estadoUsuarioId = Usuario.estadoUsuarioId,
                                tipo_registro = esVendedorPublico ? "vendedor_publico" :
                                               esVendedorAdmin ? "vendedor_admin" : "cliente"
                            },
                            exito: true,
                            datosAdicionales: new Dictionary<string, object>
                            {
                                { "ip_address", ipAddress }
                            }
                        );
                    }
                    catch (Exception auditEx)
                    {
                        Console.WriteLine($"⚠️ Error en auditoría (no crítico): {auditEx.Message}");
                    }

                    // ✅ SOLO enviar emails si es vendedor PÚBLICO
                    if (esVendedorPublico)
                    {
                        Console.WriteLine("📧 Enviando emails de solicitud de vendedor...");

                        await _emailService.EnviarEmailSolicitudVendedor(
                            Usuario.email,
                            $"{Usuario.nombre} {Usuario.apellido}"
                        );

                        await _emailService.NotificarAdminNuevoVendedor(
                            $"{Usuario.nombre} {Usuario.apellido}",
                            Usuario.email
                        );

                        Console.WriteLine($"✅ Emails enviados a: {Usuario.email}");

                        return Ok(new
                        {
                            success = true,
                            mensaje = "Solicitud enviada. Tu cuenta será revisada por un administrador."
                        });
                    }
                    else if (esVendedorAdmin)
                    {
                        return Ok(new
                        {
                            success = true,
                            mensaje = "Vendedor registrado correctamente y activo."
                        });
                    }
                    else
                    {
                        return Ok(new
                        {
                            success = true,
                            mensaje = "Usuario registrado correctamente."
                        });
                    }
                }
                else
                {
                    // ✅ AUDITAR FALLO EN REGISTRO
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "Usuario",
                        entidadId: null,
                        accion: "Fallo al registrar usuario",
                        valoresNuevos: new { email = Usuario.email },
                        exito: false,
                        codigoError: "REGISTRO_FAILED",
                        mensajeError: "Error al ejecutar SP de registro",
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "ip_address", ipAddress }
                        }
                    );

                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al registrar usuario."
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en Registrar: {ex.Message}");

                // ✅ AUDITAR ERROR
                try
                {
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "Usuario",
                        entidadId: null,
                        accion: "Error en registro de usuario",
                        valoresNuevos: new { email = Usuario.email },
                        exito: false,
                        codigoError: "REGISTRO_ERROR",
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
                    success = false,
                    mensaje = "Error al registrar usuario",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR USUARIO POR ID
        // ============================================
        [HttpGet("ConsultarUsuario/{id}")]
        public IActionResult ConsultarId(int id)
        {
            IActionResult result = Unauthorized();
            var usuario = _Helper.ConsultarId<Entidad_Usuario>("sp_ConsultarUsuario", id);

            if (usuario != null)
            {
                result = Ok(usuario);
            }
            else
            {
                result = NotFound();
            }

            return result;
        }

        // ============================================
        // APROBAR USUARIO (✅ CON AUDITORÍA)
        // ============================================
        [HttpPost("AprobarUsuario")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> AprobarUsuario([FromBody] AprobarUsuarioRequest request)
        {
            try
            {
                Console.WriteLine($"✅ Aprobando usuario ID: {request.UsuarioId}");

                // Obtener información del usuario ANTES de aprobar
                var usuario = _Helper.ConsultarId<Entidad_Usuario>("sp_ConsultarUsuario", request.UsuarioId);

                if (usuario == null)
                {
                    return NotFound(new { success = false, mensaje = "Usuario no encontrado" });
                }

                var response = _Helper.AprobarUsuario(request.UsuarioId, request.AdminId);

                if (response)
                {
                    Console.WriteLine($"   Usuario aprobado: {usuario.email}");

                    // ✅ AUDITAR APROBACIÓN
                    try
                    {
                        _auditService.RegistrarAuditoria(
                            tipoOperacion: "UPDATE",
                            entidad: "Usuario",
                            entidadId: request.UsuarioId,
                            accion: $"Aprobación de usuario {usuario.email}",
                            valoresAnteriores: new { estadoUsuarioId = usuario.estadoUsuarioId },
                            valoresNuevos: new { estadoUsuarioId = 1 }, // Activo
                            exito: true,
                            datosAdicionales: new Dictionary<string, object>
                            {
                                { "aprobado_por", request.AdminId }
                            }
                        );
                    }
                    catch (Exception auditEx)
                    {
                        Console.WriteLine($"⚠️ Error en auditoría (no crítico): {auditEx.Message}");
                    }

                    // Enviar email de aprobación usando el método correcto
                    await _emailService.EnviarEmailVendedorAprobado(
                        usuario.email,
                        $"{usuario.nombre} {usuario.apellido}"
                    );

                    Console.WriteLine($"📧 Email de aprobación enviado a: {usuario.email}");

                    return Ok(new
                    {
                        success = true,
                        mensaje = "Usuario aprobado correctamente."
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al aprobar el usuario."
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en AprobarUsuario: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al aprobar usuario",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // RECHAZAR USUARIO (✅ CON AUDITORÍA)
        // ============================================
        [HttpPost("RechazarUsuario")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> RechazarUsuario([FromBody] RechazarUsuarioRequest request)
        {
            try
            {
                Console.WriteLine($"❌ Rechazando usuario ID: {request.UsuarioId}");
                Console.WriteLine($"   Motivo: {request.MotivoRechazo}");

                var usuario = _Helper.ConsultarId<Entidad_Usuario>("sp_ConsultarUsuario", request.UsuarioId);

                if (usuario == null)
                {
                    return NotFound(new { success = false, mensaje = "Usuario no encontrado" });
                }

                var response = _Helper.RechazarUsuario(request.UsuarioId, request.AdminId);

                if (response)
                {
                    Console.WriteLine($"   Usuario rechazado: {usuario.email}");

                    // ✅ AUDITAR RECHAZO
                    try
                    {
                        _auditService.RegistrarAuditoria(
                            tipoOperacion: "UPDATE",
                            entidad: "Usuario",
                            entidadId: request.UsuarioId,
                            accion: $"Rechazo de usuario {usuario.email}",
                            valoresAnteriores: new { estadoUsuarioId = usuario.estadoUsuarioId },
                            valoresNuevos: new { estadoUsuarioId = 3 }, // Rechazado
                            exito: true,
                            datosAdicionales: new Dictionary<string, object>
                            {
                                { "motivo_rechazo", request.MotivoRechazo },
                                { "rechazado_por", request.AdminId }
                            }
                        );
                    }
                    catch (Exception auditEx)
                    {
                        Console.WriteLine($"⚠️ Error en auditoría (no crítico): {auditEx.Message}");
                    }

                    // Enviar email de rechazo usando el método correcto
                    await _emailService.EnviarEmailVendedorRechazado(
                        usuario.email,
                        $"{usuario.nombre} {usuario.apellido}",
                        request.MotivoRechazo
                    );

                    Console.WriteLine($"📧 Email de rechazo enviado a: {usuario.email}");

                    return Ok(new
                    {
                        success = true,
                        mensaje = "Usuario rechazado correctamente."
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al rechazar el usuario."
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en RechazarUsuario: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al rechazar usuario",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ACTUALIZAR USUARIO (✅ CON AUDITORÍA)
        // ============================================
        [HttpPut("Actualizar_usuario")]
        public IActionResult Actualizar([FromBody] Entidad_Usuario usuario)
        {
            try
            {
                Console.WriteLine("🔍 ===== ACTUALIZAR USUARIO =====");
                Console.WriteLine($"   id: {usuario.id}");
                Console.WriteLine($"   email: {usuario.email}");

                // ✅ Validar contraseña si se está actualizando
                if (!string.IsNullOrEmpty(usuario.password) && !usuario.password.StartsWith("$2"))
                {
                    var (esValida, mensajeValidacion) = PasswordValidator.ValidarPassword(usuario.password);

                    if (!esValida)
                    {
                        Console.WriteLine($"❌ Contraseña rechazada: {mensajeValidacion}");
                        return BadRequest(new
                        {
                            success = false,
                            mensaje = mensajeValidacion,
                            codigoError = "PASSWORD_DEBIL"
                        });
                    }
                }

                // ✅ Obtener valores anteriores para auditoría
                var usuarioAnterior = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuario").FirstOrDefault(u => u.id == usuario.id);

                var response = _Helper.Actualizar("sp_Actualizar_Usuario", usuario);

                if (response)
                {
                    // ✅ AUDITAR ACTUALIZACIÓN
                    try
                    {
                        _auditService.RegistrarAuditoria(
                            tipoOperacion: "UPDATE",
                            entidad: "Usuario",
                            entidadId: usuario.id,
                            accion: $"Actualización de usuario {usuario.email}",
                            valoresAnteriores: usuarioAnterior,
                            valoresNuevos: usuario,
                            exito: true
                        );
                    }
                    catch (Exception auditEx)
                    {
                        Console.WriteLine($"⚠️ Error en auditoría (no crítico): {auditEx.Message}");
                    }

                    return Ok(new { success = true, mensaje = "Usuario actualizado correctamente" });
                }
                else
                {
                    return BadRequest(new { success = false, mensaje = "Error al actualizar" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR: {ex.Message}");
                return StatusCode(500, new { success = false, mensaje = ex.Message });
            }
        }

        // ============================================
        // ELIMINAR USUARIO (✅ CON AUDITORÍA)
        // ============================================
        [HttpDelete("Eliminar_usuario/{id}")]
        public IActionResult Eliminar(int id)
        {
            try
            {
                // Obtener información del usuario antes de eliminar
                var usuario = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuario").FirstOrDefault(u => u.id == id);

                // Eliminar las órdenes asociadas
                var eliminarOrdenes = _Helper.EliminarOrdenesPorUsuario("sp_EliminarOrdenesPorUsuario", id);

                if (eliminarOrdenes)
                {
                    var response = _Helper.Eliminar("sp_Eliminar_Usuario", id);

                    if (response)
                    {
                        // ✅ AUDITAR ELIMINACIÓN
                        try
                        {
                            _auditService.RegistrarAuditoria(
                                tipoOperacion: "DELETE",
                                entidad: "Usuario",
                                entidadId: id,
                                accion: $"Eliminación de usuario {usuario?.email ?? "ID:" + id}",
                                valoresAnteriores: usuario,
                                exito: true
                            );
                        }
                        catch (Exception auditEx)
                        {
                            Console.WriteLine($"⚠️ Error en auditoría (no crítico): {auditEx.Message}");
                        }

                        return Ok(response);
                    }
                    else
                    {
                        return NotFound("Error al eliminar el usuario.");
                    }
                }
                else
                {
                    return NotFound("Error al eliminar las órdenes asociadas.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en Eliminar: {ex.Message}");
                return StatusCode(500, new { success = false, mensaje = ex.Message });
            }
        }

        // ============================================
        // VALIDAR FORTALEZA DE CONTRASEÑA
        // ============================================
        [HttpPost("ValidarPassword")]
        [AllowAnonymous]
        public IActionResult ValidarPassword([FromBody] ValidarPasswordDTO datos)
        {
            try
            {
                if (string.IsNullOrEmpty(datos.password))
                {
                    return BadRequest(new
                    {
                        esValida = false,
                        mensaje = "La contraseña no puede estar vacía",
                        fortaleza = 0
                    });
                }

                var (esValida, mensaje) = PasswordValidator.ValidarPassword(datos.password);
                var fortaleza = PasswordValidator.CalcularFortaleza(datos.password);

                return Ok(new
                {
                    esValida = esValida,
                    mensaje = mensaje,
                    fortaleza = fortaleza,
                    nivel = fortaleza < 30 ? "Muy débil" :
                            fortaleza < 50 ? "Débil" :
                            fortaleza < 70 ? "Moderada" :
                            fortaleza < 90 ? "Fuerte" : "Muy fuerte"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ValidarPassword: {ex.Message}");
                return StatusCode(500, new { mensaje = "Error al validar contraseña" });
            }
        }
    }

    // ============================================
    // DTOs
    // ============================================
    public class AprobarUsuarioRequest
    {
        public int UsuarioId { get; set; }
        public int AdminId { get; set; }
    }

    public class RechazarUsuarioRequest
    {
        public int UsuarioId { get; set; }
        public int AdminId { get; set; }
        public string MotivoRechazo { get; set; }
    }

    public class ValidarPasswordDTO
    {
        public string password { get; set; }
    }
}