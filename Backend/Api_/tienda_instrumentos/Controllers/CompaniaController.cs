using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;

namespace tienda_instrumentos.Controllers
{
    [ApiController]
    public class CompaniaController : Controller
    {
        private readonly negocio _Helper;//Para acceder a los metodos implementados en la capa Negocio
        public CompaniaController(negocio Compania)// constructor 
        {
            this._Helper = Compania;
        }
        // HttpGet=> consultas
        // HttpPost=> Registro
        // HttpPut=> Actualizar
        // HttpDelete=> Eliminar

        [HttpGet("ConsultarCompania")]//url que se usara para hacer las peticiones htpp
        public IActionResult Consultar()
        {
            IActionResult Result = Unauthorized();
            var Compania = _Helper.Consultar<Entidad_compania>("sp_listar_compania");
            if (Compania.Count > 0)
            {
                Result = Ok(Compania);// devuelve un status 200 y retorna una lista
            }
            else
            {
                Result = NotFound();// devuelve un status 404 
            }
            return Result;
        }
        [HttpPost("Resgitar_Compania")]
        public IActionResult Registrar([FromBody] Entidad_compania Compania)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Registrar("sp_Registrar_Compania", Compania);
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

        [HttpPut("Actualizar_Compania")]
        public IActionResult Actualizar([FromBody] Entidad_compania Compania)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Actualizar("sp_Actualizar_Compania", Compania);
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

        [HttpDelete("Eliminar_Compania/{id}")]
        public IActionResult Elimnar(int id)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Eliminar("sp_Eliminar_Compania", id);
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
