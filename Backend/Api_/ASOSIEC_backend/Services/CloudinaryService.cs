using ASOSIEC_backend.Configuration;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Principal;

namespace ASOSIEC_backend.Services
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly CloudinarySettings _settings;
        private readonly ILogger<CloudinaryService> _logger;

        public CloudinaryService(
            IOptions<CloudinarySettings> settings,
            ILogger<CloudinaryService> logger)
        {
            _settings = settings.Value;
            _logger = logger;

            var account = new Account(
                _settings.CloudName,
                _settings.ApiKey,
                _settings.ApiSecret
            );

            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        /// <summary>
        /// Subir imagen de producto a Cloudinary
        /// </summary>
        public async Task<string> UploadProductImageAsync(IFormFile file, string? existingPublicId = null)
        {
            try
            {
                // Validar tamaño
                if (file.Length > _settings.MaxFileSizeMB * 1024 * 1024)
                {
                    throw new Exception($"El archivo excede el tamaño máximo de {_settings.MaxFileSizeMB}MB");
                }

                // Validar formato
                var extension = Path.GetExtension(file.FileName).ToLower().Replace(".", "");
                if (!_settings.AllowedFormats.Contains(extension))
                {
                    throw new Exception($"Formato no permitido. Formatos permitidos: {string.Join(", ", _settings.AllowedFormats)}");
                }

                // Eliminar imagen anterior si existe
                if (!string.IsNullOrEmpty(existingPublicId))
                {
                    await DeleteImageAsync(existingPublicId);
                }

                // Generar nombre único
                var fileName = $"{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(file.FileName)}";

                using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = _settings.FolderProductos,
                    PublicId = fileName,
                    Transformation = new Transformation()
                        .Width(800)
                        .Height(800)
                        .Crop("limit")
                        .Quality("auto:good")
                        .FetchFormat("auto")
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                {
                    throw new Exception($"Error al subir imagen: {uploadResult.Error?.Message}");
                }

                _logger.LogInformation($"✅ Imagen subida: {uploadResult.SecureUrl}");

                return uploadResult.SecureUrl.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error en UploadProductImageAsync: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// ✅ NUEVO: Subir foto de perfil a Cloudinary
        /// </summary>
        public async Task<string> UploadProfileImageAsync(IFormFile file, string? existingPublicId = null)
        {
            try
            {
                // Validar tamaño
                if (file.Length > _settings.MaxFileSizeMB * 1024 * 1024)
                {
                    throw new Exception($"El archivo excede el tamaño máximo de {_settings.MaxFileSizeMB}MB");
                }

                // Validar formato
                var extension = Path.GetExtension(file.FileName).ToLower().Replace(".", "");
                if (!_settings.AllowedFormats.Contains(extension))
                {
                    throw new Exception($"Formato no permitido. Formatos permitidos: {string.Join(", ", _settings.AllowedFormats)}");
                }

                // Eliminar imagen anterior si existe
                if (!string.IsNullOrEmpty(existingPublicId))
                {
                    await DeleteImageAsync(existingPublicId);
                }

                // Generar nombre único
                var fileName = $"user_{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(file.FileName)}";

                using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "asosiec/perfil",  // ✅ Carpeta específica para perfiles
                    PublicId = fileName,
                    Transformation = new Transformation()
                        .Width(400)
                        .Height(400)
                        .Crop("fill")
                        .Gravity("face")  // Centrar en rostros si existe
                        .Quality("auto:good")
                        .FetchFormat("auto")
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                {
                    throw new Exception($"Error al subir foto de perfil: {uploadResult.Error?.Message}");
                }

                _logger.LogInformation($"✅ Foto de perfil subida: {uploadResult.SecureUrl}");

                return uploadResult.SecureUrl.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error en UploadProfileImageAsync: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Subir comprobante de pago a Cloudinary
        /// </summary>
        public async Task<string> UploadComprobanteAsync(IFormFile file)
        {
            try
            {
                // Validar tamaño
                if (file.Length > _settings.MaxFileSizeMB * 1024 * 1024)
                {
                    throw new Exception($"El archivo excede el tamaño máximo de {_settings.MaxFileSizeMB}MB");
                }

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(file.FileName)}";

                using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = _settings.FolderComprobantes,
                    PublicId = fileName,
                    Transformation = new Transformation()
                        .Width(1200)
                        .Height(1600)
                        .Crop("limit")
                        .Quality("auto:best")
                        .FetchFormat("auto")
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                {
                    throw new Exception($"Error al subir comprobante: {uploadResult.Error?.Message}");
                }

                _logger.LogInformation($"✅ Comprobante subido: {uploadResult.SecureUrl}");

                return uploadResult.SecureUrl.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error en UploadComprobanteAsync: {ex.Message}");
                throw;
            }
        }


        // ============================================
        // AGREGAR ESTE MÉTODO AL CloudinaryService.cs
        // Después del método UploadComprobanteAsync (línea 205)
        // y antes del método DeleteImageAsync (línea 210)
        // ============================================

        /// <summary>
        /// Subir foto de devolución a Cloudinary
        /// </summary>
        public async Task<string> UploadDevolucionImageAsync(IFormFile file)
        {
            try
            {
                // Validar tamaño (máx 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    throw new Exception($"El archivo excede el tamaño máximo de 5MB");
                }

                // Validar formato
                var extension = Path.GetExtension(file.FileName).ToLower().Replace(".", "");
                if (!_settings.AllowedFormats.Contains(extension))
                {
                    throw new Exception($"Formato no permitido. Formatos permitidos: {string.Join(", ", _settings.AllowedFormats)}");
                }

                // Generar nombre único
                var fileName = $"dev_{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(file.FileName)}";

                using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "asosiec/devoluciones",  // Carpeta específica para devoluciones
                    PublicId = fileName,
                    Transformation = new Transformation()
                        .Width(1200)
                        .Height(1200)
                        .Crop("limit")
                        .Quality("auto:good")
                        .FetchFormat("auto")
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                {
                    throw new Exception($"Error al subir foto de devolución: {uploadResult.Error?.Message}");
                }

                _logger.LogInformation($"✅ Foto de devolución subida: {uploadResult.SecureUrl}");

                return uploadResult.SecureUrl.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error en UploadDevolucionImageAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            try
            {
                if (string.IsNullOrEmpty(publicId))
                    return true;

                // Extraer public_id de la URL completa si es necesario
                if (publicId.StartsWith("http"))
                {
                    var uri = new Uri(publicId);
                    var pathParts = uri.AbsolutePath.Split('/');
                    publicId = string.Join("/", pathParts.Skip(pathParts.Length - 2));
                    publicId = Path.GetFileNameWithoutExtension(publicId);
                }

                var deletionParams = new DeletionParams(publicId);
                var result = await _cloudinary.DestroyAsync(deletionParams);

                _logger.LogInformation($"✅ Imagen eliminada: {publicId}");

                return result.StatusCode == System.Net.HttpStatusCode.OK;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"⚠️ Error al eliminar imagen {publicId}: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Extraer public_id de una URL de Cloudinary
        /// </summary>
        public string? ExtractPublicIdFromUrl(string? url)
        {
            if (string.IsNullOrEmpty(url))
                return null;

            try
            {
                var uri = new Uri(url);
                var pathParts = uri.AbsolutePath.Split('/');

                // Buscar la carpeta (asosiec) y construir el public_id
                var folderIndex = Array.FindIndex(pathParts, p => p == "asosiec");
                if (folderIndex >= 0 && folderIndex < pathParts.Length - 1)
                {
                    var publicIdParts = pathParts.Skip(folderIndex).ToArray();
                    var publicId = string.Join("/", publicIdParts);
                    publicId = Path.GetFileNameWithoutExtension(publicId);
                    return publicId;
                }

                return null;
            }
            catch
            {
                return null;
            }
        }
    }
}