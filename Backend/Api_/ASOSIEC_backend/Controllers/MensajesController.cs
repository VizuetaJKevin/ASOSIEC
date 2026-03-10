using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DataAccess;
using Entidad;

namespace ASOSIEC_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MensajesController : ControllerBase
    {
        [HttpPost("enviar")]
        public IActionResult EnviarMensaje([FromBody] Entidad_MensajeUsuario mensaje)
        {
            try
            {
                new DataAcces().Ejecutar("sp_Enviar_Mensaje", mensaje);
                return Ok(new { message = "Mensaje enviado" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error", error = ex.Message });
            }
        }

        [HttpGet("{usuarioId}")]
        public IActionResult ObtenerMensajes(int usuarioId)
        {
            try
            {
                var mensajes = new DataAcces().Consultar<Entidad_MensajeUsuario>("EXEC sp_Obtener_Mensajes_Usuario @usuarioId=" + usuarioId);
                return Ok(mensajes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error", error = ex.Message });
            }
        }

        [HttpPut("marcar-leido/{mensajeId}")]
        public IActionResult MarcarComoLeido(int mensajeId)
        {
            try
            {
                new DataAcces().Ejecutar("sp_Marcar_Mensaje_Leido", new { mensajeId = mensajeId });
                return Ok(new { message = "Marcado como leído" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error", error = ex.Message });
            }
        }

        [HttpDelete("{mensajeId}")]
        public IActionResult EliminarMensaje(int mensajeId)
        {
            try
            {
                new DataAcces().Ejecutar("sp_Eliminar_Mensaje", new { mensajeId = mensajeId });
                return Ok(new { message = "Mensaje eliminado" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error", error = ex.Message });
            }
        }
    }
}