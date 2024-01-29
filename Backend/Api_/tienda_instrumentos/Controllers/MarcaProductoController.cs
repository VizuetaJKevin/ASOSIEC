using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;

namespace tienda_instrumentos.Controllers
{
    [ApiController]
    public class MarcaProductoController : Controller
    {
        private readonly negocio _Helper;  //Para acceder a los metodos implementados en la capa Negocio
        public MarcaProductoController(negocio MarcaProducto) // constructor 
        {
            this._Helper = MarcaProducto;
        }
        // HttpGet=> consultas
        // HttpPost=> Registro
        // HttpPut=> Actualizar
        // HttpDelete=> Eliminar

        [HttpGet("ConsultarMarcaProducto")]  //url que se usara para hacer las peticiones htpp
        public IActionResult Consultar()
        {
            IActionResult Result = Unauthorized();
            var MarcaProducto = _Helper.Consultar<Entidad_MarcaProducto>("sp_listar_marcas_producto");
            if (MarcaProducto.Count > 0)
            {
                Result = Ok(MarcaProducto); // devuelve un status 200 y retorna una lista
            }
            else
            {
                Result = NotFound();// devuelve un status 404 
            }
            return Result;
        }
        [HttpPost("Resgitar_MarcaProducto")]
        public IActionResult Registrar([FromBody] Entidad_MarcaProducto MarcaProducto)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Registrar("sp_Registrar_MarcaProducto", MarcaProducto);
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
        [HttpPut("Actualizar_MarcaProducto")]
        public IActionResult Actualizar([FromBody] Entidad_MarcaProducto MarcaProducto)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Actualizar("sp_Actualizar_MarcaProducto", MarcaProducto);
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

        [HttpDelete("Eliminar_MarcaProducto/{id}")]
        public IActionResult Elimnar(int id)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Eliminar("sp_Eliminar_MarcaProducto", id);
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
