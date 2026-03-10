using Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using ASOSIEC.Services; // ✅ NUEVO: Importar ConfiguracionService
using System;
using System.Linq;

namespace ASOSIEC.Controllers
{
    [ApiController]
    [Route("api")]
    //[Authorize]
    public class VendedorController : Controller
    {
        private readonly negocio _Helper;
        private readonly ConfiguracionService _configuracionService; // ✅ NUEVO

        // ✅ CONSTRUCTOR MEJORADO CON INYECCIÓN DE CONFIGURACIONSERVICE
        public VendedorController(negocio helper, ConfiguracionService configuracionService)
        {
            this._Helper = helper;
            this._configuracionService = configuracionService; // ✅ NUEVO
        }

        // ============================================
        // CONSULTAR TODOS LOS VENDEDORES
        // ============================================
        [HttpGet("ConsultarVendedores")]
        public IActionResult ConsultarVendedores()
        {
            try
            {
                var vendedores = _Helper.Consultar<Entidad_VendedorCompleto>("sp_listar_vendedores");

                if (vendedores.Count > 0)
                {
                    return Ok(vendedores);
                }
                else
                {
                    return Ok(new System.Collections.Generic.List<Entidad_VendedorCompleto>());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarVendedores: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar vendedores",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR VENDEDOR POR ID
        // ============================================
        [HttpGet("ConsultarVendedor/{id}")]
        public IActionResult ConsultarVendedor(int id)
        {
            try
            {
                var vendedor = _Helper.ConsultarId<Entidad_VendedorCompleto>("sp_consultar_vendedorId", id);

                if (vendedor != null)
                {
                    return Ok(vendedor);
                }
                else
                {
                    return NotFound(new { mensaje = "Vendedor no encontrado" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarVendedor: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar vendedor",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR VENDEDOR POR USUARIO ID
        // ============================================
        [HttpGet("ConsultarVendedorPorUsuario/{usuarioId}")]
        public IActionResult ConsultarVendedorPorUsuario(int usuarioId)
        {
            try
            {
                Console.WriteLine($"🔍 Buscando vendedor para usuario: {usuarioId}");

                var vendedor = _Helper.ConsultarConParametro<Entidad_Vendedor>(
                    "sp_consultar_vendedor_por_usuario",
                    "@usuarioId",
                    usuarioId
                );

                if (vendedor != null)
                {
                    if (vendedor.estadoUsuarioId != 1)
                    {
                        Console.WriteLine($"⚠️ Vendedor encontrado pero está inactivo. Estado: {vendedor.estadoUsuarioId}");
                        return BadRequest(new
                        {
                            mensaje = "Tu cuenta de vendedor está bloqueada o inactiva. Contacta al administrador.",
                            estadoUsuarioId = vendedor.estadoUsuarioId,
                            vendedorId = vendedor.id
                        });
                    }

                    Console.WriteLine($"✅ Vendedor encontrado y activo: {vendedor.nombre_comercial}");
                    return Ok(vendedor);
                }
                else
                {
                    Console.WriteLine($"⚠️ No existe perfil de vendedor para usuario {usuarioId}");
                    return NotFound(new
                    {
                        mensaje = "No se encontró perfil de vendedor para este usuario",
                        usuarioId = usuarioId,
                        sugerencia = "El administrador debe aprobar primero tu cuenta de vendedor"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarVendedorPorUsuario: {ex.Message}");
                Console.WriteLine($"   Stack trace: {ex.StackTrace}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar vendedor",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ✅ REGISTRAR VENDEDOR - MEJORADO CON CONFIGURACIÓN
        // Ahora verifica si requiere aprobación de admin
        // ============================================
        [HttpPost("RegistrarVendedor")]
        public IActionResult RegistrarVendedor([FromBody] Entidad_Vendedor vendedor)
        {
            try
            {
                // ✅ OBTENER CONFIGURACIÓN: ¿Requiere aprobación?
                bool requiereAprobacion = _configuracionService.ObtenerBooleano("requiere_aprobacion_vendedor", true);

                Console.WriteLine($"🔍 Registrando vendedor - Requiere aprobación: {requiereAprobacion}");

                // ✅ APLICAR LA CONFIGURACIÓN
                // NOTA: Esto depende de cómo esté estructurada tu tabla Vendedor
                // Ajusta según tu modelo de datos
                // Si tu tabla tiene un campo 'aprobado' (bit), usa:
                // vendedor.aprobado = !requiereAprobacion;

                // Si tu tabla usa estadoUsuarioId para indicar aprobación:
                if (requiereAprobacion)
                {
                    Console.WriteLine("⚠️ Vendedor requiere aprobación de administrador");
                    // Aquí ajusta según tu modelo:
                    // vendedor.estadoUsuarioId = 2; // 2 = PENDIENTE
                    // O si tienes un campo específico:
                    // vendedor.aprobado = false;
                }
                else
                {
                    Console.WriteLine("✅ Vendedor auto-aprobado por configuración");
                    // vendedor.estadoUsuarioId = 1; // 1 = ACTIVO
                    // O:
                    // vendedor.aprobado = true;
                }

                var response = _Helper.Registrar("sp_Registrar_Vendedor", vendedor);

                if (response)
                {
                    // ✅ MENSAJE DINÁMICO SEGÚN CONFIGURACIÓN
                    string mensaje = requiereAprobacion
                        ? "Vendedor registrado exitosamente. Su cuenta está pendiente de aprobación por el administrador."
                        : "Vendedor registrado y aprobado automáticamente. Ya puede comenzar a vender.";

                    return Ok(new
                    {
                        success = true,
                        mensaje = mensaje,
                        requiereAprobacion = requiereAprobacion
                    });
                }
                else
                {
                    return BadRequest(new { success = false, mensaje = "Error al registrar vendedor" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en RegistrarVendedor: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al registrar vendedor",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ACTUALIZAR VENDEDOR
        // ============================================
        [HttpPut("ActualizarVendedor")]
        public IActionResult ActualizarVendedor([FromBody] Entidad_Vendedor vendedor)
        {
            try
            {
                var response = _Helper.Actualizar("sp_Actualizar_Vendedor", vendedor);

                if (response)
                {
                    return Ok(new { success = true, mensaje = "Vendedor actualizado correctamente" });
                }
                else
                {
                    return BadRequest(new { success = false, mensaje = "Error al actualizar vendedor" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ActualizarVendedor: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al actualizar vendedor",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ELIMINAR VENDEDOR
        // ============================================
        [HttpDelete("EliminarVendedor/{id}")]
        public IActionResult EliminarVendedor(int id)
        {
            try
            {
                var response = _Helper.Eliminar("sp_Eliminar_Vendedor", id);

                if (response)
                {
                    return Ok(new { success = true, mensaje = "Vendedor eliminado correctamente" });
                }
                else
                {
                    return BadRequest(new { success = false, mensaje = "Error al eliminar vendedor" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en EliminarVendedor: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al eliminar vendedor",
                    detalle = ex.Message
                });
            }
        }
    }
}
