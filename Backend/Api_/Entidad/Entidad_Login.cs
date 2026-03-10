
namespace Entidad
{
    public class Entidad_Login
    {
        public string email { get; set; }
        public string password { get; set; }

    }
    public class Entidad_Response_Login
    {
        public int id { get; set; }
        public string nombre { get; set; }
        public string apellido { get; set; }
        public string email { get; set; }
        public int rolid { get; set; }
        public bool statusok { get; set; }
        public string mensaje { get; set; }
        public string codigoError { get; set; }
    }
        public class LoginConReCaptchaDTO
    {
        public string email { get; set; }
        public string password { get; set; }
        public string recaptchaToken { get; set; }
    }
}
