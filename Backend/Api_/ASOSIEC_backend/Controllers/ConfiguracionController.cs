using ASOSIEC.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;

namespace ASOSIEC.Controllers
{
    [ApiController]
    [Route("api")]
    //[Authorize]
    public class ConfiguracionController : Controller
    {
        private readonly ConfiguracionService _configuracionService;
        private readonly negocio _Helper;

        public ConfiguracionController(ConfiguracionService configuracionService, negocio helper)
        {
            this._configuracionService = configuracionService;
            this._Helper = helper;
        }

        // ============================================
        // GET: api/ConsultarConfiguraciones
        // Obtiene todas las configuraciones activas
        // ============================================
        [HttpGet("ConsultarConfiguraciones")]
        public IActionResult ConsultarTodas()
        {
            try
            {
                var configuraciones = _configuracionService.ObtenerTodasLasConfiguraciones();
                if (configuraciones != null && configuraciones.Count > 0)
                {
                    return Ok(configuraciones);
                }
                else
                {
                    return NotFound(new { mensaje = "No se encontraron configuraciones" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al consultar configuraciones: {ex.Message}");
                return BadRequest(new { mensaje = "Error al consultar configuraciones", error = ex.Message });
            }
        }

        // ============================================
        // GET: api/Configuracion/{id}
        // Obtiene una configuración por ID
        // ============================================
        [HttpGet("Configuracion/{id}")]
        public IActionResult ConsultarPorId(int id)
        {
            try
            {
                var configuraciones = _configuracionService.ObtenerTodasLasConfiguraciones();
                var config = configuraciones.FirstOrDefault(c => c.id == id);

                if (config != null)
                {
                    return Ok(config);
                }
                else
                {
                    return NotFound(new { mensaje = "Configuración no encontrada" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al consultar configuración: {ex.Message}");
                return BadRequest(new { mensaje = "Error al consultar configuración", error = ex.Message });
            }
        }

        // ============================================
        // GET: api/Configuracion/Clave/{clave}
        // Obtiene una configuración por su clave
        // ============================================
        [HttpGet("Configuracion/Clave/{clave}")]
        public IActionResult ConsultarPorClave(string clave)
        {
            try
            {
                var valor = _configuracionService.ObtenerValor(clave);
                if (!string.IsNullOrEmpty(valor))
                {
                    return Ok(new { clave = clave, valor = valor });
                }
                else
                {
                    return NotFound(new { mensaje = "Configuración no encontrada" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al consultar configuración: {ex.Message}");
                return BadRequest(new { mensaje = "Error al consultar configuración", error = ex.Message });
            }
        }

        // ============================================
        // PUT: api/Actualizar_Configuracion
        // Actualiza una configuración (solo Admin)
        // ✅ CORREGIDO COMPLETAMENTE
        // ============================================
        [HttpPut("Actualizar_Configuracion")]
        // [Authorize(Roles = "Admin")]
        public IActionResult Actualizar([FromBody] ConfiguracionBD config)
        {
            try
            {
                // Validación de datos
                if (config == null || config.id <= 0)
                {
                    Console.WriteLine("❌ Datos de configuración inválidos");
                    return BadRequest(new { mensaje = "Datos de configuración inválidos", actualizado = false });
                }

                // ✅ CORRECCIÓN: Obtener el usuario desde el token (puede ser NULL)
                var userIdClaim = User.FindFirst("id");
                int? usuarioId = userIdClaim != null ? int.Parse(userIdClaim.Value) : (int?)null;

                // ✅ Log para debugging
                Console.WriteLine($"🔍 Actualizando configuración: {config.clave} = {config.valor}");
                Console.WriteLine($"🔍 Usuario ID: {usuarioId?.ToString() ?? "NULL"}");

                // Guardar la configuración
                var resultado = _configuracionService.GuardarConfiguracion(
                    config.clave,
                    config.valor,
                    config.descripcion,
                    usuarioId
                );

                if (resultado)
                {
                    Console.WriteLine($"✅ Configuración actualizada exitosamente: {config.clave}");
                    return Ok(new { mensaje = "Configuración actualizada exitosamente", actualizado = true });
                }
                else
                {
                    Console.WriteLine($"⚠️ No se pudo actualizar la configuración: {config.clave}");
                    return BadRequest(new { mensaje = "No se pudo actualizar la configuración", actualizado = false });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al actualizar configuración: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return BadRequest(new { mensaje = "Error al actualizar configuración", error = ex.Message, actualizado = false });
            }
        }

        // ============================================
        // POST: api/RefreshCache_Configuracion
        // Refresca el caché de configuraciones (solo Admin)
        // ============================================
        [HttpPost("RefreshCache_Configuracion")]
        //  [Authorize(Roles = "Admin")]
        public IActionResult RefrescarCache()
        {
            try
            {
                _configuracionService.LimpiarCache();
                Console.WriteLine("✅ Caché de configuraciones refrescado");
                return Ok(new { mensaje = "Caché refrescado exitosamente" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al refrescar caché: {ex.Message}");
                return BadRequest(new { mensaje = "Error al refrescar caché", error = ex.Message });
            }
        }

        // ============================================
        // GET: api/Configuracion/Test
        // Endpoint de prueba para verificar configuraciones
        // ============================================
        [HttpGet("Configuracion/Test")]
        //  [Authorize(Roles = "Admin")]
        public IActionResult TestConfiguracion()
        {
            try
            {
                var prueba = new
                {
                    mensaje = "✅ ConfiguracionService funcionando correctamente",
                    ejemplos = new
                    {
                        stockMinimo = _configuracionService.ObtenerEntero("stock_minimo_alerta", 0),
                        maxIntentos = _configuracionService.ObtenerEntero("max_intentos_login", 0),
                        comision = _configuracionService.ObtenerDecimal("comision_plataforma", 0),
                        emailsHabilitados = _configuracionService.ObtenerBooleano("habilitar_emails", false)
                    },
                    totalConfiguraciones = _configuracionService.ObtenerTodasLasConfiguraciones().Count
                };
                return Ok(prueba);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en test de configuración: {ex.Message}");
                return BadRequest(new { mensaje = "Error en configuración", error = ex.Message });
            }
        }
    }
}