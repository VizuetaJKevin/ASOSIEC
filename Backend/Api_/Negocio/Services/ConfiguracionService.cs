using DataAccess;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ASOSIEC.Services
{
    /// <summary>
    /// Servicio para gestionar configuraciones dinámicas del sistema
    /// ✅ VERSIÓN CORREGIDA - Usa RegistrarConProcedimiento
    /// </summary>
    public class ConfiguracionService
    {
        private readonly IConfiguration _configuration;
        private readonly DataAcces _dataAccess;
        private Dictionary<string, string> _cacheConfiguracion;
        private DateTime _ultimaActualizacionCache;

        public ConfiguracionService(IConfiguration configuration)
        {
            _configuration = configuration;
            _dataAccess = new DataAcces();
            _cacheConfiguracion = new Dictionary<string, string>();
            _ultimaActualizacionCache = DateTime.MinValue;
        }

        public string ObtenerValor(string clave, string valorPorDefecto = null)
        {
            try
            {
                var valorBD = ObtenerDeBD(clave);
                if (!string.IsNullOrEmpty(valorBD))
                    return valorBD;

                var valorConfig = _configuration[clave];
                if (!string.IsNullOrEmpty(valorConfig))
                    return valorConfig;

                return valorPorDefecto;
            }
            catch
            {
                return valorPorDefecto;
            }
        }

        public int ObtenerEntero(string clave, int valorPorDefecto = 0)
        {
            var valor = ObtenerValor(clave);
            return int.TryParse(valor, out int resultado) ? resultado : valorPorDefecto;
        }

        public decimal ObtenerDecimal(string clave, decimal valorPorDefecto = 0)
        {
            var valor = ObtenerValor(clave);
            return decimal.TryParse(valor, out decimal resultado) ? resultado : valorPorDefecto;
        }

        public bool ObtenerBooleano(string clave, bool valorPorDefecto = false)
        {
            var valor = ObtenerValor(clave);
            return bool.TryParse(valor, out bool resultado) ? resultado : valorPorDefecto;
        }

        private string ObtenerDeBD(string clave)
        {
            try
            {
                if ((DateTime.Now - _ultimaActualizacionCache).TotalMinutes > 5)
                {
                    ActualizarCache();
                }

                if (_cacheConfiguracion.ContainsKey(clave))
                {
                    return _cacheConfiguracion[clave];
                }

                return null;
            }
            catch
            {
                return null;
            }
        }

        private void ActualizarCache()
        {
            try
            {
                var configuraciones = _dataAccess.Consultar<ConfiguracionBD>(
                    @"SELECT id, clave, valor, descripcion, tipo, activo, 
                             fecha_creacion, fecha_modificacion, modificado_por 
                      FROM Configuracion 
                      WHERE activo = 1"
                );

                _cacheConfiguracion = configuraciones.ToDictionary(c => c.clave, c => c.valor);
                _ultimaActualizacionCache = DateTime.Now;

                Console.WriteLine($"✅ Caché actualizado: {configuraciones.Count} configuraciones cargadas");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Error al actualizar caché de configuración: {ex.Message}");
            }
        }

        /// <summary>
        /// ✅✅✅ MÉTODO CORREGIDO - USA EL PATRÓN @accion
        /// Este es el método que estaba fallando
        /// </summary>
        public bool GuardarConfiguracion(string clave, string valor, string descripcion, int? usuarioId)
        {
            try
            {
                // Obtener la configuración existente para preservar tipo y activo
                var configuraciones = _dataAccess.Consultar<ConfiguracionBD>(
                    $"SELECT * FROM Configuracion WHERE clave = '{clave}'"
                );

                var configExistente = configuraciones.FirstOrDefault();
                string tipo = configExistente?.tipo ?? "STRING";
                bool activo = configExistente?.activo ?? true;

                Console.WriteLine($"🔍 DEBUG GuardarConfiguracion:");
                Console.WriteLine($"  - Clave: {clave}");
                Console.WriteLine($"  - Valor: {valor}");
                Console.WriteLine($"  - Tipo: {tipo}");
                Console.WriteLine($"  - Activo: {activo}");
                Console.WriteLine($"  - Descripción: {descripcion ?? "NULL"}");
                Console.WriteLine($"  - Usuario: {usuarioId?.ToString() ?? "NULL"}");

                // ✅ CAMBIO CRÍTICO: Usar RegistrarConProcedimiento en lugar de Ejecutar
                // Este método maneja el parámetro @accion OUTPUT correctamente
                var resultado = _dataAccess.RegistrarConProcedimiento(
                    "sp_Guardar_Configuracion",
                    new
                    {
                        clave = clave,
                        valor = valor,
                        descripcion = descripcion ?? "Sin descripción",
                        tipo = tipo,
                        activo = activo,
                        modificado_por = usuarioId
                    }
                );

                Console.WriteLine($"🔍 Resultado de RegistrarConProcedimiento(): {resultado}");

                if (resultado)
                {
                    // Actualizar caché inmediatamente
                    ActualizarCache();
                    Console.WriteLine($"✅ Configuración guardada exitosamente: {clave}");
                }
                else
                {
                    Console.WriteLine($"⚠️ RegistrarConProcedimiento retornó false para: {clave}");
                }

                return resultado;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al guardar configuración: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return false;
            }
        }

        public List<ConfiguracionBD> ObtenerTodasLasConfiguraciones()
        {
            try
            {
                return _dataAccess.Consultar<ConfiguracionBD>(
                    "SELECT * FROM Configuracion ORDER BY clave"
                );
            }
            catch
            {
                return new List<ConfiguracionBD>();
            }
        }

        public void LimpiarCache()
        {
            _cacheConfiguracion.Clear();
            _ultimaActualizacionCache = DateTime.MinValue;
        }
    }

    public class ConfiguracionBD
    {
        public int id { get; set; }
        public string clave { get; set; }
        public string valor { get; set; }
        public string descripcion { get; set; }
        public string tipo { get; set; }
        public bool activo { get; set; }
        public DateTime fecha_creacion { get; set; }
        public DateTime? fecha_modificacion { get; set; }
        public int? modificado_por { get; set; }
    }
}