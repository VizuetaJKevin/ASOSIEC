using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;

namespace tienda_instrumentos.Controllers
{
    [ApiController]
    public class EstadoController : Controller
    {
        private readonly negocio _Helper;//Para acceder a los metodos implementados en la capa Negocio
        public EstadoController(negocio Estado)// constructor 
        {
            this._Helper = Estado;
        }
        // HttpGet=> consultas
        // HttpPost=> Registro
        // HttpPut=> Actualizar
        // HttpDelete=> Eliminar

        [HttpGet("ConsultarEstados")]//url que se usara para hacer las peticiones htpp
        public IActionResult Consultar()
        {
            IActionResult Result = Unauthorized();
            var Estados = _Helper.Consultar<Entidad_Estado>("sp_listar_estados");
            if (Estados.Count > 0)
            {
                Result = Ok(Estados);// devuelve un status 200 y retorna una lista
            }
            else
            {
                Result = NotFound();// devuelve un status 404 
            }
            return Result;
        }
        [HttpPost("Resgitar_Estado")]
        public IActionResult Registrar([FromBody] Entidad_Estado Estado)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Registrar("sp_Registrar_Estado", Estado);
            if (Response)
            {
                Result = Ok(Response); // devuelve un status 200 y retorna una verdadero
            }
            else
            {
                Result = NotFound(Response);// devuelve un status 404 
            }
            return Result;
        }

        [HttpPut("Actualizar_Estado")]
        public IActionResult Actualizar([FromBody] Entidad_Estado Estado)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Actualizar("sp_Actualizar_Estado", Estado);
            if (Response)
            {
                Result = Ok(Response);
            }
            else
            {
                Result = NotFound(Response);
            }
            return Result;
        }

        [HttpDelete("Eliminar_Estado/{id}")]
        public IActionResult Elimnar(int id)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Eliminar("sp_Eliminar_Estado", id);
            if (Response)
            {
                Result = Ok(Response);
            }
            else
            {
                Result = NotFound(Response);
            }
            return Result;
        }
    }
}
