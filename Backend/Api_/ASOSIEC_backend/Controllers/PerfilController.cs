using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using DataAccess; // ✅ AGREGADO: Para usar DataAcces.HashPassword

namespace ASOSIEC.Controllers
{
    [ApiController]
    [Route("api/perfil")]
    public class PerfilController : ControllerBase
    {
        private readonly negocio _Helper;
        private readonly string _connectionString;

        public PerfilController(negocio helper, IConfiguration configuration)
        {
            this._Helper = helper;
            this._connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        // ============================================
        // GET: api/perfil/{usuarioId}
        // Obtener perfil completo del usuario
        // ============================================
        [HttpGet("{usuarioId}")]
        public IActionResult ObtenerPerfil(int usuarioId)
        {
            try
            {
                Console.WriteLine($"👤 Obteniendo perfil para usuario {usuarioId}");

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("sp_Obtener_Perfil", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@usuarioId", usuarioId);

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                var perfil = new
                                {
                                    id = reader.GetInt32(reader.GetOrdinal("id")),
                                    estadoUsuarioId = reader.GetInt32(reader.GetOrdinal("estadoUsuarioId")),
                                    rolId = reader.GetInt32(reader.GetOrdinal("rolId")),
                                    nombre = reader.GetString(reader.GetOrdinal("nombre")),
                                    apellido = reader.GetString(reader.GetOrdinal("apellido")),
                                    email = reader.GetString(reader.GetOrdinal("email")),
                                    telefono = reader.IsDBNull(reader.GetOrdinal("telefono")) ? null : reader.GetString(reader.GetOrdinal("telefono")),
                                    direccion = reader.IsDBNull(reader.GetOrdinal("direccion")) ? null : reader.GetString(reader.GetOrdinal("direccion")),
                                    fotoPerfil = reader.IsDBNull(reader.GetOrdinal("fotoPerfil")) ? null : reader.GetString(reader.GetOrdinal("fotoPerfil"))
                                };

                                Console.WriteLine($"✅ Perfil obtenido - Dirección: {perfil.direccion ?? "NULL"}");
                                return Ok(perfil);
                            }
                            else
                            {
                                Console.WriteLine($"❌ Usuario {usuarioId} no encontrado");
                                return NotFound(new
                                {
                                    success = false,
                                    mensaje = "Usuario no encontrado"
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al obtener perfil: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al obtener el perfil del usuario",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // GET: api/perfil/estadisticas/{usuarioId}
        // Obtener estadísticas de compras del usuario
        // ============================================
        [HttpGet("estadisticas/{usuarioId}")]
        public IActionResult ObtenerEstadisticas(int usuarioId)
        {
            try
            {
                Console.WriteLine($"📊 Obteniendo estadísticas para usuario {usuarioId}");

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("sp_Obtener_Estadisticas_Usuario", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@usuarioId", usuarioId);

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            var estadisticas = new Entidad_EstadisticasUsuario
                            {
                                comprasPorMes = new List<ComprasPorMes>()
                            };

                            // Primer resultado: Resumen general
                            if (reader.Read())
                            {
                                estadisticas.productosComprados7Dias = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);
                                estadisticas.totalGastado = reader.IsDBNull(1) ? 0 : reader.GetDecimal(1);
                            }

                            // Segundo resultado: Compras por mes
                            if (reader.NextResult())
                            {
                                while (reader.Read())
                                {
                                    estadisticas.comprasPorMes.Add(new ComprasPorMes
                                    {
                                        mes = reader.IsDBNull(0) ? "" : reader.GetString(0),
                                        cantidad = reader.IsDBNull(1) ? 0 : reader.GetInt32(1),
                                        monto = reader.IsDBNull(2) ? 0 : reader.GetDecimal(2)
                                    });
                                }
                            }

                            Console.WriteLine($"✅ Estadísticas obtenidas: {estadisticas.productosComprados7Dias} productos, ${estadisticas.totalGastado} gastado");

                            return Ok(estadisticas);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al obtener estadísticas: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al obtener estadísticas del usuario",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // PUT: api/perfil/foto/{usuarioId}
        // Actualizar URL de foto de perfil
        // ============================================
        [HttpPut("foto/{usuarioId}")]
        public IActionResult ActualizarFotoPerfil(int usuarioId, [FromBody] ActualizarFotoRequest request)
        {
            try
            {
                Console.WriteLine($"📸 Actualizando foto de perfil para usuario {usuarioId}");
                Console.WriteLine($"   Nueva URL: {request.fotoUrl}");

                if (string.IsNullOrWhiteSpace(request.fotoUrl))
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "La URL de la foto no puede estar vacía"
                    });
                }

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("sp_Actualizar_Foto_Perfil", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@usuarioId", usuarioId);
                        cmd.Parameters.AddWithValue("@fotoUrl", request.fotoUrl);

                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            Console.WriteLine($"✅ Foto de perfil actualizada correctamente");
                            return Ok(new
                            {
                                success = true,
                                mensaje = "Foto de perfil actualizada correctamente",
                                fotoUrl = request.fotoUrl
                            });
                        }
                        else
                        {
                            Console.WriteLine($"⚠️ No se encontró el usuario {usuarioId}");
                            return NotFound(new
                            {
                                success = false,
                                mensaje = "Usuario no encontrado"
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al actualizar foto de perfil: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al actualizar la foto de perfil",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // PUT: api/perfil/actualizar/{usuarioId}
        // Actualizar datos básicos del perfil (sin contraseña)
        // ============================================
        // =============================================
        // REEMPLAZO PARA ActualizarPerfil
        // PerfilController.cs - Línea ~163
        // =============================================

        [HttpPut("actualizar/{usuarioId}")]
        public IActionResult ActualizarPerfil(int usuarioId, [FromBody] ActualizarPerfilRequest request)
        {
            try
            {
                Console.WriteLine($"👤 Actualizando perfil para usuario {usuarioId}");
                Console.WriteLine($"   Nombre: {request.nombre}");
                Console.WriteLine($"   Apellido: {request.apellido}");
                Console.WriteLine($"   Dirección: {request.direccion}");

                if (string.IsNullOrWhiteSpace(request.nombre) ||
                    string.IsNullOrWhiteSpace(request.apellido) ||
                    string.IsNullOrWhiteSpace(request.email))
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Nombre, apellido y email son obligatorios"
                    });
                }

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("sp_Actualizar_Perfil", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@id", usuarioId);
                        cmd.Parameters.AddWithValue("@nombre", request.nombre);
                        cmd.Parameters.AddWithValue("@apellido", request.apellido);
                        cmd.Parameters.AddWithValue("@email", request.email);
                        cmd.Parameters.AddWithValue("@telefono", request.telefono ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@direccion", request.direccion ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@fotoPerfil", request.fotoPerfil ?? (object)DBNull.Value);

                        int rowsAffected = cmd.ExecuteNonQuery();

                        Console.WriteLine($"✅ Filas actualizadas: {rowsAffected}");

                        if (rowsAffected > 0)
                        {
                            return Ok(new
                            {
                                success = true,
                                mensaje = "Perfil actualizado correctamente"
                            });
                        }
                        else
                        {
                            return NotFound(new
                            {
                                success = false,
                                mensaje = "Usuario no encontrado"
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al actualizar el perfil",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // PUT: api/perfil/redes-sociales/{usuarioId}
        // Actualizar redes sociales del usuario
        // ============================================
        [HttpPut("redes-sociales/{usuarioId}")]
        public IActionResult ActualizarRedesSociales(int usuarioId, [FromBody] ActualizarRedesRequest request)
        {
            try
            {
                Console.WriteLine($"🌐 Actualizando redes sociales para usuario {usuarioId}");
                Console.WriteLine($"   Twitter: {request.twitter}");
                Console.WriteLine($"   Instagram: {request.instagram}");
                Console.WriteLine($"   Facebook: {request.facebook}");

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("sp_Actualizar_Redes_Sociales", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@usuarioId", usuarioId);
                        cmd.Parameters.AddWithValue("@twitter", request.twitter ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@instagram", request.instagram ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@facebook", request.facebook ?? (object)DBNull.Value);

                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            Console.WriteLine($"✅ Redes sociales actualizadas correctamente");
                            return Ok(new
                            {
                                success = true,
                                mensaje = "Redes sociales actualizadas correctamente"
                            });
                        }
                        else
                        {
                            Console.WriteLine($"⚠️ No se encontró el usuario {usuarioId}");
                            return NotFound(new
                            {
                                success = false,
                                mensaje = "Usuario no encontrado"
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al actualizar redes sociales: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al actualizar las redes sociales",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // POST: api/perfil/cambiar-contrasena
        // ✅ CORREGIDO: Ahora hashea la contraseña antes de guardar
        // ============================================
        [HttpPost("cambiar-contrasena")]
        public IActionResult CambiarContrasena([FromBody] CambiarContrasenaRequest request)
        {
            try
            {
                Console.WriteLine($"🔐 Cambiando contraseña para usuario {request.usuarioId}");

                if (request.usuarioId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Usuario inválido"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.nuevaContrasena))
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "La nueva contraseña no puede estar vacía"
                    });
                }

                // ✅ VALIDAR CONTRASEÑA ACTUAL (OPCIONAL - si quieres verificar la contraseña actual)
                // Primero obtener el usuario para verificar la contraseña actual
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    conn.Open();

                    // Si se proporcionó contraseña actual, verificarla
                    if (!string.IsNullOrWhiteSpace(request.contrasenaActual))
                    {
                        Console.WriteLine("🔍 Verificando contraseña actual...");

                        using (SqlCommand cmdVerificar = new SqlCommand("SELECT password FROM Usuario WHERE id = @usuarioId", conn))
                        {
                            cmdVerificar.Parameters.AddWithValue("@usuarioId", request.usuarioId);
                            var passwordActualHash = cmdVerificar.ExecuteScalar() as string;

                            if (passwordActualHash == null)
                            {
                                Console.WriteLine("❌ Usuario no encontrado");
                                return NotFound(new
                                {
                                    success = false,
                                    mensaje = "Usuario no encontrado"
                                });
                            }

                            // Verificar que la contraseña actual sea correcta
                            bool passwordCorrecta = DataAcces.VerifyPassword(request.contrasenaActual, passwordActualHash);

                            if (!passwordCorrecta)
                            {
                                Console.WriteLine("❌ Contraseña actual incorrecta");
                                return BadRequest(new
                                {
                                    success = false,
                                    mensaje = "La contraseña actual es incorrecta"
                                });
                            }

                            Console.WriteLine("✅ Contraseña actual verificada correctamente");
                        }
                    }

                    // ✅ HASHEAR LA NUEVA CONTRASEÑA antes de guardarla
                    Console.WriteLine("🔒 Hasheando nueva contraseña...");
                    string nuevaPasswordHash = DataAcces.HashPassword(request.nuevaContrasena);
                    Console.WriteLine("✅ Contraseña hasheada correctamente");

                    // Actualizar la contraseña con el hash
                    using (SqlCommand cmd = new SqlCommand("sp_Cambiar_Contrasena", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@usuarioId", request.usuarioId);
                        cmd.Parameters.AddWithValue("@nuevaContrasena", nuevaPasswordHash); // ✅ AHORA SÍ SE HASHEA

                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            Console.WriteLine($"✅ Contraseña cambiada correctamente para usuario {request.usuarioId}");
                            return Ok(new
                            {
                                success = true,
                                mensaje = "Contraseña cambiada correctamente"
                            });
                        }
                        else
                        {
                            Console.WriteLine($"⚠️ No se encontró el usuario {request.usuarioId}");
                            return NotFound(new
                            {
                                success = false,
                                mensaje = "Usuario no encontrado"
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al cambiar contraseña: {ex.Message}");
                Console.WriteLine($"📋 Stack trace: {ex.StackTrace}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al cambiar la contraseña",
                    detalle = ex.Message
                });
            }
        }
    }

    // ============================================
    // CLASES AUXILIARES (DTOs)
    // ============================================

    public class ActualizarFotoRequest
    {
        public string fotoUrl { get; set; }
    }

    public class ActualizarPerfilRequest
    {
        public string nombre { get; set; }
        public string apellido { get; set; }
        public string email { get; set; }
        public string telefono { get; set; }
        public string fotoPerfil { get; set; }
        public string direccion { get; set; }  // ✅ NUEVO - Campo dirección
    }

    public class ActualizarRedesRequest
    {
        public string twitter { get; set; }
        public string instagram { get; set; }
        public string facebook { get; set; }
    }

    public class CambiarContrasenaRequest
    {
        public int usuarioId { get; set; }
        public string contrasenaActual { get; set; }
        public string nuevaContrasena { get; set; }
    }
}