using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;

namespace tienda_instrumentos.Controllers
{
    [ApiController]
    public class CategoriaProductoController : Controller
    {
        private readonly negocio _Helper;//Para acceder a los metodos implementados en la capa Negocio
        public CategoriaProductoController(negocio CategoriaProducto)// constructor 
        {
            this._Helper = CategoriaProducto;
        }
        // HttpGet=> consultas
        // HttpPost=> Registro
        // HttpPut=> Actualizar
        // HttpDelete=> Eliminar


        [HttpGet("ConsultarCategoriaProducto")]
        public IActionResult Consultar()
        {
            IActionResult result = Unauthorized();
            var categorias = _Helper.Consultar<Entidad_CategoriaProducto>("sp_consultar_categorias_producto");
            if (categorias.Count > 0)
            {
                result = Ok(categorias);
            }
            else
            {
                result = NotFound();
            }
            return result;
        }

        [HttpPost("RegistrarCategoriaProducto")]
        public IActionResult Registrar([FromBody] Entidad_CategoriaProducto categorias)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Registrar("sp_Registrar_CategoriaProducto", categorias);
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

        [HttpPut("ActualizarCategoriaProducto")]
        public IActionResult Actualizar([FromBody] Entidad_CategoriaProducto categoria)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Actualizar("sp_Actualizar_CategoriaProducto", categoria);
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

        [HttpDelete("EliminarCategoriaProducto/{id}")]
        public IActionResult Eliminar(int id)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Eliminar("sp_Eliminar_CategoriaProducto", id);
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