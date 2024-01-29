
using DataAccess;
using Entidad;
using System.Collections.Generic;
using System.Linq;

namespace Negocio
{
    public class negocio
    {
        DataAcces DataAcces = new DataAcces(); // variable para acceder a los metodos de la capa DataAccess

        public List<T> Consultar<T>(string comando)
        {
            return DataAcces.Consultar<T>(comando);
        }
        public T ConsultarId<T>(string comando, int id)
        {
            return DataAcces.ConsultarId<T>(comando, id);
        }
        public bool Registrar<T>(string comando, T objeto)
        {
            return DataAcces.Registrar(comando, objeto);
        }
        public bool Actualizar<T>(string comando, T objeto)
        {
            return DataAcces.Actualizar(comando, objeto);
        }
        public bool Eliminar(string comando, int id)
        {
            return DataAcces.Eliminar(comando, id);
        }




        //Login
        public Enitdad_Response_Login Login(Enitdad_Login credenciales) // verifica los datos retorna true o false
        {
            Enitdad_Response_Login response = new Enitdad_Response_Login();
            var usuario = DataAcces.Consultar<Entidad_Usuario>("sp_listar_usuarios")
               .Where(p => p.email == credenciales.email)
               .Where(q => q.password == credenciales.password).FirstOrDefault();
            if (usuario != null)
            {
                response.id = usuario.id;
                response.nombre = usuario.nombre;
                response.apellido = usuario.apellido;
                response.email = usuario.email;
                response.rolid = usuario.rolId;
                response.statusok = true;
            }
            else
            {
                response.statusok = false;
            }

            return response;
        }

        //lista del carrito
        public List<Entidad_carrito> elementosCart(int id)
        {
            List<Entidad_carrito> response = new List<Entidad_carrito>();
            var items = Consultar<Entidad_Item>("sp_consultar_items")
                .Where(p => p.usuarioId == id)
                .Where(p => p.estadoId == 4).ToList();
            foreach (var item in items)
            {
                var producto = ConsultarId<Entidad_Producto>("sp_consultar_productoId", item.productoId);
                var elemet = new Entidad_carrito();
                elemet.id = item.id;
                elemet.descripcion = producto.descripcion;
                elemet.Nombre = producto.nombre_producto;
                elemet.img = producto.url_Img;
                elemet.precio = producto.precio_ahora;
                elemet.stock = producto.stock;
                elemet.Entidad_Item = item;
                response.Add(elemet);
            }
            return response;
        }

    }
}
