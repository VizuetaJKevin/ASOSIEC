using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio.Services;
using System;
using System.Linq;

namespace ASOSIEC_backend.Controllers
{
    [ApiController]
    [Route("api/audit")]
    [Authorize(Roles = "Admin")] // Solo administradores
    public class AuditController : ControllerBase
    {
        private readonly AuditService _auditService;

        public AuditController(AuditService auditService)
        {
            _auditService = auditService;
        }

        /// <summary>
        /// Obtener logs de auditoría con filtros
        /// </summary>
        [HttpGet("logs")]
        public IActionResult GetAuditLogs(
            [FromQuery] DateTime? fechaInicio = null,
            [FromQuery] DateTime? fechaFin = null,
            [FromQuery] int? usuarioId = null,
            [FromQuery] string entidad = null,
            [FromQuery] int? entidadId = null,
            [FromQuery] string tipoOperacion = null,
            [FromQuery] bool? soloExitosos = null,
            [FromQuery] int pagina = 1,
            [FromQuery] int registrosPorPagina = 50)
        {
            try
            {
                var logs = _auditService.ConsultarAuditoria(
                    fechaInicio, fechaFin, usuarioId, entidad, entidadId,
                    tipoOperacion, soloExitosos, pagina, registrosPorPagina
                );

                return Ok(new
                {
                    success = true,
                    data = logs,
                    pagina = pagina,
                    registros_por_pagina = registrosPorPagina
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar auditoría",
                    detalle = ex.Message
                });
            }
        }

        /// <summary>
        /// Obtener estadísticas de auditoría
        /// </summary>
        [HttpGet("stats")]
        public IActionResult GetAuditStats(
            [FromQuery] DateTime? fechaInicio = null,
            [FromQuery] DateTime? fechaFin = null)
        {
            try
            {
                // Aquí llamarías al SP de estadísticas
                // Por ahora, retornamos estructura de ejemplo

                return Ok(new
                {
                    success = true,
                    estadisticas = new
                    {
                        total_operaciones = 0,
                        operaciones_exitosas = 0,
                        operaciones_fallidas = 0,
                        usuarios_activos = 0
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al obtener estadísticas",
                    detalle = ex.Message
                });
            }
        }

        /// <summary>
        /// Obtener historial de una entidad específica
        /// </summary>
        [HttpGet("entity/{entidad}/{id}")]
        public IActionResult GetEntityHistory(string entidad, int id)
        {
            try
            {
                var logs = _auditService.ConsultarAuditoria(
                    entidad: entidad,
                    entidadId: id,
                    registrosPorPagina: 100
                );

                return Ok(new
                {
                    success = true,
                    entidad = entidad,
                    entidad_id = id,
                    historial = logs
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al obtener historial",
                    detalle = ex.Message
                });
            }
        }

        /// <summary>
        /// Obtener actividad de un usuario
        /// </summary>
        [HttpGet("user/{userId}")]
        public IActionResult GetUserActivity(int userId, [FromQuery] int dias = 30)
        {
            try
            {
                var fechaInicio = DateTime.Now.AddDays(-dias);

                var logs = _auditService.ConsultarAuditoria(
                    fechaInicio: fechaInicio,
                    usuarioId: userId,
                    registrosPorPagina: 100
                );

                return Ok(new
                {
                    success = true,
                    usuario_id = userId,
                    periodo_dias = dias,
                    actividad = logs
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al obtener actividad de usuario",
                    detalle = ex.Message
                });
            }
        }
    }
}