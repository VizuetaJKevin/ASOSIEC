using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entidad
{
    public class Entidad_DatosBancarios
    {
        public int id { get; set; }
        public string banco { get; set; }
        public string numero_cuenta { get; set; }
        public string tipo_cuenta { get; set; }
        public string titular { get; set; }
        public bool activo { get; set; }
        public DateTime fecha_creacion { get; set; }
    }
}