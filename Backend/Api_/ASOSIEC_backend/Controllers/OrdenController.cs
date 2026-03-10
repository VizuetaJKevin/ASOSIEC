using Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;

namespace ASOSIEC.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class OrdenController : Controller
    {
        private readonly negocio _Helper;

        public OrdenController(negocio Orden)
        {
            this._Helper = Orden;
        }

        [HttpGet("ConsultarOrdenes")]
        public IActionResult Consultar()
        {
            try
            {
                var ordens = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes");
                if (ordens.Count > 0)
                {
                    return Ok(ordens);
                }
                else
                {
                    return NotFound();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al consultar órdenes", detalle = ex.Message });
            }
        }

        [HttpGet("ConsultarOrdenUserId/{id}")]
        public IActionResult ConsultarOrdenUserId(int id)
        {
            try
            {
                // ✅ CORRECCIÓN: Mostrar órdenes con comprobante verificado (estado >= 3)
                // Estado 3 = Comprobante enviado
                // Estado 4 = Verificado
                // Estado 5 = Entregado
                var ordens = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes")
                    .Where(p => p.usuarioId == id)
                    .Where(p => p.estadoOrdenId >= 3)  // ✅ MOSTRAR DESDE ESTADO 3
                    .OrderByDescending(p => p.fecha)   // ✅ ORDENAR POR FECHA MÁS RECIENTE
                    .ToList();

                Console.WriteLine($"📦 Usuario {id}: {ordens.Count} órdenes encontradas");

                if (ordens.Count > 0)
                {
                    return Ok(ordens);
                }
                else
                {
                    return Ok(new List<Entidad_Orden>());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al consultar órdenes del usuario: {ex.Message}");
                return StatusCode(500, new { mensaje = "Error al consultar órdenes del usuario", detalle = ex.Message });
            }
        }

        [HttpGet("ConsultarOrden/{token}")]
        public IActionResult Consultartoken(string token)
        {
            try
            {
                var ordens = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes")
                    .Where(p => p.token_orden == token)
                    .FirstOrDefault();

                if (ordens != null)
                {
                    return Ok(ordens);
                }
                else
                {
                    return NotFound(new { mensaje = "Orden no encontrada" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al consultar orden", detalle = ex.Message });
            }
        }

        [HttpPost("Registrar_orden")]
        public IActionResult Registrar([FromBody] Entidad_Orden Orden)
        {
            try
            {
                Console.WriteLine($"📦 Registrando orden para usuario: {Orden.usuarioId}");
                Console.WriteLine($"   Estado de orden: {Orden.estadoOrdenId}");
                Console.WriteLine($"   Total: {Orden.total}");

                var Response = _Helper.Registrar("sp_Registrar_Orden", Orden);

                if (Response)
                {
                    Console.WriteLine("✅ Orden registrada exitosamente");

                    // Buscar items pendientes (estadoItemId == 4)
                    var item = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
                       .Where(p => p.usuarioId == Orden.usuarioId)
                       .Where(p => p.estadoItemId == 4)
                       .ToList();

                    Console.WriteLine($"📦 Items encontrados con estado 4: {item.Count}");

                    // Buscar la orden recién creada (estadoOrdenId == 4)
                    var orden = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes")
                        .Where(p => p.usuarioId == Orden.usuarioId)
                        .Where(p => p.estadoOrdenId == 4)
                        .FirstOrDefault();

                    if (orden != null)
                    {
                        Console.WriteLine($"✅ Orden encontrada: ID {orden.id}");
                        Console.WriteLine($"   Asociando {item.Count} items a la orden...");

                        foreach (var element in item)
                        {
                            element.ordenId = orden.id;
                            _Helper.Actualizar("sp_Actualizar_Item", element);
                            Console.WriteLine($"   ✅ Item {element.id} asociado a orden {orden.id}");
                        }

                        return Ok(new { success = true, ordenId = orden.id, mensaje = "Orden registrada correctamente" });
                    }
                    else
                    {
                        Console.WriteLine("⚠️ No se encontró la orden recién creada");
                        return Ok(new { success = true, mensaje = "Orden registrada pero no se pudieron asociar los items" });
                    }
                }
                else
                {
                    Console.WriteLine("❌ Error al registrar la orden en la base de datos");
                    return BadRequest(new { success = false, mensaje = "No se pudo registrar la orden" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en Registrar orden: {ex.Message}");
                Console.WriteLine($"   Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { success = false, mensaje = "Error interno al registrar orden", detalle = ex.Message });
            }
        }

        [HttpPut("Actualizar_orden")]
        public IActionResult Actualizar([FromBody] Entidad_Orden Orden)
        {
            try
            {
                var Response = _Helper.Actualizar("sp_Actualizar_Orden", Orden);

                if (Response)
                {
                    return Ok(new { success = true, mensaje = "Orden actualizada correctamente" });
                }
                else
                {
                    return BadRequest(new { success = false, mensaje = "No se pudo actualizar la orden" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, mensaje = "Error al actualizar orden", detalle = ex.Message });
            }
        }

        [HttpDelete("Eliminar_orden/{id}")]
        public IActionResult Elimnar(int id)
        {
            try
            {
                var Response = _Helper.Eliminar("sp_Eliminar_Orden", id);

                if (Response)
                {
                    return Ok(new { success = true, mensaje = "Orden eliminada correctamente" });
                }
                else

                {
                    return BadRequest(new { success = false, mensaje = "No se pudo eliminar la orden" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, mensaje = "Error al eliminar orden", detalle = ex.Message });
            }
        }
    }
}