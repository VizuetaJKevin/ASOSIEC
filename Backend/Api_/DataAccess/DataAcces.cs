using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Reflection;

namespace DataAccess
{
    public class DataAcces
    {
        //datos para la conexion
        private string conection = "Server=KEVIN;Database=Electrostore;Trusted_Connection=true;Encrypt = False ;";

        //Recibe el comando proc de sql de consulta
        //Retorna un lista del tipo de objeto que devuelva la base de datos
        public List<T> Consultar<T>(string comando)
        {
            SqlConnection connection = new SqlConnection(conection);
            List<T> Lista = new List<T>();
            using (connection)
            {
                SqlCommand cmd = new SqlCommand(comando, connection);
                connection.Open();//abrir conexion 
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    T nuevaEntidad = Activator.CreateInstance<T>(); // Crear una nueva instancia de la entidad
                    Type entityType = typeof(T);
                    foreach (PropertyInfo property in entityType.GetProperties())
                    {
                        string columnName = property.Name;
                        if (reader[columnName] != DBNull.Value)
                        {
                            object value = reader[columnName];
                            property.SetValue(nuevaEntidad, value);// almacenamos la entidad
                        }
                    }
                    Lista.Add(nuevaEntidad);//la guardamos en la lista
                }
            }
            connection.Close();//cerrar conexion 
            return Lista;
        }

        public T ConsultarId<T>(string procedimientoAlmacenado, int id)
        {
            SqlConnection connection = new SqlConnection(conection);
            T entidad = default(T); // Valor predeterminado si no se encuentra ningún resultado
            using (connection)
            {
                SqlCommand cmd = new SqlCommand(procedimientoAlmacenado, connection);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();

                SqlDataReader reader = cmd.ExecuteReader();
                if (reader.Read()) // Verificar si hay resultados
                {
                    entidad = Activator.CreateInstance<T>(); // Crear una nueva instancia de la entidad
                    Type entityType = typeof(T);
                    foreach (PropertyInfo property in entityType.GetProperties())
                    {
                        string columnName = property.Name;
                        if (reader[columnName] != DBNull.Value)
                        {
                            object value = reader[columnName];
                            property.SetValue(entidad, value); // Almacenar la entidad
                        }
                    }
                }
            }
            connection.Close();
            return entidad;
        }
        public bool Registrar<T>(string comando, T entidad)
        {
            SqlConnection connection = new SqlConnection(conection);
            bool response = false;
            using (connection)
            {
                SqlCommand cmd = new SqlCommand(comando, connection);
                cmd.CommandType = CommandType.StoredProcedure;
                PropertyInfo[] propiedades = typeof(T).GetProperties(); //recorremos la entidad que se recibe
                foreach (PropertyInfo propiedad in propiedades)
                {
                    string nombreParametro = "@" + propiedad.Name; // guardamos el nombre del atributo +@
                    object valor = propiedad.GetValue(entidad); // leemos su valor
                    if (propiedad.Name != "id") //en este metodo no se necesita id
                    {
                        cmd.Parameters.AddWithValue(nombreParametro, valor);
                    }
                }
                cmd.Parameters.Add("@accion", SqlDbType.Bit).Value = 0;
                cmd.Parameters["@accion"].Direction = ParameterDirection.InputOutput;
                connection.Open();// se abre la conexion
                cmd.ExecuteNonQuery();//se envía la consulta
                response = Convert.ToBoolean(cmd.Parameters["@accion"].Value); // devuelve un true si todo es correcto
                connection.Close();
            }
            return response;
        }
        public bool Actualizar<T>(string comando, T entidad)
        {
            SqlConnection connection = new SqlConnection(conection);
            bool response = false;
            using (connection)
            {
                SqlCommand cmd = new SqlCommand(comando, connection);
                cmd.CommandType = CommandType.StoredProcedure;
                PropertyInfo[] propiedades = typeof(T).GetProperties(); //recorremos la entidad que se recibe
                foreach (PropertyInfo propiedad in propiedades)
                {
                    string nombreParametro = "@" + propiedad.Name; // guardamos el nombre del atributo +@
                    object valor = propiedad.GetValue(entidad); // leemos su valor
                    cmd.Parameters.AddWithValue(nombreParametro, valor);
                }
                cmd.Parameters.Add("@accion", SqlDbType.Bit).Value = 0;
                cmd.Parameters["@accion"].Direction = ParameterDirection.InputOutput;
                connection.Open();// se abre la conexion
                cmd.ExecuteNonQuery();//se envía la consulta
                response = Convert.ToBoolean(cmd.Parameters["@accion"].Value); // devuelve un true si todo es correcto
                connection.Close();
            }
            return response;
        }
        public bool Eliminar(string comando, int id)
        {
            SqlConnection connection = new SqlConnection(conection);
            bool response = false;
            using (connection)
            {
                SqlCommand cmd = new SqlCommand(comando, connection);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.Add("@accion", SqlDbType.Bit).Value = 0;
                cmd.Parameters["@accion"].Direction = ParameterDirection.InputOutput;
                connection.Open();// se abre la conexion
                cmd.ExecuteNonQuery();//se envía la consulta
                response = Convert.ToBoolean(cmd.Parameters["@accion"].Value); // devuelve un true si todo es correcto
                connection.Close();
            }
            return response;
        }
    }
}
