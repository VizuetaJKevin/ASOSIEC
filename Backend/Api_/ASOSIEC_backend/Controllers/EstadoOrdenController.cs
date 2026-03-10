using Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using System;

namespace ASOSIEC.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api")]
    public class EstadoOrdenController : Controller
    {
        private readonly negocio _Helper;

        public EstadoOrdenController(negocio helper)
        {
            this._Helper = helper;
        }

        // ============================================
        // CONSULTAR TODOS LOS ESTADOS DE ORDEN
        // ============================================
        [HttpGet("ConsultarEstadosOrden")]
        public IActionResult Consultar()
        {
            try
            {
                var estados = _Helper.Consultar<Entidad_EstadoOrden>("sp_listar_estados_orden");

                if (estados.Count > 0)
                {
                    return Ok(estados);
                }
                else
                {
                    return Ok(new System.Collections.Generic.List<Entidad_EstadoOrden>());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarEstadosOrden: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar estados de orden",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR ESTADO ORDEN POR ID
        // ============================================
        [HttpGet("ConsultarEstadoOrden/{id}")]
        public IActionResult ConsultarPorId(int id)
        {
            try
            {
                var estado = _Helper.ConsultarId<Entidad_EstadoOrden>("sp_consultar_estado_orden_id", id);

                if (estado != null)
                {
                    return Ok(estado);
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de orden no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarEstadoOrden: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar estado de orden",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // REGISTRAR ESTADO ORDEN
        // ============================================
        [HttpPost("RegistrarEstadoOrden")]
        public IActionResult Registrar([FromBody] Entidad_EstadoOrden estado)
        {
            try
            {
                Console.WriteLine($"📝 Registrando estado de orden: {estado.descripcion}");

                var response = _Helper.Registrar("sp_Registrar_EstadoOrden", estado);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de orden registrado correctamente"
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al registrar el estado de orden"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en RegistrarEstadoOrden: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al registrar estado de orden",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ACTUALIZAR ESTADO ORDEN
        // ============================================
        [HttpPut("ActualizarEstadoOrden")]
        public IActionResult Actualizar([FromBody] Entidad_EstadoOrden estado)
        {
            try
            {
                Console.WriteLine($"✏️ Actualizando estado de orden ID: {estado.id}");

                var response = _Helper.Actualizar("sp_Actualizar_EstadoOrden", estado);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de orden actualizado correctamente"
                    });
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de orden no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ActualizarEstadoOrden: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al actualizar estado de orden",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ELIMINAR ESTADO ORDEN
        // ============================================
        [HttpDelete("EliminarEstadoOrden/{id}")]
        public IActionResult Eliminar(int id)
        {
            try
            {
                Console.WriteLine($"🗑️ Eliminando estado de orden ID: {id}");

                var response = _Helper.Eliminar("sp_Eliminar_EstadoOrden", id);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de orden eliminado correctamente"
                    });
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de orden no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en EliminarEstadoOrden: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al eliminar estado de orden. Puede que esté en uso.",
                    detalle = ex.Message
                });
            }
        }
    }
}