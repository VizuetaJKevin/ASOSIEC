using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entidad
{
    public class Entidad_OrdenConComprobante
    {
        public Entidad_Orden Orden { get; set; }
        public Entidad_ComprobantePago Comprobante { get; set; }
        public Entidad_Usuario Usuario { get; set; }
    }
}