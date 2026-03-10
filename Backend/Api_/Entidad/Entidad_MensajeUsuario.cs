using System;

namespace Entidad
{
    public class Entidad_MensajeUsuario
    {
        public int id { get; set; }
        public int remitenteId { get; set; }
        public int destinatarioId { get; set; }
        public string asunto { get; set; }
        public string mensaje { get; set; }
        public bool leido { get; set; }
        public DateTime fechaEnvio { get; set; }
        public string nombreRemitente { get; set; }
        public string emailRemitente { get; set; }
    }
}