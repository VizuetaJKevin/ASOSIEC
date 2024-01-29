using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;

namespace tienda_instrumentos.Controllers
{
    [ApiController]
    public class ProductoController : Controller
    {
        private readonly negocio _Helper;//Para acceder a los metodos implementados en la capa Negocio
        public ProductoController(negocio Producto)// constructor 
        {
            this._Helper = Producto;

        }


        [HttpGet("ConsultarProducto")]
        public IActionResult Consultar()
        {
            IActionResult result = Unauthorized();
            var productos = _Helper.Consultar<Entidad_Producto>("sp_consultar_productos");
            if (productos.Count > 0)
            {
                result = Ok(productos);
            }
            else
            {
                result = NotFound();
            }
            return result;
        }


        [HttpPost("RegistrarProducto")]
        public IActionResult Registrar([FromBody] Entidad_Producto Producto)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Registrar("sp_Registrar_Producto", Producto);
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


        [HttpPut("ActualizarProducto")]
        public IActionResult Actualizar([FromBody] Entidad_Producto Producto)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Actualizar("sp_Actualizar_Producto", Producto);
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

        [HttpDelete("EliminarProducto/{id}")]
        public IActionResult Eliminar(int id)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Eliminar("sp_Eliminar_Producto", id);
            if (Response)
            {
                Result = Ok(Response); // devuelve un status 200 y retorna una verdadero
            }
            else
            {
                Result = NotFound(Response);// devuelve un status 404 false 
            }
            return Result;
        }
    }
}
