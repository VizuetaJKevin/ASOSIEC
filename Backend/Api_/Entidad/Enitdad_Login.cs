
namespace Entidad
{
    public class Enitdad_Login
    {
        public string email { get; set; }
        public string password { get; set; }

    }
    public class Enitdad_Response_Login
    {
        public int id { get; set; }
        public string nombre { get; set; }
        public string apellido { get; set; }
        public string email { get; set; }
        public int rolid { get; set; }
        public bool statusok { get; set; }
    }
}
