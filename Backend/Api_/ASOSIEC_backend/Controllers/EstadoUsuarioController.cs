using Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using System;

namespace ASOSIEC.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class EstadoUsuarioController : Controller
    {
        private readonly negocio _Helper;

        public EstadoUsuarioController(negocio helper)
        {
            this._Helper = helper;
        }

        // ============================================
        // CONSULTAR TODOS LOS ESTADOS DE USUARIO
        // ============================================
        [HttpGet("ConsultarEstadosUsuario")]
        public IActionResult Consultar()
        {
            try
            {
                var estados = _Helper.Consultar<Entidad_EstadoUsuario>("sp_listar_estados_usuario");

                if (estados.Count > 0)
                {
                    return Ok(estados);
                }
                else
                {
                    return Ok(new System.Collections.Generic.List<Entidad_EstadoUsuario>());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarEstadosUsuario: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar estados de usuario",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR ESTADO USUARIO POR ID
        // ============================================
        [HttpGet("ConsultarEstadoUsuario/{id}")]
        public IActionResult ConsultarPorId(int id)
        {
            try
            {
                var estado = _Helper.ConsultarId<Entidad_EstadoUsuario>("sp_consultar_estado_usuario_id", id);

                if (estado != null)
                {
                    return Ok(estado);
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de usuario no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarEstadoUsuario: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar estado de usuario",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // REGISTRAR ESTADO USUARIO
        // ============================================
        [HttpPost("RegistrarEstadoUsuario")]
        public IActionResult Registrar([FromBody] Entidad_EstadoUsuario estado)
        {
            try
            {
                Console.WriteLine($"📝 Registrando estado de usuario: {estado.descripcion}");

                var response = _Helper.Registrar("sp_Registrar_EstadoUsuario", estado);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de usuario registrado correctamente"
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al registrar el estado de usuario"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en RegistrarEstadoUsuario: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al registrar estado de usuario",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ACTUALIZAR ESTADO USUARIO
        // ============================================
        [HttpPut("ActualizarEstadoUsuario")]
        public IActionResult Actualizar([FromBody] Entidad_EstadoUsuario estado)
        {
            try
            {
                Console.WriteLine($"✏️ Actualizando estado de usuario ID: {estado.id}");

                var response = _Helper.Actualizar("sp_Actualizar_EstadoUsuario", estado);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de usuario actualizado correctamente"
                    });
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de usuario no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ActualizarEstadoUsuario: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al actualizar estado de usuario",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ELIMINAR ESTADO USUARIO
        // ============================================
        [HttpDelete("EliminarEstadoUsuario/{id}")]
        public IActionResult Eliminar(int id)
        {
            try
            {
                Console.WriteLine($"🗑️ Eliminando estado de usuario ID: {id}");

                var response = _Helper.Eliminar("sp_Eliminar_EstadoUsuario", id);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de usuario eliminado correctamente"
                    });
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de usuario no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en EliminarEstadoUsuario: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al eliminar estado de usuario. Puede que esté en uso.",
                    detalle = ex.Message
                });
            }
        }
    }
}