using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;
namespace tienda_instrumentos.Controllers
{
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly negocio _Helper;  //Para acceder a los metodos implementados en la capa Negocio
        public UsuarioController(negocio Usuario) // constructor 
        {
            this._Helper = Usuario; 
        }
        // HttpGet=> consultas
        // HttpPost=> Registro
        // HttpPut=> Actualizar
        // HttpDelete=> Eliminar

        [HttpGet("ConsultarUsuarios")]  //url que se usara para hacer las peticiones htpp
        public IActionResult Consultar()
        {
            IActionResult Result = Unauthorized();
            var usuarios= _Helper.Consultar<Entidad_Usuario>("sp_listar_usuarios");
            if (usuarios.Count>0)
            {
                Result = Ok(usuarios); // devuelve un status 200 y retorna una lista
            }
            else
            {
                Result = NotFound();// devuelve un status 404 
            }
            return Result;
        }
        [HttpPost("Resgitar_usuario")]
        public IActionResult Registrar([FromBody] Entidad_Usuario Usuario)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Registrar("sp_Registrar_Usuario", Usuario);
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
        [HttpPut("Actualizar_usuario")]
        public IActionResult Actualizar([FromBody] Entidad_Usuario Usuario)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Actualizar("sp_Actualizar_Usuario", Usuario);
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
        
        [HttpDelete("Eliminar_usuario/{id}")]
        public IActionResult Elimnar(int id)
        {
            IActionResult Result = Unauthorized();
            var Response = _Helper.Eliminar("sp_Eliminar_Usuario", id);
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
