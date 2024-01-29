using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using System.Xml.Linq;

namespace tienda_instrumentos.Controllers
{
    [ApiController]
    public class ItemController : Controller
    {
        private readonly negocio _Helper;  //Para acceder a los metodos implementados en la capa Negocio
        public ItemController(negocio Item) // constructor 
        {
            this._Helper = Item;
        }
        // HttpGet=> consultas
        // HttpPost=> Registro
        // HttpPut=> Actualizar
        // HttpDelete=> Eliminar

        [HttpGet("ConsultarItem")]  //url que se usara para hacer las peticiones htpp
        public IActionResult Consultar()
        {
            IActionResult Result = Unauthorized();
            var item = _Helper.Consultar<Entidad_Item>("sp_listar_Item");
            if (item.Count > 0)
            {
                Result = Ok(item); // devuelve un status 200 y retorna una lista
            }
            else
            {
                Result = Ok();
            }
            return Result;
        }

        [HttpGet("ConsultarItemId/{id}")]  //url que se usara para hacer las peticiones htpp
        public IActionResult ConsultarItemId(int id)
        {
            IActionResult Result = Unauthorized();
            var item = _Helper.elementosCart(id);
            //4 creado
            if (item.Count > 0)
            {
                Result = Ok(item); // devuelve un status 200 y retorna una lista
            }
            else
            {
                Result = Ok();
            }
            return Result;
        }
        [HttpGet("Consultarmisproductosid/{id}")]  //url que se usara para hacer las peticiones htpp
        public IActionResult Consultarmisproductosid(int id)
        {
            IActionResult Result = Unauthorized();
            var item = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
                .Where(p => p.usuarioId == id)
                .Where(p => p.estadoId == 5).ToList();
            //5 comprado
            if (item.Count > 0)
            {
                Result = Ok(item); // devuelve un status 200 y retorna una lista
            }
            else
            {
                Result = Ok();
            }
            return Result;
        }

        [HttpPost("Resgitar_Item")]
        public IActionResult Registrar([FromBody] Entidad_Item Item)
        {
            IActionResult Result = Unauthorized();
            var ordenado = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
               .Where(p => p.usuarioId == Item.usuarioId)
               .Where(p => p.estadoId == 4).Where(p => p.productoId == Item.productoId).FirstOrDefault();
            if (ordenado == null)
            {
                var Response = _Helper.Registrar("sp_Registrar_Item", Item);
                if (Response)
                {
                    Result = Ok(Response); // devuelve un status 200 y retorna una verdadero
                }
                else
                {
                    Result = Ok(false);
                }
            }
            else
            {
                Result = Ok(false);
            }
            return Result;
        }
        [HttpPut("Actualizar_Item")]
        public IActionResult Actualizar([FromBody] Entidad_Item Item)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Actualizar("sp_Actualizar_Item", Item);
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

        [HttpDelete("Eliminar_Item/{id}")]
        public IActionResult Elimnar(int id)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Eliminar("sp_Eliminar_Item", id);
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



        [HttpPut("Actualizar_ItemUserId/{id}/{orderid}")]
        public IActionResult Actualizar_ItemUserId(int id, int orderid)
        {
            IActionResult Result = Unauthorized();
            var item = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
                .Where(p => p.usuarioId == id)
                .Where(p => p.estadoId == 4).ToList();

            if (item.Count != 0)
            {
                var Orden = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes")
                        .Where(p => p.usuarioId == id)
                        .Where(p => p.id == orderid).FirstOrDefault()!;
                Orden.estadoId = 5;
                var ok = _Helper.Actualizar("sp_Actualizar_Orden", Orden);
                if (ok)
                {
                    foreach (var element in item)
                    {
                        element.ordenId = Orden.id;
                        element.estadoId = 5;
                        _Helper.Actualizar("sp_Actualizar_Item", element);
                        Result = Ok(true);
                    }
                }
                else
                {
                    Result = NotFound(Response);
                }
            }
            else
            {
                Result = NotFound(Response);
            }
            return Result;
        }

    }
}
