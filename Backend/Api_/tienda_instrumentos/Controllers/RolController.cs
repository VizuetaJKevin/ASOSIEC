using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;

namespace tienda_instrumentos.Controllers
{
    [ApiController]
    public class RolController : Controller
    {
        private readonly negocio _Helper;//Para acceder a los metodos implementados en la capa Negocio
        public RolController(negocio Rol)// constructor 
        {
            this._Helper = Rol;
        }
        // HttpGet=> consultas
        // HttpPost=> Registro
        // HttpPut=> Actualizar
        // HttpDelete=> Eliminar

        [HttpGet("ConsultarRoles")]//url que se usara para hacer las peticiones htpp
        public IActionResult Consultar()
        {
            IActionResult Result = Unauthorized();
            var Roles = _Helper.Consultar<Entidad_Rol>("sp_listar_roles");
            if (Roles.Count > 0)
            {
                Result = Ok(Roles);// devuelve un status 200 y retorna una lista
            }
            else
            {
                Result = NotFound();// devuelve un status 404 
            }
            return Result;
        }
        [HttpPost("Resgitar_Rol")]
        public IActionResult Registrar([FromBody] Entidad_Rol Rol)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Registrar("sp_Registrar_Rol", Rol);
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
        [HttpPut("Actualizar_rol")]
        public IActionResult Actualizar([FromBody] Entidad_Rol Rol)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Actualizar("sp_Actualizar_Rol", Rol);
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

        [HttpDelete("Eliminar_rol/{id}")]
        public IActionResult Elimnar(int id)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Eliminar("sp_Eliminar_Rol", id);
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
