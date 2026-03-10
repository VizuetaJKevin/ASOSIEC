using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ASOSIEC_backend.Services;

namespace ASOSIEC_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly CloudinaryService _cloudinaryService;
        private readonly ILogger<UploadController> _logger;

        public UploadController(
            CloudinaryService cloudinaryService,
            ILogger<UploadController> logger)
        {
            _cloudinaryService = cloudinaryService;
            _logger = logger;
        }

        /// <summary>
        /// Subir imagen de producto
        /// </summary>
        [HttpPost("producto")]
        public async Task<IActionResult> UploadProductImage([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, mensaje = "No se recibió ningún archivo" });
                }

                _logger.LogInformation($"📤 Subiendo imagen de producto: {file.FileName}");

                var imageUrl = await _cloudinaryService.UploadProductImageAsync(file);

                return Ok(new
                {
                    success = true,
                    mensaje = "Imagen subida exitosamente",
                    url = imageUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error al subir imagen: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al subir la imagen",
                    detalle = ex.Message
                });
            }
        }

        /// <summary>
        /// ✅ NUEVO: Subir foto de perfil
        /// </summary>
        [HttpPost("perfil")]
        public async Task<IActionResult> UploadProfileImage([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, mensaje = "No se recibió ningún archivo" });
                }

                _logger.LogInformation($"📤 Subiendo foto de perfil: {file.FileName}");

                var imageUrl = await _cloudinaryService.UploadProfileImageAsync(file);

                return Ok(new
                {
                    success = true,
                    mensaje = "Foto de perfil subida exitosamente",
                    url = imageUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error al subir foto de perfil: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al subir la foto de perfil",
                    detalle = ex.Message
                });
            }
        }

        /// <summary>
        /// Subir comprobante de pago
        /// </summary>
        [HttpPost("comprobante")]
        public async Task<IActionResult> UploadComprobante([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, mensaje = "No se recibió ningún archivo" });
                }

                _logger.LogInformation($"📤 Subiendo comprobante: {file.FileName}");

                var imageUrl = await _cloudinaryService.UploadComprobanteAsync(file);

                return Ok(new
                {
                    success = true,
                    mensaje = "Comprobante subido exitosamente",
                    url = imageUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error al subir comprobante: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al subir el comprobante",
                    detalle = ex.Message
                });
            }
        }


        /// <summary>
        /// Subir foto de devolución
        /// </summary>
        [HttpPost("devolucion")]
        public async Task<IActionResult> UploadDevolucionImage([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, mensaje = "No se recibió ningún archivo" });
                }

                _logger.LogInformation($"📤 Subiendo foto de devolución: {file.FileName}");

                var imageUrl = await _cloudinaryService.UploadDevolucionImageAsync(file);

                return Ok(new
                {
                    success = true,
                    mensaje = "Foto de devolución subida exitosamente",
                    url = imageUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error al subir foto de devolución: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al subir la foto de devolución",
                    detalle = ex.Message
                });
            }
        }

        /// <summary>
        /// Eliminar imagen
        /// </summary>
        [HttpDelete]
        public async Task<IActionResult> DeleteImage([FromQuery] string publicId)
        {
            try
            {
                if (string.IsNullOrEmpty(publicId))
                {
                    return BadRequest(new { success = false, mensaje = "Se requiere el publicId de la imagen" });
                }

                var deleted = await _cloudinaryService.DeleteImageAsync(publicId);

                if (deleted)
                {
                    return Ok(new { success = true, mensaje = "Imagen eliminada exitosamente" });
                }
                else
                {
                    return StatusCode(500, new { success = false, mensaje = "No se pudo eliminar la imagen" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error al eliminar imagen: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al eliminar la imagen",
                    detalle = ex.Message
                });
            }
        }
    }
}