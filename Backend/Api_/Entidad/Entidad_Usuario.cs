namespace Entidad
{
    public class Entidad_Usuario
    {
        public int id { get; set; }
        public int estadoId { get; set; }
        public int companiaId { get; set; }
        public int rolId { get; set; }
        public string nombre { get; set; }
        public string apellido { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public int maxintentos { get; set; }
        public int intentosfallidos { get; set; }
    }
}
