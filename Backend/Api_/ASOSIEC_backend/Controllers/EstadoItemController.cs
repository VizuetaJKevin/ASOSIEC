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
    public class EstadoItemController : Controller
    {
        private readonly negocio _Helper;

        public EstadoItemController(negocio helper)
        {
            this._Helper = helper;
        }

        // ============================================
        // CONSULTAR TODOS LOS ESTADOS DE ITEM
        // ============================================
        [HttpGet("ConsultarEstadosItem")]
        public IActionResult Consultar()
        {
            try
            {
                var estados = _Helper.Consultar<Entidad_EstadoItem>("sp_listar_estados_item");

                if (estados.Count > 0)
                {
                    return Ok(estados);
                }
                else
                {
                    return Ok(new System.Collections.Generic.List<Entidad_EstadoItem>());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarEstadosItem: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar estados de item",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR ESTADO ITEM POR ID
        // ============================================
        [HttpGet("ConsultarEstadoItem/{id}")]
        public IActionResult ConsultarPorId(int id)
        {
            try
            {
                var estado = _Helper.ConsultarId<Entidad_EstadoItem>("sp_consultar_estado_item_id", id);

                if (estado != null)
                {
                    return Ok(estado);
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de item no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarEstadoItem: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar estado de item",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // REGISTRAR ESTADO ITEM
        // ============================================
        [HttpPost("RegistrarEstadoItem")]
        public IActionResult Registrar([FromBody] Entidad_EstadoItem estado)
        {
            try
            {
                Console.WriteLine($"📝 Registrando estado de item: {estado.descripcion}");

                var response = _Helper.Registrar("sp_Registrar_EstadoItem", estado);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de item registrado correctamente"
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al registrar el estado de item"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en RegistrarEstadoItem: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al registrar estado de item",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ACTUALIZAR ESTADO ITEM
        // ============================================
        [HttpPut("ActualizarEstadoItem")]
        public IActionResult Actualizar([FromBody] Entidad_EstadoItem estado)
        {
            try
            {
                Console.WriteLine($"✏️ Actualizando estado de item ID: {estado.id}");

                var response = _Helper.Actualizar("sp_Actualizar_EstadoItem", estado);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de item actualizado correctamente"
                    });
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de item no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ActualizarEstadoItem: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al actualizar estado de item",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ELIMINAR ESTADO ITEM
        // ============================================
        [HttpDelete("EliminarEstadoItem/{id}")]
        public IActionResult Eliminar(int id)
        {
            try
            {
                Console.WriteLine($"🗑️ Eliminando estado de item ID: {id}");

                var response = _Helper.Eliminar("sp_Eliminar_EstadoItem", id);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de item eliminado correctamente"
                    });
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de item no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en EliminarEstadoItem: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al eliminar estado de item. Puede que esté en uso.",
                    detalle = ex.Message
                });
            }
        }
    }
}