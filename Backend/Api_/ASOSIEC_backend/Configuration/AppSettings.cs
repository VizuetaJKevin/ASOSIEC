using System.Collections.Generic;

namespace ASOSIEC.Configuration
{
    /// <summary>
    /// Clase que mapea TODAS las configuraciones del appsettings.json
    /// Esto permite acceder a las configuraciones de forma tipada y segura
    /// </summary>
    public class AppSettings
    {
        public JwtSettings Jwt { get; set; }
        public AppConfiguration App { get; set; }
        public BusinessRulesSettings BusinessRules { get; set; }
        public EmailSettings Email { get; set; }
        public MessagesSettings Messages { get; set; }
        public AuditSettings Audit { get; set; }
        public ReportsSettings Reports { get; set; }
        public CacheSettings Cache { get; set; }
        public NotificationsSettings Notifications { get; set; }
    }

    // ============================================
    // JWT CONFIGURATION
    // ============================================
    public class JwtSettings
    {
        public string Key { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public int ExpireMinutes { get; set; }
    }

    // ============================================
    // APP CONFIGURATION
    // ============================================
    public class AppConfiguration
    {
        public string CorsOrigins { get; set; }
        public string EmailFrom { get; set; }
        public string EmailFromName { get; set; }
        public long MaxFileSize { get; set; }
        public string AllowedImageTypes { get; set; }
        public string FrontendUrl { get; set; }
        public string BackendUrl { get; set; }

        /// <summary>
        /// Retorna los tipos de imagen permitidos como array
        /// </summary>
        public string[] GetAllowedImageTypesArray()
        {
            return AllowedImageTypes?.Split(',') ?? new string[] { };
        }
    }

    // ============================================
    // BUSINESS RULES CONFIGURATION
    // ============================================
    public class BusinessRulesSettings
    {
        // Stock e Inventario
        public int MinStockAlert { get; set; }
        public int MaxItemsPerOrder { get; set; }
        public int StockReservationMinutes { get; set; }

        // Seguridad y Autenticación
        public int MinPasswordLength { get; set; }
        public int MaxLoginAttempts { get; set; }
        public int SessionTimeoutMinutes { get; set; }
        public int AccountLockoutMinutes { get; set; }

        // Órdenes
        public int OrderExpirationDays { get; set; }
        public int MaxPendingOrdersPerUser { get; set; }

        // Comisiones y Precios
        public decimal PlatformCommissionPercent { get; set; }
        public decimal MinProductPrice { get; set; }
        public decimal MaxProductPrice { get; set; }

        // Vendedores
        public int MinProductsToBeActiveVendor { get; set; }
        public bool RequireVendorApproval { get; set; }
    }

    // ============================================
    // EMAIL CONFIGURATION
    // ============================================
    public class EmailSettings
    {
        public string SmtpServer { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        public string SmtpPassword { get; set; }
        public bool EnableSsl { get; set; }
        public bool UseDefaultCredentials { get; set; }
        public EmailTemplates Templates { get; set; }
    }

    public class EmailTemplates
    {
        public string WelcomeSubject { get; set; }
        public string OrderConfirmationSubject { get; set; }
        public string StockAlertSubject { get; set; }
        public string VendorApprovalSubject { get; set; }
    }

    // ============================================
    // MESSAGES CONFIGURATION
    // ============================================
    public class MessagesSettings
    {
        public Dictionary<string, string> Success { get; set; }
        public Dictionary<string, string> Errors { get; set; }
        public Dictionary<string, string> Validations { get; set; }
    }

    // ============================================
    // AUDIT CONFIGURATION
    // ============================================
    public class AuditSettings
    {
        public bool EnableAudit { get; set; }
        public bool LogSensitiveData { get; set; }
        public int RetentionDays { get; set; }
        public bool TrackIPAddress { get; set; }
        public bool TrackUserAgent { get; set; }
    }

    // ============================================
    // REPORTS CONFIGURATION
    // ============================================
    public class ReportsSettings
    {
        public int DefaultPageSize { get; set; }
        public int MaxExportRows { get; set; }
        public bool EnablePdfExport { get; set; }
        public bool EnableExcelExport { get; set; }
        public int ReportCacheDurationMinutes { get; set; }
    }

    // ============================================
    // CACHE CONFIGURATION
    // ============================================
    public class CacheSettings
    {
        public bool EnableCache { get; set; }
        public int DefaultExpirationMinutes { get; set; }
        public int ProductCacheMinutes { get; set; }
        public int CategoryCacheMinutes { get; set; }
        public int UserCacheMinutes { get; set; }
    }

    // ============================================
    // NOTIFICATIONS CONFIGURATION
    // ============================================
    public class NotificationsSettings
    {
        public bool EnableEmailNotifications { get; set; }
        public bool EnableStockAlerts { get; set; }
        public bool EnableOrderNotifications { get; set; }
        public bool EnableVendorNotifications { get; set; }
        public string AdminEmails { get; set; }

        /// <summary>
        /// Retorna los emails de admin como array
        /// </summary>
        public string[] GetAdminEmailsArray()
        {
            return AdminEmails?.Split(',') ?? new string[] { };
        }
    }
}
