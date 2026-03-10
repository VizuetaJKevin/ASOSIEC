using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using ASOSIEC.Services;

namespace Negocio
{
    public class EmailService
    {
        // ============================================
        // CONFIGURACIÓN DE SMTP
        // ============================================
        private readonly string _smtpHost = "smtp.gmail.com";
        private readonly int _smtpPort = 587;
        private readonly string _fromEmail = "minimussomething@gmail.com";
        private readonly string _fromPassword = "dnzn burb onaf gyti";

        // ✅ EMAIL DEL ADMINISTRADOR - CENTRALIZADO
        private readonly string _adminEmail = "kevinvizuetaj@gmail.com";

        // ✅ SERVICIO DE CONFIGURACIÓN
        private readonly ConfiguracionService _configuracionService;

        // ============================================
        // ✅ CONSTRUCTOR CON INYECCIÓN DE DEPENDENCIAS
        // ============================================
        public EmailService(ConfiguracionService configuracionService)
        {
            _configuracionService = configuracionService;
        }

        // ============================================
        // ✅ MÉTODO PARA VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
        // ============================================
        private bool EmailsHabilitados()
        {
            try
            {
                // Usa ObtenerBooleano en lugar de ObtenerConfiguracion
                bool habilitado = _configuracionService.ObtenerBooleano("habilitar_emails", true);
                return habilitado;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Error al verificar configuración de emails: {ex.Message}");
                // En caso de error, permitir envío de emails por seguridad
                return true;
            }
        }

        // ============================================
        // PLANTILLA BASE MODERNA Y CONSISTENTE
        // ============================================
        private string GetEmailTemplate(string titulo, string color, string icono, string contenido)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; background-color: #f4f6f9;'>
    <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f4f6f9; padding: 40px 0;'>
        <tr>
            <td align='center'>
                <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;'>
                    <!-- Header -->
                    <tr>
                        <td style='background: linear-gradient(135deg, {color} 0%, {color}dd 100%); padding: 40px 30px; text-align: center;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;'>
                                {icono} ASOSIEC
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px 30px;'>
                            <h2 style='margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;'>
                                {titulo}
                            </h2>
                            {contenido}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;'>
                            <p style='margin: 0 0 10px 0; color: #6c757d; font-size: 14px;'>
                                <strong>ASOSIEC</strong><br>
                                Tu tienda de confianza para instrumentos musicales y tecnología
                            </p>
                            <p style='margin: 10px 0 0 0; color: #adb5bd; font-size: 12px;'>
                                Este es un correo automático. Por favor, no responder a este mensaje.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
        }

        private string GetInfoBox(string contenido, string color = "#ac5d3e")
        {
            return $@"
<div style='background-color: {color}15; border-left: 4px solid {color}; padding: 20px; margin: 25px 0; border-radius: 8px;'>
    {contenido}
</div>";
        }

        private string GetButton(string texto, string url, string color = "#ac5d3e")
        {
            return $@"
<div style='text-align: center; margin: 30px 0;'>
    <a href='{url}' style='display: inline-block; background-color: {color}; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
        {texto}
    </a>
</div>";
        }

        // ============================================
        // EMAILS PARA CLIENTES (COMPRAS)
        // ============================================

        public async Task<bool> EnviarEmailCompraPendiente(string destinatario, string nombreCliente, string codigoOrden, decimal total)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de compra pendiente NO enviado - emails deshabilitados");
                return true; // Retornar true para no romper el flujo
            }

            try
            {
                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    Hola <strong>{nombreCliente}</strong>,
</p>
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
    Tu pedido ha sido registrado exitosamente y está siendo procesado.
</p>

{GetInfoBox($@"
    <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
        <strong>📋 Código de Orden:</strong> <span style='font-family: monospace; background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px;'>{codigoOrden}</span>
    </p>
    <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
        <strong>💰 Total:</strong> <span style='font-size: 20px; font-weight: 700; color: #ac5d3e;'>${total:N2}</span>
    </p>
", "#ac5d3e")}

<h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
    📌 Próximos Pasos:
</h3>
<ol style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
    <li>Tu comprobante de pago está siendo procesado</li>
    <li>Verificaremos el pago en las próximas <strong>24-48 horas</strong></li>
    <li>Recibirás un email de confirmación una vez validado</li>
    <li>Tu pedido será enviado inmediatamente después</li>
</ol>

<p style='color: #6c757d; font-size: 14px; line-height: 1.6; margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 6px;'>
    💡 <strong>Nota:</strong> Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
</p>";

                return await EnviarEmail(
                    destinatario,
                    "Compra Registrada - Pendiente de Verificación",
                    GetEmailTemplate("¡Gracias por tu compra!", "#ac5d3e", "🛒", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar email de compra pendiente: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> EnviarEmailPagoVerificado(string destinatario, string nombreCliente, string codigoOrden, decimal total,
            byte[] ridePdf = null, string nombreArchivoRide = null, string numeroSeguimiento = null)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de pago verificado NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                var tieneFactura = ridePdf != null && ridePdf.Length > 0;

                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    ¡Excelente noticia, <strong>{nombreCliente}</strong>!
</p>
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
    Tu pago ha sido <strong style='color: #28a745;'>verificado exitosamente</strong> ✅
</p>

{GetInfoBox($@"
    <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
        <strong>📋 Código de Orden:</strong> <span style='font-family: monospace; background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px;'>{codigoOrden}</span>
    </p>
    <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
        <strong>💰 Total Pagado:</strong> <span style='font-size: 20px; font-weight: 700; color: #28a745;'>${total:N2}</span>
    </p>
    <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
        <strong>✅ Estado:</strong> <span style='background-color: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;'>PAGO CONFIRMADO</span>
    </p>
    {(!string.IsNullOrEmpty(numeroSeguimiento) ? $@"
    <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
        <strong>📦 N° Seguimiento:</strong> <span style='font-family: monospace; background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-weight: 700; color: #ac5d3e;'>{numeroSeguimiento}</span>
    </p>" : "")}
", "#28a745")}

{(tieneFactura ? @"
<div style='background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; margin: 20px 0; border-radius: 8px;'>
    <p style='margin: 0 0 6px 0; color: #0284c7; font-size: 15px; font-weight: 700;'>
        📄 Factura Electrónica (RIDE) adjunta
    </p>
    <p style='margin: 0; color: #374151; font-size: 14px; line-height: 1.5;'>
        Encontrarás tu factura electrónica adjunta a este correo en formato PDF.<br>
        Consérvala como comprobante oficial de tu compra — tiene plena validez tributaria ante el SRI de Ecuador.
    </p>
</div>
" : "")}

<h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
    📦 ¿Qué sigue?
</h3>
<ul style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
    <li>Tu pedido será <strong>preparado</strong> en las próximas horas</li>
    <li>Será <strong>enviado</strong> en los próximos 2-3 días hábiles</li>
    {(!string.IsNullOrEmpty(numeroSeguimiento) ? $"<li>Usa tu número de seguimiento <strong>{numeroSeguimiento}</strong> para rastrear tu envío</li>" : "")}
    <li>Mantendremos comunicación durante todo el proceso</li>
</ul>

<p style='color: #28a745; font-size: 16px; line-height: 1.6; margin-top: 30px; text-align: center; font-weight: 600;'>
    ¡Gracias por confiar en nosotros! 🎉
</p>";

                return await EnviarEmail(
                    destinatario,
                    "✅ Pago Confirmado - ¡Tu Pedido Está en Camino!",
                    GetEmailTemplate("¡Pago Verificado!", "#28a745", "✅", contenido),
                    ridePdf,
                    nombreArchivoRide
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar email de pago verificado: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> EnviarEmailComprobanteRechazado(string destinatario, string nombreCliente, string codigoOrden, string motivo)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de comprobante rechazado NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                var motivoTexto = string.IsNullOrWhiteSpace(motivo)
                    ? "El comprobante no pudo ser verificado."
                    : motivo;

                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    Hola <strong>{nombreCliente}</strong>,
</p>
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
    Lamentamos informarte que tu comprobante de pago ha sido rechazado.
</p>

{GetInfoBox($@"
    <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
        <strong>📋 Código de Orden:</strong> <span style='font-family: monospace; background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px;'>{codigoOrden}</span>
    </p>
    <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
        <strong>❌ Estado:</strong> <span style='background-color: #dc3545; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;'>RECHAZADO</span>
    </p>
    <p style='margin: 0; color: #dc3545; font-size: 15px;'>
        <strong>📝 Motivo:</strong> {motivoTexto}
    </p>
", "#dc3545")}

<h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
    🔄 ¿Qué puedes hacer?
</h3>
<ul style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
    <li>Verifica que el comprobante sea <strong>legible</strong> y <strong>válido</strong></li>
    <li>Asegúrate de que el <strong>monto sea correcto</strong></li>
    <li>Sube un <strong>nuevo comprobante</strong> desde tu cuenta</li>
    <li>Contacta con soporte si necesitas ayuda</li>
</ul>

<p style='color: #6c757d; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;'>
    Estamos aquí para ayudarte. Contáctanos si tienes preguntas.
</p>";

                return await EnviarEmail(
                    destinatario,
                    "❌ Comprobante Rechazado - Acción Requerida",
                    GetEmailTemplate("Comprobante Rechazado", "#dc3545", "❌", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar email de comprobante rechazado: {ex.Message}");
                return false;
            }
        }

        // ============================================
        // EMAILS PARA ADMINISTRADOR
        // ============================================

        public async Task<bool> NotificarAdminNuevoVendedor(string nombreVendedor, string emailVendedor)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de notificación nuevo vendedor NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    Se ha registrado una nueva solicitud de vendedor en ASOSIEC.
</p>

{GetInfoBox($@"
    <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
        <strong>👤 Nombre:</strong> {nombreVendedor}
    </p>
    <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
        <strong>📧 Email:</strong> {emailVendedor}
    </p>
", "#ffc107")}

<h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
    📌 Acción Requerida:
</h3>
<p style='color: #495057; font-size: 15px; line-height: 1.6;'>
    Por favor, revisa la solicitud del vendedor en el panel de administración.
</p>

{GetButton("Ver Panel Admin", "http://localhost:4200/admin/usuarios", "#ac5d3e")}";

                return await EnviarEmail(
                    _adminEmail,
                    "🔔 Nueva Solicitud de Vendedor",
                    GetEmailTemplate("Nueva Solicitud de Vendedor", "#ffc107", "🔔", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al notificar admin nuevo vendedor: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> NotificarAdminNuevaCompra(string codigoOrden, string nombreCliente, string emailCliente, decimal total)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de notificación admin NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    Se ha registrado una nueva compra en ASOSIEC.
</p>

{GetInfoBox($@"
    <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
        <strong>👤 Cliente:</strong> {nombreCliente}
    </p>
    <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
        <strong>📧 Email:</strong> {emailCliente}
    </p>
    <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
        <strong>📋 Código de Orden:</strong> <span style='font-family: monospace; background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px;'>{codigoOrden}</span>
    </p>
    <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
        <strong>💰 Total:</strong> <span style='font-size: 20px; font-weight: 700; color: #ac5d3e;'>${total:N2}</span>
    </p>
", "#ac5d3e")}

<h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
    📌 Acción Requerida:
</h3>
<p style='color: #495057; font-size: 15px; line-height: 1.6;'>
    Por favor, verifica el comprobante de pago en el panel de administración.
</p>

{GetButton("Ver Panel Admin", "http://localhost:4200/admin/comprobantes", "#ac5d3e")}";

                return await EnviarEmail(
                    _adminEmail,
                    "🔔 Nueva Compra Registrada",
                    GetEmailTemplate("Nueva Compra Pendiente", "#ac5d3e", "🔔", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al notificar admin nueva compra: {ex.Message}");
                return false;
            }
        }

        // ============================================
        // EMAILS PARA VENDEDORES
        // ============================================

        public async Task<bool> EnviarEmailSolicitudVendedor(string destinatario, string nombreVendedor)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de solicitud vendedor NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    Hola <strong>{nombreVendedor}</strong>,
</p>
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
    Hemos recibido tu solicitud para convertirte en vendedor de ASOSIEC.
</p>

{GetInfoBox($@"
    <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
        <strong>📋 Estado:</strong> <span style='background-color: #ffc107; color: #000; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;'>EN REVISIÓN</span>
    </p>
    <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
        Tu solicitud está siendo revisada por nuestro equipo.
    </p>
", "#ffc107")}

<h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
    ⏰ ¿Qué sigue?
</h3>
<ul style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
    <li>Revisaremos tu perfil y documentación</li>
    <li>El proceso toma entre <strong>24-48 horas</strong></li>
    <li>Recibirás un email con nuestra decisión</li>
</ul>

<p style='color: #ac5d3e; font-size: 16px; line-height: 1.6; margin-top: 30px; text-align: center; font-weight: 600;'>
    ¡Gracias por tu interés en ser parte de nuestra comunidad! 💙
</p>";

                return await EnviarEmail(
                    destinatario,
                    "📋 Solicitud de Vendedor Recibida",
                    GetEmailTemplate("Solicitud Recibida", "#ac5d3e", "📋", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar email de solicitud vendedor: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> EnviarEmailVendedorAprobado(string destinatario, string nombreVendedor)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de vendedor aprobado NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    ¡Felicidades, <strong>{nombreVendedor}</strong>!
</p>
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
    Tu solicitud para convertirte en vendedor ha sido <strong style='color: #28a745;'>aprobada</strong> ✅
</p>

{GetInfoBox($@"
    <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
        <strong>✅ Estado:</strong> <span style='background-color: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;'>APROBADO</span>
    </p>
", "#28a745")}

<h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
    🎯 Ya puedes:
</h3>
<ul style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
    <li>Publicar tus productos en el marketplace</li>
    <li>Gestionar tu inventario y precios</li>
    <li>Ver tus ventas y estadísticas en tiempo real</li>
    <li>Responder a consultas de clientes</li>
</ul>

{GetButton("Iniciar Sesión", "http://localhost:4200/login", "#28a745")}

<p style='color: #28a745; font-size: 16px; line-height: 1.6; margin-top: 30px; text-align: center; font-weight: 600;'>
    ¡Bienvenido a nuestra comunidad de vendedores! 🤝
</p>";

                return await EnviarEmail(
                    destinatario,
                    "✅ ¡Solicitud Aprobada! - Ya eres Vendedor",
                    GetEmailTemplate("¡Felicidades!", "#28a745", "🎉", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar email de vendedor aprobado: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> EnviarEmailVendedorRechazado(string destinatario, string nombreVendedor, string motivo)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de vendedor rechazado NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                var motivoTexto = string.IsNullOrWhiteSpace(motivo)
                    ? "Tu solicitud no cumple con los requisitos actuales de nuestro marketplace."
                    : motivo;

                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    Hola <strong>{nombreVendedor}</strong>,
</p>
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
    Lamentamos informarte que tu solicitud para convertirte en vendedor no ha sido aprobada en este momento.
</p>

{GetInfoBox($@"
    <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
        <strong>❌ Estado:</strong> <span style='background-color: #dc3545; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;'>SOLICITUD RECHAZADA</span>
    </p>
    <p style='margin: 0; color: #dc3545; font-size: 15px;'>
        <strong>📝 Motivo:</strong> {motivoTexto}
    </p>
", "#dc3545")}

<h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
    🔄 ¿Qué puedes hacer?
</h3>
<ul style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
    <li>Revisar los requisitos para vendedores</li>
    <li>Contactarnos para obtener más información</li>
    <li>Mejorar tu perfil o documentación</li>
    <li>Volver a aplicar en el futuro</li>
</ul>

{GetButton("Contactar Soporte", "mailto:kevinvizuetaj@gmail.com", "#ac5d3e")}

<p style='color: #6c757d; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;'>
    Si tienes preguntas, estamos aquí para ayudarte 💙
</p>";

                return await EnviarEmail(
                    destinatario,
                    "❌ Solicitud de Vendedor No Aprobada",
                    GetEmailTemplate("Solicitud No Aprobada", "#dc3545", "❌", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar email de vendedor rechazado: {ex.Message}");
                return false;
            }
        }

        // ============================================
        // ✅ NOTIFICACIÓN DE VENTA AL VENDEDOR
        // ============================================

        public async Task<bool> NotificarVendedorVenta(string emailVendedor, string nombreVendedor, string nombreProducto, int cantidad, decimal precioUnitario, decimal totalVenta, string codigoOrden)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de notificación venta NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                Console.WriteLine($"📧 Notificando venta al vendedor: {nombreVendedor}");

                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    ¡Hola <strong>{nombreVendedor}</strong>!
</p>
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
    ¡Felicidades! Se ha confirmado una venta de tu producto.
</p>

{GetInfoBox($@"
    <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
        <strong>📦 Producto:</strong> {nombreProducto}
    </p>
    <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
        <strong>🔢 Cantidad:</strong> {cantidad} unidad(es)
    </p>
    <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
        <strong>💰 Precio Unitario:</strong> ${precioUnitario:N2}
    </p>
    <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
        <strong>💵 Total de esta venta:</strong> <span style='font-size: 18px; font-weight: 700; color: #28a745;'>${totalVenta:N2}</span>
    </p>
    <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
        <strong>📋 Código de Orden:</strong> <span style='font-family: monospace; background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px;'>{codigoOrden}</span>
    </p>
", "#28a745")}

<h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
    📌 Próximos pasos:
</h3>
<ol style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
    <li>Prepara el producto para envío</li>
    <li>Coordina la entrega con el cliente</li>
    <li>Actualiza el estado del pedido en tu panel</li>
</ol>

{GetButton("Ver Mis Ventas", "http://localhost:4200/vendedor/ventas", "#28a745")}

<p style='color: #28a745; font-size: 16px; line-height: 1.6; margin-top: 30px; text-align: center; font-weight: 600;'>
    ¡Gracias por ser parte de nuestra comunidad! 🎉
</p>";

                return await EnviarEmail(
                    emailVendedor,
                    $"🎉 ¡Nueva Venta Confirmada! - {nombreProducto}",
                    GetEmailTemplate("¡Felicidades por tu venta!", "#28a745", "🎉", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al notificar venta al vendedor: {ex.Message}");
                return false;
            }
        }

        // ============================================
        // ✅ NOTIFICACIÓN DE STOCK MÍNIMO AL VENDEDOR (NUEVO)
        // ============================================

        public async Task<bool> NotificarStockMinimo(string nombreProducto, int productoId, int stockActual, int stockMinimo, string nombreVendedor, string emailVendedor)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de stock mínimo NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                Console.WriteLine($"📧 Notificando stock mínimo al vendedor: {nombreVendedor}");

                var infoBox = GetInfoBox($@"
    <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
        <strong>📦 Producto:</strong> {nombreProducto}
    </p>
    <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
        <strong>🔢 ID Producto:</strong> {productoId}
    </p>
    <p style='margin: 0 0 10px 0; color: #ff9800; font-size: 15px;'>
        <strong>📊 Stock Actual:</strong> <span style='background-color: #ff9800; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;'>{stockActual} unidades</span>
    </p>
    <p style='margin: 0; color: #6c757d; font-size: 14px;'>
        <strong>⚠️ Nivel Mínimo Configurado:</strong> {stockMinimo} unidades
    </p>
", "#ff9800");

                var button = GetButton("Ir a Mis Productos", "http://localhost:4200/vendedor/productos", "#ac5d3e");

                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    ¡Hola <strong>{nombreVendedor}</strong>!
</p>
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
    Te informamos que uno de tus productos ha alcanzado el <strong style='color: #ff9800;'>nivel mínimo de stock</strong>.
</p>

{infoBox}

<h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
    📌 Acciones recomendadas:
</h3>
<ul style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
    <li>Reponer el inventario <strong>lo antes posible</strong></li>
    <li>Actualizar la cantidad de stock en tu panel</li>
    <li>Considerar aumentar el stock mínimo si la demanda es alta</li>
    <li>Revisar si hay órdenes de compra pendientes</li>
</ul>

{button}

<div style='background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 25px 0; border-radius: 6px;'>
    <p style='margin: 0; color: #856404; font-size: 14px; line-height: 1.6;'>
        💡 <strong>Importante:</strong> El stock está cerca de agotarse. Asegúrate de reponer antes de que llegue a cero para evitar perder ventas.
    </p>
</div>";

                return await EnviarEmail(
                    emailVendedor,
                    $"⚠️ Stock Mínimo Alcanzado - {nombreProducto}",
                    GetEmailTemplate("Stock en Nivel Mínimo", "#ff9800", "⚠️", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al notificar stock mínimo: {ex.Message}");
                return false;
            }
        }


        // ============================================
        // ✅ NOTIFICACIÓN DE STOCK AGOTADO AL VENDEDOR
        // ============================================

        public async Task<bool> NotificarStockAgotado(string nombreProducto, int productoId, string nombreVendedor, string emailVendedor)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de stock agotado NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                Console.WriteLine($"📧 Notificando stock agotado al vendedor: {nombreVendedor}");

                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    ¡Hola <strong>{nombreVendedor}</strong>!
</p>
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
    Te informamos que uno de tus productos se ha <strong style='color: #dc3545;'>agotado</strong>.
</p>

{GetInfoBox($@"
    <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
        <strong>📦 Producto:</strong> {nombreProducto}
    </p>
    <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
        <strong>🔢 ID Producto:</strong> {productoId}
    </p>
    <p style='margin: 0; color: #dc3545; font-size: 15px;'>
        <strong>⚠️ Estado:</strong> <span style='background-color: #dc3545; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;'>STOCK AGOTADO</span>
    </p>
", "#dc3545")}

<h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
    📌 Acciones recomendadas:
</h3>
<ul style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
    <li>Reponer el inventario lo antes posible</li>
    <li>Actualizar la cantidad de stock en tu panel</li>
    <li>Considerar ajustar el precio si es necesario</li>
</ul>

{GetButton("Ir a Mis Productos", "http://localhost:4200/vendedor/productos", "#ac5d3e")}

<p style='color: #6c757d; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;'>
    Mantén tu inventario actualizado para no perder ventas 📊
</p>";

                return await EnviarEmail(
                    emailVendedor,
                    $"⚠️ Stock Agotado - {nombreProducto}",
                    GetEmailTemplate("Stock Agotado", "#dc3545", "⚠️", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al notificar stock agotado: {ex.Message}");
                return false;
            }
        }

        // ============================================
        // ✅ EMAIL DE CONFIRMACIÓN DE SOLICITUD DE DEVOLUCIÓN (CLIENTE)
        // ============================================
        public async Task<bool> EnviarEmailSolicitudDevolucion(
            string emailCliente,
            string nombreCliente,
            string tokenOrden,
            string tipoDevolucion,
            string motivo,
            int devolucionId)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de solicitud de devolución NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                Console.WriteLine($"📧 Enviando confirmación de devolución a: {emailCliente}");

                var contenido = $@"
            <p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
                Hola <strong>{nombreCliente}</strong>,
            </p>
            <p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                Hemos recibido tu solicitud de devolución y está siendo procesada por nuestro equipo.
            </p>

            {GetInfoBox($@"
                <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>📋 ID Solicitud:</strong> <span style='font-family: monospace; background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px;'>{devolucionId}</span>
                </p>
                <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>📦 Orden:</strong> #{tokenOrden}
                </p>
                <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>🔄 Tipo:</strong> {tipoDevolucion}
                </p>
                <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
                    <strong>📝 Motivo:</strong> {motivo}
                </p>
            ", "#ac5d3e")}

            <h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
                ⏳ ¿Qué sigue ahora?
            </h3>
            <ol style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
                <li>Nuestro equipo revisará tu solicitud en las próximas <strong>24-48 horas</strong></li>
                <li>Evaluaremos la evidencia proporcionada</li>
                <li>Te notificaremos por email sobre la decisión</li>
                <li>Si es aprobada, te enviaremos los detalles del reembolso/cambio</li>
            </ol>

            <div style='background-color: #e7f3ff; border-left: 4px solid #ac5d3e; padding: 15px; margin: 25px 0; border-radius: 6px;'>
                <p style='margin: 0; color: #1a3a52; font-size: 14px; line-height: 1.6;'>
                    💡 <strong>Tip:</strong> Puedes consultar el estado de tu devolución en tu panel de usuario, sección ""Historial de Compras"".
                </p>
            </div>

            <p style='color: #6c757d; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;'>
                Gracias por tu paciencia 🙏
            </p>";

                return await EnviarEmail(
                    emailCliente,
                    $"✅ Solicitud de Devolución Recibida - Orden #{tokenOrden}",
                    GetEmailTemplate("Solicitud Recibida", "#ac5d3e", "📥", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar email de solicitud de devolución: {ex.Message}");
                return false;
            }
        }

        // ============================================
        // ✅ EMAIL DE DEVOLUCIÓN APROBADA (CLIENTE)
        // ============================================
        public async Task<bool> EnviarEmailDevolucionAprobada(
            string emailCliente,
            string nombreCliente,
            string tokenOrden,
            string tipoDevolucion,
            decimal totalDevolucion,
            string numeroSeguimiento,
            string respuestaAdmin = null)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de devolución aprobada NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                Console.WriteLine($"📧 Enviando aprobación de devolución a: {emailCliente}");

                var comentariosAdmin = string.IsNullOrEmpty(respuestaAdmin) ? "" : $@"
            <div style='background-color: #f8f9fa; border-left: 4px solid #ac5d3e; padding: 15px; margin: 25px 0; border-radius: 6px;'>
                <p style='margin: 0 0 8px 0; color: #2c3e50; font-size: 14px; font-weight: 600;'>
                    💬 Comentarios del Administrador:
                </p>
                <p style='margin: 0; color: #495057; font-size: 14px; line-height: 1.6;'>
                    {respuestaAdmin}
                </p>
            </div>";

                var contenido = $@"
            <p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
                Estimado/a <strong>{nombreCliente}</strong>,
            </p>
            <p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                ¡Buenas noticias! Tu solicitud de devolución ha sido <strong style='color: #22c55e;'>APROBADA</strong>.
            </p>

            {GetInfoBox($@"
                <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>📦 Orden:</strong> #{tokenOrden}
                </p>
                <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>🔄 Tipo:</strong> {tipoDevolucion}
                </p>
                <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>💰 Monto:</strong> <span style='font-size: 18px; font-weight: 700; color: #22c55e;'>${totalDevolucion:N2}</span>
                </p>
                <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
                    <strong>📮 N° Seguimiento:</strong> <span style='font-family: monospace; background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px;'>{numeroSeguimiento}</span>
                </p>
            ", "#22c55e")}

            <h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
                📌 Próximos Pasos:
            </h3>
            <p style='color: #495057; font-size: 15px; line-height: 1.8; margin-bottom: 15px;'>
                {(tipoDevolucion == "REEMBOLSO" ?
                $"El reembolso de <strong>${totalDevolucion:N2}</strong> será procesado en los próximos <strong>3-5 días hábiles</strong> a tu método de pago original." :
                "Nos pondremos en contacto contigo para coordinar el cambio del producto.")}
            </p>

            {comentariosAdmin}

            <p style='color: #6c757d; font-size: 14px; line-height: 1.6; margin-top: 30px; padding: 15px; background-color: #f0fdf4; border-radius: 6px; border: 1px solid #22c55e33;'>
                ✅ <strong>Estado:</strong> Tu devolución ha sido aprobada y está en proceso. Puedes rastrearla con el número de seguimiento proporcionado.
            </p>";

                return await EnviarEmail(
                    emailCliente,
                    $"✅ Devolución Aprobada - Orden #{tokenOrden}",
                    GetEmailTemplate("¡Devolución Aprobada!", "#22c55e", "✅", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar email de devolución aprobada: {ex.Message}");
                return false;
            }
        }

        // ============================================
        // ✅ EMAIL DE DEVOLUCIÓN RECHAZADA (CLIENTE)
        // ============================================
        public async Task<bool> EnviarEmailDevolucionRechazada(
            string emailCliente,
            string nombreCliente,
            string tokenOrden,
            string tipoDevolucion,
            string motivo,
            string respuestaAdmin)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Email de devolución rechazada NO enviado - emails deshabilitados");
                return true;
            }

            try
            {
                Console.WriteLine($"📧 Enviando rechazo de devolución a: {emailCliente}");

                var contenido = $@"
            <p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
                Estimado/a <strong>{nombreCliente}</strong>,
            </p>
            <p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                Lamentamos informarte que tu solicitud de devolución <strong style='color: #ef4444;'>NO HA SIDO APROBADA</strong>.
            </p>

            {GetInfoBox($@"
                <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>📦 Orden:</strong> #{tokenOrden}
                </p>
                <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>🔄 Tipo Solicitado:</strong> {tipoDevolucion}
                </p>
                <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
                    <strong>📝 Tu Motivo:</strong> {motivo}
                </p>
            ", "#ef4444")}

            <h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
                📋 Motivo del Rechazo:
            </h3>
            <div style='background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 6px;'>
                <p style='margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.8;'>
                    {respuestaAdmin}
                </p>
            </div>

            <h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
                💬 ¿Tienes dudas?
            </h3>
            <p style='color: #495057; font-size: 15px; line-height: 1.8; margin-bottom: 15px;'>
                Si no estás de acuerdo con esta decisión o deseas más información, puedes contactarnos:
            </p>
            <ul style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
                <li><strong>Email:</strong> soporte@asosiec.com</li>
                <li><strong>Teléfono:</strong> (593) 1234-5678</li>
                <li><strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</li>
            </ul>

            <p style='color: #6c757d; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;'>
                Estamos aquí para ayudarte 🙏
            </p>";

                return await EnviarEmail(
                    emailCliente,
                    $"❌ Devolución No Aprobada - Orden #{tokenOrden}",
                    GetEmailTemplate("Actualización de tu Solicitud", "#ef4444", "ℹ️", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar email de devolución rechazada: {ex.Message}");
                return false;
            }
        }

        // ============================================
        // ✅ NOTIFICACIÓN AL VENDEDOR (NUEVA SOLICITUD DE DEVOLUCIÓN)
        // ============================================
        public async Task<bool> NotificarVendedorSolicitudDevolucion(
            string emailVendedor,
            string nombreVendedor,
            string tokenOrden,
            string nombreCliente,
            string tipoDevolucion,
            string motivo)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Notificación al vendedor NO enviada - emails deshabilitados");
                return true;
            }

            try
            {
                Console.WriteLine($"📧 Notificando solicitud de devolución al vendedor: {nombreVendedor}");

                var contenido = $@"
            <p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
                ¡Hola <strong>{nombreVendedor}</strong>!
            </p>
            <p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                Te informamos que se ha recibido una <strong>solicitud de devolución</strong> para uno de tus productos.
            </p>

            {GetInfoBox($@"
                <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>📦 Orden:</strong> #{tokenOrden}
                </p>
                <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>👤 Cliente:</strong> {nombreCliente}
                </p>
                <p style='margin: 0 0 12px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>🔄 Tipo:</strong> {tipoDevolucion}
                </p>
                <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
                    <strong>📝 Motivo:</strong> {motivo}
                </p>
            ", "#ff9800")}

            <h3 style='color: #2c3e50; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;'>
                ℹ️ Información Importante:
            </h3>
            <ul style='color: #495057; font-size: 15px; line-height: 1.8; padding-left: 20px;'>
                <li>La solicitud está siendo <strong>revisada por el administrador</strong></li>
                <li>Recibirás una notificación cuando se tome una decisión</li>
                <li>Si es aprobada, el monto será ajustado automáticamente</li>
                <li>Puedes revisar los detalles completos en tu panel de vendedor</li>
            </ul>

            <div style='background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 25px 0; border-radius: 6px;'>
                <p style='margin: 0; color: #856404; font-size: 14px; line-height: 1.6;'>
                    ⚠️ <strong>Nota:</strong> Por favor, espera la decisión del administrador antes de tomar cualquier acción.
                </p>
            </div>";

                return await EnviarEmail(
                    emailVendedor,
                    $"🔔 Nueva Solicitud de Devolución - Orden #{tokenOrden}",
                    GetEmailTemplate("Solicitud de Devolución", "#ff9800", "🔔", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al notificar vendedor sobre devolución: {ex.Message}");
                return false;
            }
        }

        // ============================================
        // ✅ ALERTA AL ADMINISTRADOR (NUEVA SOLICITUD)
        // ============================================
        public async Task<bool> AlertarAdminSolicitudDevolucion(
            string tokenOrden,
            string nombreCliente,
            string emailCliente,
            string tipoDevolucion,
            string motivo,
            decimal totalOrden,
            int devolucionId)
        {
            // ✅ VERIFICAR SI LOS EMAILS ESTÁN HABILITADOS
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                Console.WriteLine("⭐️ Alerta al admin NO enviada - emails deshabilitados");
                return true;
            }

            try
            {
                Console.WriteLine($"📧 Enviando alerta de devolución al administrador");

                var contenido = $@"
            <div style='background-color: #fef2f2; border: 2px solid #ef4444; padding: 20px; margin: 0 0 25px 0; border-radius: 8px;'>
                <h3 style='margin: 0 0 10px 0; color: #dc2626; font-size: 18px;'>
                    ⚠️ ACCIÓN REQUERIDA
                </h3>
                <p style='margin: 0; color: #7f1d1d; font-size: 14px;'>
                    Se ha recibido una nueva solicitud de devolución que requiere tu revisión inmediata.
                </p>
            </div>

            {GetInfoBox($@"
                <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>🆔 ID Devolución:</strong> {devolucionId}
                </p>
                <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>📦 Orden:</strong> #{tokenOrden}
                </p>
                <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>👤 Cliente:</strong> {nombreCliente} ({emailCliente})
                </p>
                <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>🔄 Tipo:</strong> {tipoDevolucion}
                </p>
                <p style='margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;'>
                    <strong>💰 Total Orden:</strong> ${totalOrden:N2}
                </p>
                <p style='margin: 0; color: #2c3e50; font-size: 15px;'>
                    <strong>📝 Motivo:</strong> {motivo}
                </p>
            ", "#ac5d3e")}

            <div style='background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 6px;'>
                <p style='margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;'>
                    ⏰ <strong>Tiempo de Respuesta Sugerido:</strong> 24-48 horas
                </p>
            </div>

            {GetButton("Revisar en Panel de Administración", "http://localhost:4200/admin-devoluciones", "#ac5d3e")}

            <p style='color: #6c757d; font-size: 13px; line-height: 1.6; margin-top: 30px; text-align: center;'>
                Fecha de solicitud: {DateTime.Now:dd/MM/yyyy HH:mm:ss}
            </p>";

                return await EnviarEmail(
                    _adminEmail,
                    $"🚨 URGENTE: Nueva Solicitud de Devolución - Orden #{tokenOrden}",
                    GetEmailTemplate("Acción Requerida", "#ef4444", "⚠️", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al alertar administrador sobre devolución: {ex.Message}");
                return false;
            }
        }

        // ============================================================
        // ✅ EMAIL CÓDIGO DE RECUPERACIÓN DE CONTRASEÑA (6 DÍGITOS)
        // Agregar este método ANTES del "MÉTODO AUXILIAR PARA ENVIAR EMAILS"
        // ============================================================
        public async Task<bool> EnviarCodigoRecuperacion(string destinatario, string nombreUsuario, string codigo)
        {
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                return true;
            }

            try
            {
                Console.WriteLine($"📧 Enviando código de recuperación a: {destinatario}");

                var contenido = $@"
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
    Hola <strong>{nombreUsuario}</strong>,
</p>
<p style='color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
    Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código de verificación:
</p>

<div style='text-align: center; margin: 35px 0;'>
    <div style='display: inline-block; background: linear-gradient(135deg, #ac5d3e 0%, #8b4a2f 100%); padding: 3px; border-radius: 16px;'>
        <div style='background: #ffffff; border-radius: 14px; padding: 24px 40px;'>
            <p style='margin: 0 0 6px 0; color: #6c757d; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase;'>
                Código de verificación
            </p>
            <p style='margin: 0; font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #ac5d3e; font-family: monospace;'>
                {codigo}
            </p>
        </div>
    </div>
</div>

{GetInfoBox($@"
    <p style='margin: 0 0 8px 0; color: #856404; font-size: 14px;'>
        ⏰ <strong>Este código expira en 15 minutos.</strong>
    </p>
    <p style='margin: 0; color: #856404; font-size: 14px;'>
        Si no solicitaste este cambio, ignora este correo. Tu contraseña no será modificada.
    </p>
", "#ffc107")}

<h3 style='color: #2c3e50; font-size: 16px; font-weight: 600; margin: 25px 0 12px 0;'>
    🔒 Consejos de seguridad:
</h3>
<ul style='color: #495057; font-size: 14px; line-height: 1.8; padding-left: 20px;'>
    <li>Nunca compartas este código con nadie</li>
    <li>ASOSIEC jamás te pedirá este código por teléfono o chat</li>
    <li>Si no reconoces esta solicitud, cambia tu contraseña inmediatamente</li>
</ul>

<p style='color: #adb5bd; font-size: 13px; margin-top: 30px; text-align: center;'>
    Solicitud realizada el {DateTime.Now:dd/MM/yyyy} a las {DateTime.Now:HH:mm} (hora del servidor)
</p>";

                return await EnviarEmail(
                    destinatario,
                    "🔐 Código de verificación para restablecer tu contraseña",
                    GetEmailTemplate("Código de Verificación", "#ac5d3e", "🔐", contenido)
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar código de recuperación: {ex.Message}");
                return false;
            }
        }


        // ============================================
        // MÉTODO AUXILIAR PARA ENVIAR EMAILS
        // ============================================

        private async Task<bool> EnviarEmail(string destinatario, string asunto, string cuerpoHtml,
            byte[] adjuntoPdf = null, string nombreAdjunto = null)
        {
            // ✅ VERIFICACIÓN DOBLE - POR SI ACASO
            if (!EmailsHabilitados())
            {
                Console.WriteLine("⚠️ Los emails están DESHABILITADOS en la configuración");
                return true;
            }

            try
            {
                using (var client = new SmtpClient(_smtpHost, _smtpPort))
                {
                    client.EnableSsl = true;
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(_fromEmail, _fromPassword);

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(_fromEmail, "ASOSIEC"),
                        Subject = asunto,
                        Body = cuerpoHtml,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(destinatario);

                    // ✅ ADJUNTAR PDF SI SE PROPORCIONÓ
                    if (adjuntoPdf != null && adjuntoPdf.Length > 0 && !string.IsNullOrEmpty(nombreAdjunto))
                    {
                        var ms = new System.IO.MemoryStream(adjuntoPdf);
                        var adjunto = new Attachment(ms, nombreAdjunto, "application/pdf");
                        mailMessage.Attachments.Add(adjunto);
                        Console.WriteLine($"📎 PDF adjunto: {nombreAdjunto} ({adjuntoPdf.Length / 1024} KB)");
                    }

                    await client.SendMailAsync(mailMessage);
                    Console.WriteLine($"✅ Email enviado exitosamente a {destinatario}");
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar email a {destinatario}: {ex.Message}");
                Console.WriteLine($"   Stack trace: {ex.StackTrace}");
                return false;
            }
        }
    }
}