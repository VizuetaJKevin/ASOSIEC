using Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;


namespace ASOSIEC.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]


    public class DatosBancariosController : Controller
    {
        private readonly negocio _Helper;

        public DatosBancariosController(negocio helper)
        {
            this._Helper = helper;
        }

        // Consultar todos los datos bancarios
        [HttpGet("ConsultarDatosBancarios")]
        public IActionResult ConsultarDatosBancarios()
        {
            IActionResult Result = Unauthorized();
            var datos = _Helper.Consultar<Entidad_DatosBancarios>("sp_Consultar_DatosBancarios");
            if (datos.Count > 0)
            {
                Result = Ok(datos);
            }
            else
            {
                Result = Ok(new List<Entidad_DatosBancarios>());
            }
            return Result;
        }

        // Consultar solo datos bancarios activos (para mostrar al cliente)
        [HttpGet("ConsultarDatosBancariosActivos")]
        public IActionResult ConsultarDatosBancariosActivos()
        {
            IActionResult Result = Unauthorized();
            var datos = _Helper.Consultar<Entidad_DatosBancarios>("sp_Consultar_DatosBancariosActivos");
            if (datos.Count > 0)
            {
                Result = Ok(datos);
            }
            else
            {
                Result = NotFound("No hay datos bancarios activos.");
            }
            return Result;
        }

        // Registrar datos bancarios (solo admin)
        [HttpPost("RegistrarDatosBancarios")]
        public IActionResult RegistrarDatosBancarios([FromBody] Entidad_DatosBancarios datos)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Registrar("sp_Registrar_DatosBancarios", datos);
            if (Response)
            {
                Result = Ok("Datos bancarios registrados correctamente.");
            }
            else
            {
                Result = BadRequest("Error al registrar los datos bancarios.");
            }
            return Result;
        }

        // Actualizar datos bancarios (solo admin)
        [HttpPut("ActualizarDatosBancarios")]
        public IActionResult ActualizarDatosBancarios([FromBody] Entidad_DatosBancarios datos)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Actualizar("sp_Actualizar_DatosBancarios", datos);
            if (Response)
            {
                Result = Ok("Datos bancarios actualizados correctamente.");
            }
            else
            {
                Result = NotFound("Datos bancarios no encontrados.");
            }
            return Result;
        }

        // Eliminar datos bancarios (solo admin)
        [HttpDelete("EliminarDatosBancarios/{id}")]
        public IActionResult EliminarDatosBancarios(int id)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Eliminar("sp_Eliminar_DatosBancarios", id);
            if (Response)
            {
                Result = Ok("Datos bancarios eliminados correctamente.");
            }
            else
            {
                Result = NotFound("Datos bancarios no encontrados.");
            }
            return Result;
        }
    }
}