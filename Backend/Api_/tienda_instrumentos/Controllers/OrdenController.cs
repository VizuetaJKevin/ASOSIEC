using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;

namespace tienda_instrumentos.Controllers
{
    [ApiController]
    public class OrdenController : Controller
    {
        private readonly negocio _Helper;  //Para acceder a los metodos implementados en la capa Negocio
        public OrdenController(negocio Orden) // constructor 
        {
            this._Helper = Orden;
        }
        // HttpGet=> consultas
        // HttpPost=> Registro
        // HttpPut=> Actualizar
        // HttpDelete=> Eliminar

        [HttpGet("ConsultarOrdenes")]  //url que se usara para hacer las peticiones htpp
        public IActionResult Consultar()
        {
            IActionResult Result = Unauthorized();
            var ordens = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes");
            if (ordens.Count > 0)
            {
                Result = Ok(ordens); // devuelve un status 200 y retorna una lista
            }
            else
            {
                Result = NotFound();// devuelve un status 404 
            }
            return Result;
        }
        [HttpGet("ConsultarOrdenUserId/{id}")]  //url que se usara para hacer las peticiones htpp
        public IActionResult ConsultarOrdenUserId(int id)
        {
            IActionResult Result = Unauthorized();
            var ordens = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes")
                .Where(p=>p.usuarioId==id).Where(P=>P.estadoId==5).ToList();
            if (ordens.Count > 0)
            {
                Result = Ok(ordens); // devuelve un status 200 y retorna una lista
            }
            else
            {
                Result = Ok();
            }
            return Result;
        }

        [HttpGet("ConsultarOrden/{token}")]  //url que se usara para hacer las peticiones htpp
        public IActionResult Consultartoken(string token)
        {
            IActionResult Result = Unauthorized();
            var ordens = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes").Where(p=>p.token_orden==token)
                .FirstOrDefault();
            if (ordens!=null)
            {
                Result = Ok(ordens); // devuelve un status 200 y retorna una lista
            }
            else
            {
                Result = NotFound();// devuelve un status 404 
            }
            return Result;
        }

        [HttpPost("Resgitar_orden")]
        public IActionResult Registrar([FromBody] Entidad_Orden Orden)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Registrar("sp_Registrar_Orden", Orden);
            if (Response)
            {
                var item = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
               .Where(p => p.usuarioId == Orden.usuarioId)
               .Where(p => p.estadoId == 4).ToList();
                var orden = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes").
                    Where(p => p.usuarioId == Orden.usuarioId)
                    .Where(p => p.estadoId == 4).FirstOrDefault();
               if (orden!=null)
                {
                    foreach (var element in item)
                    {
                        element.ordenId = orden.id;
                        _Helper.Actualizar("sp_Actualizar_Item", element);
                    }
                    Result = Ok(Response);
                }
            }
            else
            {
                Result = NotFound(Response);// devuelve un status 404 
            }
            return Result;
        }
        [HttpPut("Actualizar_orden")]
        public IActionResult Actualizar([FromBody] Entidad_Orden Orden)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Actualizar("sp_Actualizar_Orden", Orden);
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

        [HttpDelete("Eliminar_orden/{id}")]
        public IActionResult Elimnar(int id)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Eliminar("sp_Eliminar_Orden", id);
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
