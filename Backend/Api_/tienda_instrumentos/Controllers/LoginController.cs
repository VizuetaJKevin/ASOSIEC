using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;

namespace tienda_instrumentos.Controllers
{
    [ApiController]
    public class LoginController : Controller
    {
        private readonly negocio _Helper; //Para acceder a los metodos implementados en la capa Negocio
        public LoginController(negocio login) // constructor 
        {
            this._Helper = login;
        }
        // HttpGet=> consultas
        // HttpPost=> Registro
        // HttpPut=> Actualizar
        // HttpDelete=> Eliminar

        [HttpPost("Login")] //url que se usara para hacer las peticiones htpp
        public IActionResult Login([FromBody] Enitdad_Login credenciales)
        {
            IActionResult Result = Unauthorized();
            var usuario = _Helper.Login(credenciales);
            if (usuario.statusok)
            {
                Result = Ok(usuario); // devuelve un status 200
            }
            else
            {
                Result = Ok(false);// devuelve un status 404 
            }
            return Result;
        }

        [HttpGet("Verificarmail/{mail}")] //url que se usara para hacer las peticiones htpp
        public IActionResult Verificarmail(string mail)
        {
            IActionResult Result = Unauthorized();
            var usuario = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuarios").Where(p=>p.email==mail).FirstOrDefault();
            if (usuario!=null)
            {
                Result = Ok(true); 
            }
            else
            {
                Result = Ok(false);
            }
            return Result;
        }
        [HttpPut("recuperarpsw/{mail}/{psw}")] //url que se usara para hacer las peticiones htpp
        public IActionResult recuperarpsw(string mail, string psw)
        {
            IActionResult Result = Unauthorized();
            var usuario = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuarios").Where(p => p.email == mail).FirstOrDefault();
            if (usuario != null)
            {
                usuario.password=psw;
                var Response = _Helper.Actualizar("sp_Actualizar_Usuario", usuario);
                Result = Ok(Response);
            }
            else
            {
                Result = Ok(false);
            }
            return Result;
        }

    }
}
