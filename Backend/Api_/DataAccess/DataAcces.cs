using BCrypt.Net;
using Entidad;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Reflection;

namespace DataAccess
{
    public class DataAcces
    {
        // CAMBIO: Conexion ya no está hardcodeada
        private static string _connectionString;

        /// <summary>
        /// Configura la cadena de conexion desde appsettings.json
        /// </summary>
        public static void ConfigurarConexion(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            Console.WriteLine($"🔌 Conexion configurada: {_connectionString}");
        }

        // Constructor que usa la conexion configurada
        private string conection => _connectionString ?? "Server=KEVIN;Database=ASOSIEC;Trusted_Connection=true;Encrypt=False;";
        public string GetConnectionString()
        {
            return conection;
        }

        // ============================================
        // MÉTODOS DE SEGURIDAD - CONTRASEÑAS
        // ============================================

        /// <summary>
        /// Hash de contraseña usando BCrypt
        /// </summary>
        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
        }

        /// <summary>
        /// Verifica si una contraseña coincide con el hash
        /// </summary>
        public static bool VerifyPassword(string password, string passwordHash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, passwordHash);
            }
            catch
            {
                return false;
            }
        }

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
                            property.SetValue(entidad, value);
                        }
                    }
                }
                connection.Close();
            }
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

                PropertyInfo[] propiedades = typeof(T).GetProperties();

                // SOLUCIÓN: EXCLUIR campos autogenerados, de control Y motivo_rechazo

                // EXCLUIR campos que NO están en sp_Registrar_Usuario
                var propiedadesExcluidas = new HashSet<string>
{
                    // Campos autogenerados por la BD
                    "id",
                    "fecha_subida",
                    "verificado",
                    "fecha_verificacion",
                    "verificado_por",
                    "fecha_registro",
                    "companiaId",
                    "motivo_rechazo",
    
                    // CAMPOS QUE NO ESTÁN EN sp_Registrar_Usuario:
                    "telefono",
                    "fotoPerfil",
                    "twitter",
                    "instagram",
                    "facebook",
                    "aprobado",
                    "fecha_aprobacion",
                    "aprobado_por",
                    "direccion",            // NUEVO: Excluir direccion en registro
                    "bloqueado_hasta",      // NUEVO: Excluir campos de bloqueo
                    "fecha_ultimo_intento"  // NUEVO: Excluir campos de bloqueo           
                };

                foreach (PropertyInfo propiedad in propiedades)
                {
                    // Saltar propiedades excluidas
                    if (propiedadesExcluidas.Contains(propiedad.Name))
                    {
                        continue;
                    }

                    string nombreParametro = "@" + propiedad.Name;
                    object valor = propiedad.GetValue(entidad);

                    // HASH DE CONTRASEÑA: Si la propiedad se llama "password", hashearla
                    if (propiedad.Name.Equals("password", StringComparison.OrdinalIgnoreCase) && valor != null)
                    {
                        string password = valor.ToString();
                        // Solo hashear si no está ya hasheada (BCrypt hashes empiezan con $2)
                        if (!password.StartsWith("$2"))
                        {
                            valor = HashPassword(password);
                            Console.WriteLine($"🔒 Contraseña hasheada para registro");
                        }
                    }

                    // Convertir valores null o vacíos a cadenas vacías
                    if (valor == null && propiedad.PropertyType == typeof(string))
                    {
                        valor = "";
                    }

                    cmd.Parameters.AddWithValue(nombreParametro, valor ?? DBNull.Value);
                }

                cmd.Parameters.Add("@accion", SqlDbType.Bit).Value = 0;
                cmd.Parameters["@accion"].Direction = ParameterDirection.InputOutput;

                connection.Open();

                try
                {
                    cmd.ExecuteNonQuery();
                    response = Convert.ToBoolean(cmd.Parameters["@accion"].Value);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error en Registrar: {ex.Message}");
                    throw;
                }

                connection.Close();
            }
            return response;
        }

        public bool EliminarOrdenesPorUsuario(string comando, int usuarioId)
        {
            SqlConnection connection = new SqlConnection(conection);
            bool response = false;
            using (connection)
            {
                SqlCommand cmd = new SqlCommand(comando, connection);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@usuarioId", usuarioId);
                connection.Open();
                cmd.ExecuteNonQuery();
                response = true;
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

                PropertyInfo[] propiedades = typeof(T).GetProperties();

                // EXCLUIR campos autogenerados Y de aprobacion
                var propiedadesExcluidas = new HashSet<string>
                {
                    "fecha_subida",
                    "verificado",
                    "fecha_verificacion",
                    "verificado_por",
                    "fecha_registro",
                    "aprobado",
                    "fecha_aprobacion",
                    "aprobado_por",
                    "direccion",            // NUEVO: Excluir direccion en registro
                    "bloqueado_hasta",      // NUEVO: Excluir campos de bloqueo
                    "fecha_ultimo_intento",  // NUEVO: Excluir campos de bloqueo,
                    "companiaId",
                    "motivo_rechazo"  // TAMBIÉN excluir en actualizar
                };

                foreach (PropertyInfo propiedad in propiedades)
                {
                    // Saltar propiedades excluidas
                    if (propiedadesExcluidas.Contains(propiedad.Name))
                    {
                        continue;
                    }

                    string nombreParametro = "@" + propiedad.Name;
                    object valor = propiedad.GetValue(entidad);

                    // HASH DE CONTRASEÑA en actualizaciones
                    if (propiedad.Name.Equals("password", StringComparison.OrdinalIgnoreCase) && valor != null)
                    {
                        string password = valor.ToString();
                        // Solo hashear si no está ya hasheada
                        if (!password.StartsWith("$2"))
                        {
                            valor = HashPassword(password);
                            Console.WriteLine($"🔒 Contraseña hasheada para actualización");
                        }
                    }

                    // Convertir valores null o vacíos a cadenas vacías
                    if (valor == null && propiedad.PropertyType == typeof(string))
                    {
                        valor = "";
                    }

                    cmd.Parameters.AddWithValue(nombreParametro, valor ?? DBNull.Value);
                }

                cmd.Parameters.Add("@accion", SqlDbType.Bit).Value = 0;
                cmd.Parameters["@accion"].Direction = ParameterDirection.InputOutput;

                connection.Open();

                try
                {
                    cmd.ExecuteNonQuery();
                    response = Convert.ToBoolean(cmd.Parameters["@accion"].Value);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error en Actualizar: {ex.Message}");
                    throw;
                }

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

                connection.Open();

                cmd.ExecuteNonQuery();
                response = Convert.ToBoolean(cmd.Parameters["@accion"].Value);

                connection.Close();
            }
            return response;
        }

        /// <summary>
        /// Ejecuta un procedimiento almacenado con parámetros desde un objeto anonimo.
        /// Retorna la cantidad de filas afectadas.
        /// Uso: Ejecutar("sp_Nombre", new { param1 = valor1, param2 = valor2 })
        /// </summary>
        public int Ejecutar(string procedimientoAlmacenado, object parametros = null)
        {
            SqlConnection connection = new SqlConnection(conection);
            int filasAfectadas = 0;

            using (connection)
            {
                SqlCommand cmd = new SqlCommand(procedimientoAlmacenado, connection);
                cmd.CommandType = CommandType.StoredProcedure;

                // Agregar parámetros dinámicamente desde el objeto anonimo
                if (parametros != null)
                {
                    foreach (PropertyInfo prop in parametros.GetType().GetProperties())
                    {
                        cmd.Parameters.AddWithValue("@" + prop.Name, prop.GetValue(parametros) ?? DBNull.Value);
                    }
                }

                connection.Open();

                try
                {
                    filasAfectadas = cmd.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error en Ejecutar ({procedimientoAlmacenado}): {ex.Message}");
                    throw;
                }

                connection.Close();
            }

            return filasAfectadas;
        }

        // ============================================
        // ✅ NUEVO MÉTODO PARA APROBAR/RECHAZAR PRODUCTOS
        // ============================================

        /// <summary>
        /// Ejecuta un procedimiento almacenado con parámetros y parámetro de salida @accion.
        /// Diseñado para sp_Aprobar_Producto y sp_Rechazar_Producto que tienen @accion BIT OUTPUT
        /// Uso: RegistrarConProcedimiento("sp_Aprobar_Producto", new { productoId = 1, adminId = 5 })
        /// </summary>
        public bool RegistrarConProcedimiento(string procedimientoAlmacenado, object parametros)
        {
            SqlConnection connection = new SqlConnection(conection);
            bool response = false;

            using (connection)
            {
                SqlCommand cmd = new SqlCommand(procedimientoAlmacenado, connection);
                cmd.CommandType = CommandType.StoredProcedure;

                // Agregar parámetros dinámicamente desde el objeto anónimo
                if (parametros != null)
                {
                    foreach (PropertyInfo prop in parametros.GetType().GetProperties())
                    {
                        cmd.Parameters.AddWithValue("@" + prop.Name, prop.GetValue(parametros) ?? DBNull.Value);
                    }
                }

                // ✅ AGREGAR PARÁMETRO DE SALIDA @accion
                cmd.Parameters.Add("@accion", SqlDbType.Bit).Value = 0;
                cmd.Parameters["@accion"].Direction = ParameterDirection.InputOutput;

                connection.Open();

                try
                {
                    cmd.ExecuteNonQuery();
                    response = Convert.ToBoolean(cmd.Parameters["@accion"].Value);

                    Console.WriteLine($"✅ {procedimientoAlmacenado} ejecutado: @accion = {response}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error en RegistrarConProcedimiento ({procedimientoAlmacenado}): {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    throw;
                }

                connection.Close();
            }

            return response;
        }

        // ============================================
        // MÉTODOS ESPECÍFICOS PARA CONSULTAS CON PARÁMETROS
        // ============================================

        /// <summary>
        /// Consulta datos con parámetros personalizados (para SPs que requieren parámetros específicos)
        /// </summary>
        public T ConsultarConParametros<T>(string procedimientoAlmacenado, object parametros)
        {
            SqlConnection connection = new SqlConnection(conection);
            T entidad = default(T);

            using (connection)
            {
                SqlCommand cmd = new SqlCommand(procedimientoAlmacenado, connection);
                cmd.CommandType = CommandType.StoredProcedure;

                // Agregar parámetros dinámicamente desde el objeto anonimo
                if (parametros != null)
                {
                    foreach (PropertyInfo prop in parametros.GetType().GetProperties())
                    {
                        cmd.Parameters.AddWithValue("@" + prop.Name, prop.GetValue(parametros) ?? DBNull.Value);
                    }
                }

                connection.Open();

                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    entidad = Activator.CreateInstance<T>();
                    Type entityType = typeof(T);

                    foreach (PropertyInfo property in entityType.GetProperties())
                    {
                        string columnName = property.Name;

                        // Verificar si la columna existe en el resultado
                        try
                        {
                            int ordinal = reader.GetOrdinal(columnName);
                            if (!reader.IsDBNull(ordinal))
                            {
                                object value = reader[columnName];
                                property.SetValue(entidad, value);
                            }
                        }
                        catch (IndexOutOfRangeException)
                        {
                            // La columna no existe en el resultado, continuar
                            continue;
                        }
                    }
                }

                connection.Close();
            }

            return entidad;
        }

        public T ConsultarConParametro<T>(string comando, string nombreParametro, int valorParametro)
        {
            SqlConnection connection = new SqlConnection(conection);
            T entidad = default(T);
            using (connection)
            {
                SqlCommand cmd = new SqlCommand(comando, connection);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue(nombreParametro, valorParametro);

                connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    entidad = Activator.CreateInstance<T>();
                    Type entityType = typeof(T);
                    foreach (PropertyInfo property in entityType.GetProperties())
                    {
                        string columnName = property.Name;
                        if (reader[columnName] != DBNull.Value)
                        {
                            object value = reader[columnName];
                            property.SetValue(entidad, value);
                        }
                    }
                }
                connection.Close();
            }
            return entidad;
        }

        // ============================================
        // MÉTODOS ESPECÍFICOS PARA COMPROBANTES
        // ============================================

        public bool VerificarComprobante(int id, int verificadoPor)
        {
            SqlConnection connection = new SqlConnection(conection);
            bool response = false;

            using (connection)
            {
                SqlCommand cmd = new SqlCommand("sp_Verificar_ComprobantePago", connection);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@verificado_por", verificadoPor);
                cmd.Parameters.Add("@accion", SqlDbType.Bit).Value = 0;
                cmd.Parameters["@accion"].Direction = ParameterDirection.InputOutput;

                connection.Open();
                cmd.ExecuteNonQuery();
                response = Convert.ToBoolean(cmd.Parameters["@accion"].Value);
                connection.Close();
            }

            return response;
        }

        public bool RechazarComprobante(int id, int verificadoPor, string motivoRechazo = "")
        {
            SqlConnection connection = new SqlConnection(conection);
            bool response = false;

            using (connection)
            {
                SqlCommand cmd = new SqlCommand("sp_Rechazar_ComprobantePago", connection);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@verificado_por", verificadoPor);
                cmd.Parameters.AddWithValue("@motivo_rechazo", motivoRechazo ?? "");
                cmd.Parameters.Add("@accion", SqlDbType.Bit).Value = 0;
                cmd.Parameters["@accion"].Direction = ParameterDirection.InputOutput;

                connection.Open();
                cmd.ExecuteNonQuery();
                response = Convert.ToBoolean(cmd.Parameters["@accion"].Value);
                connection.Close();
            }

            return response;
        }

        public Entidad_ComprobantePago ConsultarComprobantePorOrden(int ordenId)
        {
            SqlConnection connection = new SqlConnection(conection);
            Entidad_ComprobantePago comprobante = null;

            using (connection)
            {
                SqlCommand cmd = new SqlCommand("sp_Consultar_ComprobantePorOrden", connection);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ordenId", ordenId);

                connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    comprobante = new Entidad_ComprobantePago
                    {
                        id = reader.GetInt32(reader.GetOrdinal("id")),
                        ordenId = reader.GetInt32(reader.GetOrdinal("ordenId")),
                        url_comprobante = reader.IsDBNull(reader.GetOrdinal("url_comprobante"))
                            ? ""
                            : reader.GetString(reader.GetOrdinal("url_comprobante")),
                        numero_referencia = reader.IsDBNull(reader.GetOrdinal("numero_referencia"))
                            ? ""
                            : reader.GetString(reader.GetOrdinal("numero_referencia")),
                        direccion_entrega = reader.GetString(reader.GetOrdinal("direccion_entrega")),
                        telefono_contacto = reader.IsDBNull(reader.GetOrdinal("telefono_contacto"))
                            ? ""
                            : reader.GetString(reader.GetOrdinal("telefono_contacto")),
                        observaciones = reader.IsDBNull(reader.GetOrdinal("observaciones"))
                            ? ""
                            : reader.GetString(reader.GetOrdinal("observaciones")),
                        fecha_subida = reader.GetDateTime(reader.GetOrdinal("fecha_subida")),
                        verificado = reader.GetBoolean(reader.GetOrdinal("verificado")),
                        fecha_verificacion = reader.IsDBNull(reader.GetOrdinal("fecha_verificacion"))
                            ? (DateTime?)null
                            : reader.GetDateTime(reader.GetOrdinal("fecha_verificacion")),
                        verificado_por = reader.IsDBNull(reader.GetOrdinal("verificado_por"))
                            ? (int?)null
                            : reader.GetInt32(reader.GetOrdinal("verificado_por")),
                        motivo_rechazo = reader.IsDBNull(reader.GetOrdinal("motivo_rechazo"))
                            ? ""
                            : reader.GetString(reader.GetOrdinal("motivo_rechazo"))
                    };
                }

                connection.Close();
            }

            return comprobante;
        }

        // ============================================
        // MÉTODOS PARA REDUCIR STOCK
        // ============================================

        public bool ReducirStockPorOrden(int ordenId)
        {
            SqlConnection connection = new SqlConnection(conection);
            bool response = false;

            using (connection)
            {
                SqlCommand cmd = new SqlCommand(@"
                    UPDATE p
                    SET p.stock = p.stock - i.cantidad
                    FROM producto p
                    INNER JOIN Items i ON i.productoId = p.id
                    WHERE i.ordenId = @ordenId
                    AND p.stock >= i.cantidad
                ", connection);

                cmd.Parameters.AddWithValue("@ordenId", ordenId);

                connection.Open();
                int filasAfectadas = cmd.ExecuteNonQuery();
                response = filasAfectadas > 0;
                connection.Close();

                Console.WriteLine($"Stock reducido para {filasAfectadas} productos de la orden {ordenId}");
            }

            return response;
        }

        // ============================================
        // MÉTODOS PARA USUARIOS/VENDEDORES
        // ============================================

        public bool AprobarUsuario(int usuarioId, int adminId)
        {
            SqlConnection connection = new SqlConnection(conection);
            bool response = false;

            using (connection)
            {
                SqlCommand cmd = new SqlCommand("sp_Aprobar_Usuario", connection);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@usuarioId", usuarioId);
                cmd.Parameters.AddWithValue("@adminId", adminId);
                cmd.Parameters.Add("@accion", SqlDbType.Bit).Value = 0;
                cmd.Parameters["@accion"].Direction = ParameterDirection.InputOutput;

                connection.Open();
                cmd.ExecuteNonQuery();
                response = Convert.ToBoolean(cmd.Parameters["@accion"].Value);
                connection.Close();
            }

            return response;
        }

        public bool RechazarUsuario(int usuarioId, int adminId)
        {
            SqlConnection connection = new SqlConnection(conection);
            bool response = false;

            using (connection)
            {
                SqlCommand cmd = new SqlCommand("sp_Rechazar_Usuario", connection);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@usuarioId", usuarioId);
                cmd.Parameters.AddWithValue("@adminId", adminId);
                cmd.Parameters.Add("@accion", SqlDbType.Bit).Value = 0;
                cmd.Parameters["@accion"].Direction = ParameterDirection.InputOutput;

                connection.Open();
                cmd.ExecuteNonQuery();
                response = Convert.ToBoolean(cmd.Parameters["@accion"].Value);
                connection.Close();
            }

            return response;
        }

        /// <summary>
        /// Registra una devolución y retorna el ID generado o código de error
        /// </summary>
        public int RegistrarDevolucionConRetorno(string comando, object parametros)
        {
            SqlConnection connection = new SqlConnection(conection);
            int devolucionId = 0;

            using (connection)
            {
                SqlCommand cmd = new SqlCommand(comando, connection);
                cmd.CommandType = CommandType.StoredProcedure;

                // Agregar parámetros dinámicamente
                foreach (var prop in parametros.GetType().GetProperties())
                {
                    cmd.Parameters.AddWithValue("@" + prop.Name, prop.GetValue(parametros) ?? DBNull.Value);
                }

                // Parámetros de salida
                var accionParam = new SqlParameter("@accion", SqlDbType.Bit) { Direction = ParameterDirection.Output };
                var devolucionIdParam = new SqlParameter("@devolucion_id", SqlDbType.Int) { Direction = ParameterDirection.Output };

                cmd.Parameters.Add(accionParam);
                cmd.Parameters.Add(devolucionIdParam);

                connection.Open();
                cmd.ExecuteNonQuery();
                connection.Close();

                devolucionId = devolucionIdParam.Value != DBNull.Value
                    ? Convert.ToInt32(devolucionIdParam.Value)
                    : 0;

                return devolucionId;
            }
        }

        /// <summary>
        /// Verifica si se puede devolver una orden (retorna objeto con puede_devolver y motivo)
        /// </summary>
        public dynamic VerificarPuedeDevolver(string comando, object parametros)
        {
            SqlConnection connection = new SqlConnection(conection);

            using (connection)
            {
                SqlCommand cmd = new SqlCommand(comando, connection);
                cmd.CommandType = CommandType.StoredProcedure;

                // Agregar parámetros dinámicamente
                foreach (var prop in parametros.GetType().GetProperties())
                {
                    cmd.Parameters.AddWithValue("@" + prop.Name, prop.GetValue(parametros) ?? DBNull.Value);
                }

                // Parámetros de salida
                var puedeParam = new SqlParameter("@puede_devolver", SqlDbType.Bit) { Direction = ParameterDirection.Output };
                var motivoParam = new SqlParameter("@motivo_no_puede", SqlDbType.VarChar, 200) { Direction = ParameterDirection.Output };

                cmd.Parameters.Add(puedeParam);
                cmd.Parameters.Add(motivoParam);

                connection.Open();
                cmd.ExecuteNonQuery();
                connection.Close();

                return new
                {
                    puede_devolver = puedeParam.Value != DBNull.Value ? Convert.ToBoolean(puedeParam.Value) : false,
                    motivo_no_puede = motivoParam.Value != DBNull.Value ? motivoParam.Value.ToString() : null
                };
            }
        }

    }
}