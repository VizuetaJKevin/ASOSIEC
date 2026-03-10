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
    public class EstadoProductoController : Controller
    {
        private readonly negocio _Helper;

        public EstadoProductoController(negocio helper)
        {
            this._Helper = helper;
        }

        // ============================================
        // CONSULTAR TODOS LOS ESTADOS DE PRODUCTO
        // ============================================
        [HttpGet("ConsultarEstadosProducto")]
        public IActionResult Consultar()
        {
            try
            {
                var estados = _Helper.Consultar<Entidad_EstadoProducto>("sp_listar_estados_producto");

                if (estados.Count > 0)
                {
                    return Ok(estados);
                }
                else
                {
                    return Ok(new System.Collections.Generic.List<Entidad_EstadoProducto>());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarEstadosProducto: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar estados de producto",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR ESTADO PRODUCTO POR ID
        // ============================================
        [HttpGet("ConsultarEstadoProducto/{id}")]
        public IActionResult ConsultarPorId(int id)
        {
            try
            {
                var estado = _Helper.ConsultarId<Entidad_EstadoProducto>("sp_consultar_estado_producto_id", id);

                if (estado != null)
                {
                    return Ok(estado);
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de producto no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarEstadoProducto: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar estado de producto",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // REGISTRAR ESTADO PRODUCTO
        // ============================================
        [HttpPost("RegistrarEstadoProducto")]
        public IActionResult Registrar([FromBody] Entidad_EstadoProducto estado)
        {
            try
            {
                Console.WriteLine($"📝 Registrando estado de producto: {estado.descripcion}");

                var response = _Helper.Registrar("sp_Registrar_EstadoProducto", estado);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de producto registrado correctamente"
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al registrar el estado de producto"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en RegistrarEstadoProducto: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al registrar estado de producto",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ACTUALIZAR ESTADO PRODUCTO
        // ============================================
        [HttpPut("ActualizarEstadoProducto")]
        public IActionResult Actualizar([FromBody] Entidad_EstadoProducto estado)
        {
            try
            {
                Console.WriteLine($"✏️ Actualizando estado de producto ID: {estado.id}");

                var response = _Helper.Actualizar("sp_Actualizar_EstadoProducto", estado);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de producto actualizado correctamente"
                    });
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de producto no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ActualizarEstadoProducto: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al actualizar estado de producto",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ELIMINAR ESTADO PRODUCTO
        // ============================================
        [HttpDelete("EliminarEstadoProducto/{id}")]
        public IActionResult Eliminar(int id)
        {
            try
            {
                Console.WriteLine($"🗑️ Eliminando estado de producto ID: {id}");

                var response = _Helper.Eliminar("sp_Eliminar_EstadoProducto", id);

                if (response)
                {
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Estado de producto eliminado correctamente"
                    });
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Estado de producto no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en EliminarEstadoProducto: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al eliminar estado de producto. Puede que esté en uso.",
                    detalle = ex.Message
                });
            }
        }
    }
}