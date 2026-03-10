using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Negocio.Services
{
    /// <summary>
    /// Servicio para verificar tokens de Google reCAPTCHA v3
    /// </summary>
    public class ReCaptchaService
    {
        private readonly string _secretKey;
        private readonly double _minimumScore;
        private readonly HttpClient _httpClient;

        public ReCaptchaService(IConfiguration configuration)
        {
            _secretKey = configuration["ReCaptcha:SecretKey"];
            _minimumScore = double.Parse(configuration["ReCaptcha:MinimumScore"] ?? "0.5");
            _httpClient = new HttpClient();
        }

        /// <summary>
        /// Verifica si el token de reCAPTCHA es válido
        /// </summary>
        /// <param name="token">Token generado por reCAPTCHA en el frontend</param>
        /// <param name="accion">Acción esperada (ej: 'login', 'register')</param>
        /// <returns>True si el token es válido y el score es suficiente</returns>
        public async Task<(bool esValido, double score, string mensaje)> VerificarToken(string token, string accion = null)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    return (false, 0, "Token de reCAPTCHA no proporcionado");
                }

                // Llamar a la API de Google
                var url = "https://www.google.com/recaptcha/api/siteverify";
                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("secret", _secretKey),
                    new KeyValuePair<string, string>("response", token)
                });

                var response = await _httpClient.PostAsync(url, content);
                var responseString = await response.Content.ReadAsStringAsync();

                // Parsear respuesta
                var result = JsonSerializer.Deserialize<ReCaptchaResponse>(responseString, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (!result.Success)
                {
                    Console.WriteLine($"❌ reCAPTCHA falló: {string.Join(", ", result.ErrorCodes ?? new string[0])}");
                    return (false, 0, "Verificación de reCAPTCHA falló");
                }

                // Verificar acción si se especificó
                if (!string.IsNullOrEmpty(accion) && result.Action != accion)
                {
                    Console.WriteLine($"⚠️ Acción no coincide. Esperada: {accion}, Recibida: {result.Action}");
                    return (false, result.Score, "Acción de reCAPTCHA no coincide");
                }

                // Verificar score mínimo
                if (result.Score < _minimumScore)
                {
                    Console.WriteLine($"⚠️ Score bajo: {result.Score} (mínimo: {_minimumScore})");
                    return (false, result.Score, $"Score de reCAPTCHA muy bajo: {result.Score}");
                }

                Console.WriteLine($"✅ reCAPTCHA válido - Score: {result.Score}, Acción: {result.Action}");
                return (true, result.Score, "Verificación exitosa");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error verificando reCAPTCHA: {ex.Message}");
                // En caso de error, permitir la operación (para no bloquear el sistema)
                return (true, 0, "Error en verificación, permitiendo operación");
            }
        }

        /// <summary>
        /// Modelo de respuesta de Google reCAPTCHA
        /// </summary>
        private class ReCaptchaResponse
        {
            public bool Success { get; set; }
            public double Score { get; set; }
            public string Action { get; set; }
            public DateTime ChallengeTs { get; set; }
            public string Hostname { get; set; }
            public string[] ErrorCodes { get; set; }
        }
    }
}