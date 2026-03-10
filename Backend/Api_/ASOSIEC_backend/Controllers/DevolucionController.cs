using ASOSIEC_backend.Services;
using Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using System;
using System.Collections.Generic;

namespace ASOSIEC_backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DevolucionController : ControllerBase
    {
        private readonly negocio _negocio;

        // DESPUÉS: Inyectar CloudinaryService
        private readonly CloudinaryService _cloudinaryService;

        public DevolucionController(
            CloudinaryService cloudinaryService,
            negocio negocio)
        {
            _negocio = negocio;
            _cloudinaryService = cloudinaryService;
        }

        /// <summary>
        /// Consulta todos los estados de devolución disponibles
        /// </summary>
        [HttpGet("estados")]
        public IActionResult ConsultarEstadosDevolucion()
        {
            try
            {
                var estados = _negocio.ConsultarEstadoDevolucion();
                return Ok(estados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al consultar estados de devolución", error = ex.Message });
            }
        }

        /// <summary>
        /// Registra una nueva solicitud de devolución
        /// </summary>
        [HttpPost("registrar")]
        public IActionResult RegistrarDevolucion([FromBody] Entidad_Devolucion devolucion)
        {
            try
            {
                if (devolucion == null)
                    return BadRequest(new { mensaje = "Los datos de la devolución son requeridos" });

                if (devolucion.ordenId <= 0)
                    return BadRequest(new { mensaje = "El ID de la orden es requerido" });

                if (string.IsNullOrWhiteSpace(devolucion.motivo))
                    return BadRequest(new { mensaje = "El motivo es requerido" });

                if (string.IsNullOrWhiteSpace(devolucion.tipo_devolucion))
                    return BadRequest(new { mensaje = "El tipo de devolución es requerido" });

                if (devolucion.tipo_devolucion != "REEMBOLSO" && devolucion.tipo_devolucion != "CAMBIO")
                    return BadRequest(new { mensaje = "El tipo de devolución debe ser REEMBOLSO o CAMBIO" });

                var resultado = _negocio.RegistrarDevolucion(devolucion);

                if (resultado > 0)
                {
                    return Ok(new
                    {
                        mensaje = "Devolución registrada exitosamente",
                        devolucionId = resultado,
                        exito = true
                    });
                }
                else if (resultado == -1)
                {
                    return BadRequest(new { mensaje = "La orden no existe o no está verificada" });
                }
                else if (resultado == -2)
                {
                    return BadRequest(new { mensaje = "El plazo de devolución (15 días) ha expirado" });
                }
                else if (resultado == -3)
                {
                    return BadRequest(new { mensaje = "Ya existe una solicitud de devolución activa para esta orden" });
                }
                else
                {
                    return BadRequest(new { mensaje = "No se pudo registrar la devolución" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al registrar devolución", error = ex.Message });
            }
        }

        /// <summary>
        /// Registra los items individuales de una devolución
        /// </summary>
        [HttpPost("items")]
        public IActionResult RegistrarItemsDevolucion([FromBody] List<Entidad_ItemDevolucion> items)
        {
            try
            {
                if (items == null || items.Count == 0)
                    return BadRequest(new { mensaje = "Debe seleccionar al menos un item para devolver" });

                var resultados = new List<bool>();

                foreach (var item in items)
                {
                    var resultado = _negocio.RegistrarItemDevolucion(item);
                    resultados.Add(resultado);
                }

                if (resultados.TrueForAll(r => r))
                {
                    return Ok(new { mensaje = "Items registrados exitosamente", exito = true });
                }
                else
                {
                    return BadRequest(new { mensaje = "Error al registrar algunos items" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al registrar items", error = ex.Message });
            }
        }

        /// <summary>
        /// Consulta las devoluciones de un usuario específico
        /// </summary>
        [HttpGet("usuario/{usuarioId}")]
        public IActionResult ConsultarDevolucionesPorUsuario(int usuarioId)
        {
            try
            {
                if (usuarioId <= 0)
                    return BadRequest(new { mensaje = "ID de usuario inválido" });

                var devoluciones = _negocio.ConsultarDevolucionesPorUsuario(usuarioId);
                return Ok(devoluciones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al consultar devoluciones", error = ex.Message });
            }
        }

        /// <summary>
        /// Consulta los items de una devolución específica
        /// </summary>
        [HttpGet("{devolucionId}/items")]
        public IActionResult ConsultarItemsDevolucion(int devolucionId)
        {
            try
            {
                if (devolucionId <= 0)
                    return BadRequest(new { mensaje = "ID de devolución inválido" });

                var items = _negocio.ConsultarItemsDevolucion(devolucionId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al consultar items de devolución", error = ex.Message });
            }
        }

        /// <summary>
        /// Consulta una devolución específica por ID
        /// </summary>
        [HttpGet("{id}")]
        public IActionResult ConsultarDevolucionPorId(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new { mensaje = "ID inválido" });

                var devolucion = _negocio.ConsultarDevolucionPorId(id);

                if (devolucion == null)
                    return NotFound(new { mensaje = "Devolución no encontrada" });

                return Ok(devolucion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al consultar devolución", error = ex.Message });
            }
        }

        /// <summary>
        /// Verifica si una orden puede ser devuelta
        /// </summary>
        [HttpGet("verificar/{ordenId}")]
        public IActionResult VerificarPuedeDevolver(int ordenId)
        {
            try
            {
                if (ordenId <= 0)
                    return BadRequest(new { mensaje = "ID de orden inválido" });

                var resultado = _negocio.VerificarPuedeDevolver(ordenId);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al verificar devolución", error = ex.Message });
            }
        }

        /// <summary>
        /// Cancela una devolución (solo cliente)
        /// </summary>
        [HttpPut("{devolucionId}/cancelar")]
        public IActionResult CancelarDevolucion(int devolucionId, [FromBody] int usuarioId)
        {
            try
            {
                if (devolucionId <= 0)
                    return BadRequest(new { mensaje = "ID de devolución inválido" });

                if (usuarioId <= 0)
                    return BadRequest(new { mensaje = "ID de usuario inválido" });

                var resultado = _negocio.CancelarDevolucion(devolucionId, usuarioId);

                if (resultado)
                    return Ok(new { mensaje = "Devolución cancelada exitosamente", exito = true });
                else
                    return BadRequest(new { mensaje = "No se pudo cancelar la devolución" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al cancelar devolución", error = ex.Message });
            }
        }

        /// <summary>
        /// Consulta todas las devoluciones (ADMIN)
        /// </summary>
        [HttpGet("admin/todas")]
        [Authorize(Roles = "Admin")]
        public IActionResult ConsultarTodasDevoluciones()
        {
            try
            {
                var devoluciones = _negocio.ConsultarTodasDevoluciones();
                return Ok(devoluciones);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al consultar devoluciones", error = ex.Message });
            }
        }

        /// <summary>
        /// Actualiza el estado de una devolución (ADMIN) - OBSOLETO
        /// Usar Aprobar o Rechazar en su lugar
        /// </summary>
        [HttpPut("admin/{devolucionId}/estado")]
        [Authorize(Roles = "Admin")]
        public IActionResult ActualizarEstadoDevolucion(int devolucionId, [FromBody] dynamic data)
        {
            try
            {
                if (devolucionId <= 0)
                    return BadRequest(new { mensaje = "ID de devolución inválido" });

                int estadoDevolucionId = data.estadoDevolucionId;
                string numeroSeguimiento = data.numeroSeguimiento?.ToString();
                int? respondidoPor = data.respondidoPor;
                string respuestaAdmin = data.respuestaAdmin?.ToString();

                var resultado = _negocio.ActualizarEstadoDevolucion(
                    devolucionId,
                    estadoDevolucionId,
                    numeroSeguimiento,
                    respondidoPor,
                    respuestaAdmin
                );

                if (resultado)
                    return Ok(new { mensaje = "Estado actualizado exitosamente", exito = true });
                else
                    return BadRequest(new { mensaje = "No se pudo actualizar el estado" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al actualizar estado", error = ex.Message });
            }
        }

        /// <summary>
        /// APROBAR una devolución (ADMIN) - NUEVO ENDPOINT
        /// Incluye auditoría y envío de emails
        /// </summary>
        [HttpPost("admin/{devolucionId}/aprobar")]
        [Authorize(Roles = "Admin")]
        public IActionResult AprobarDevolucion(int devolucionId, [FromBody] AprobarDevolucionDto datos)
        {
            try
            {
                if (devolucionId <= 0)
                    return BadRequest(new { mensaje = "ID de devolución inválido" });

                if (datos.NumeroSeguimiento == null)
                    datos.NumeroSeguimiento = $"REF-{devolucionId}-{DateTime.Now:yyyyMMdd}";

                if (datos.RespondidoPor <= 0)
                    return BadRequest(new { mensaje = "ID del administrador es requerido" });

                var resultado = _negocio.AprobarDevolucion(
                    devolucionId,
                    datos.NumeroSeguimiento,
                    datos.RespondidoPor,
                    datos.RespuestaAdmin
                );

                if (resultado)
                {
                    return Ok(new
                    {
                        mensaje = "Devolución aprobada exitosamente. Se han enviado notificaciones por email.",
                        exito = true
                    });
                }
                else
                {
                    return BadRequest(new { mensaje = "No se pudo aprobar la devolución" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al aprobar devolución", error = ex.Message });
            }
        }

        /// <summary>
        /// RECHAZAR una devolución (ADMIN) - NUEVO ENDPOINT
        /// Incluye auditoría y envío de emails
        /// </summary>
        [HttpPost("admin/{devolucionId}/rechazar")]
        [Authorize(Roles = "Admin")]
        public IActionResult RechazarDevolucion(int devolucionId, [FromBody] RechazarDevolucionDto datos)
        {
            try
            {
                if (devolucionId <= 0)
                    return BadRequest(new { mensaje = "ID de devolución inválido" });

                if (string.IsNullOrWhiteSpace(datos.RespuestaAdmin))
                    return BadRequest(new { mensaje = "El motivo del rechazo es requerido" });

                if (datos.RespondidoPor <= 0)
                    return BadRequest(new { mensaje = "ID del administrador es requerido" });

                var resultado = _negocio.RechazarDevolucion(
                    devolucionId,
                    datos.RespondidoPor,
                    datos.RespuestaAdmin
                );

                if (resultado)
                {
                    return Ok(new
                    {
                        mensaje = "Devolución rechazada exitosamente. El cliente ha sido notificado.",
                        exito = true
                    });
                }
                else
                {
                    return BadRequest(new { mensaje = "No se pudo rechazar la devolución" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al rechazar devolución", error = ex.Message });
            }
        }

        /// <summary>
        /// Sube una foto de evidencia de devolución
        /// </summary>
        // DESPUÉS: sube a Cloudinary igual que los otros archivos
        [HttpPost("subir-foto")]
        public async Task<IActionResult> SubirFotoDevolucion([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { mensaje = "No se recibió ningún archivo" });

                var url = await _cloudinaryService.UploadDevolucionImageAsync(file);
                return Ok(new { url = url, exito = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al subir archivo", error = ex.Message });
            }
        }
    }

    // DTOs para las nuevas operaciones
    public class AprobarDevolucionDto
    {
        public string NumeroSeguimiento { get; set; }
        public int RespondidoPor { get; set; }
        public string RespuestaAdmin { get; set; }
    }

    public class RechazarDevolucionDto
    {
        public int RespondidoPor { get; set; }
        public string RespuestaAdmin { get; set; }
    }
}