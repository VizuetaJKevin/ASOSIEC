using System;
using System.Text.RegularExpressions;

namespace Negocio.Validators
{
    /// <summary>
    /// Validador de contraseñas fuertes
    /// </summary>
    public static class PasswordValidator
    {
        // Requisitos mínimos
        private const int MIN_LENGTH = 8;
        private const int MAX_LENGTH = 128;

        /// <summary>
        /// Valida si una contraseña cumple con los requisitos de seguridad
        /// </summary>
        public static (bool isValid, string mensaje) ValidarPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                return (false, "La contraseña es requerida");
            }

            if (password.Length < MIN_LENGTH)
            {
                return (false, $"La contraseña debe tener al menos {MIN_LENGTH} caracteres");
            }

            if (password.Length > MAX_LENGTH)
            {
                return (false, $"La contraseña no puede tener más de {MAX_LENGTH} caracteres");
            }

            // Verificar mayúsculas
            if (!Regex.IsMatch(password, @"[A-Z]"))
            {
                return (false, "La contraseña debe contener al menos una letra mayúscula");
            }

            // Verificar minúsculas
            if (!Regex.IsMatch(password, @"[a-z]"))
            {
                return (false, "La contraseña debe contener al menos una letra minúscula");
            }

            // Verificar números
            if (!Regex.IsMatch(password, @"[0-9]"))
            {
                return (false, "La contraseña debe contener al menos un número");
            }

            // Verificar caracteres especiales
            if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]"))
            {
                return (false, "La contraseña debe contener al menos un carácter especial (!@#$%^&*...)");
            }

            // Verificar que no sea una contraseña común
            var commonPasswords = new[]
            {
                "password", "12345678", "password123", "admin123",
                "qwerty123", "letmein", "welcome123", "monkey123"
            };

            if (Array.Exists(commonPasswords, p => password.ToLower().Contains(p)))
            {
                return (false, "Esta contraseña es muy común y fácil de adivinar");
            }

            return (true, "Contraseña válida");
        }

        /// <summary>
        /// Calcula la fortaleza de una contraseña (0-100)
        /// </summary>
        public static int CalcularFortaleza(string password)
        {
            if (string.IsNullOrEmpty(password))
                return 0;

            int score = 0;

            // Longitud (hasta 30 puntos)
            score += Math.Min(password.Length * 2, 30);

            // Mayúsculas (10 puntos)
            if (Regex.IsMatch(password, @"[A-Z]"))
                score += 10;

            // Minúsculas (10 puntos)
            if (Regex.IsMatch(password, @"[a-z]"))
                score += 10;

            // Números (15 puntos)
            if (Regex.IsMatch(password, @"[0-9]"))
                score += 15;

            // Caracteres especiales (20 puntos)
            if (Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]"))
                score += 20;

            // Diversidad de caracteres (15 puntos)
            var uniqueChars = password.Distinct().Count();
            score += Math.Min(uniqueChars, 15);

            return Math.Min(score, 100);
        }
    }
}