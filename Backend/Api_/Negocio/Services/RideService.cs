using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.IO.Font.Constants;
using iText.Barcodes;
using iText.Kernel.Geom;

namespace Negocio.Services
{
    /// <summary>
    /// Genera el RIDE (Representación Impresa del Documento Electrónico)
    /// conforme a los requisitos del SRI Ecuador.
    /// 
    /// El RIDE es el PDF que se adjunta al correo del cliente cuando
    /// el admin aprueba el comprobante de pago.
    /// 
    /// Campos obligatorios según SRI (Ficha Técnica v2.26):
    ///   - RUC del emisor
    ///   - Razón social / Nombre comercial
    ///   - Dirección matriz y establecimiento
    ///   - Número de autorización SRI (49 dígitos) o temporal
    ///   - Fecha de autorización
    ///   - Ambiente (Pruebas / Producción)
    ///   - Número de factura (001-001-XXXXXXXXX)
    ///   - Datos del comprador (RUC/Cédula, razón social)
    ///   - Fecha de emisión
    ///   - Detalle de productos/servicios
    ///   - Subtotal, IVA 13%, TOTAL
    ///   - Forma de pago
    ///   - Código de barras GS1-128 (clave de acceso 49 dígitos)
    /// </summary>
    public class RideService
    {
        // ============================================
        // DATOS DE LA EMPRESA EMISORA
        // Estos se deben cambiar por los datos reales del negocio
        // ============================================
        private const string RAZON_SOCIAL = "ASOSIEC S.A.";
        private const string NOMBRE_COMERCIAL = "ASOSIEC - Artesanías Ecoamigables";
        private const string RUC_EMISOR = "0993402393001";   // ← reemplazar con RUC real
        private const string DIRECCION_MATRIZ= "Guayaquil, Parroquia Febres Cordero";
        private const string DIRECCION_ESTAB = "Capitan Najera 4806 20";
        private const string CONTRIBUYENTE_ESPECIAL = "";         // número si aplica, vacío si no
        private const bool OBLIGADO_CONTABILIDAD = true;
        private const string AMBIENTE = "PRODUCCIÓN";             // "PRUEBAS" o "PRODUCCIÓN"
        private const string SERIE = "001-001";                // establecimiento-punto emisión
        private const decimal IVA_PORCENTAJE = 0.15m;            // 13% IVA Ecuador 2024

        // ============================================
        // COLORES CORPORATIVOS
        // ============================================
        private static readonly Color COLOR_PRIMARIO = new DeviceRgb(172, 93, 62);   // terracota
        private static readonly Color COLOR_OSCURO = new DeviceRgb(139, 74, 47);
        private static readonly Color COLOR_GRIS = new DeviceRgb(100, 100, 100);
        private static readonly Color COLOR_GRIS_CLARO = new DeviceRgb(245, 245, 245);
        private static readonly Color COLOR_BLANCO = ColorConstants.WHITE;
        private static readonly Color COLOR_NEGRO = ColorConstants.BLACK;
        private static readonly Color COLOR_VERDE = new DeviceRgb(39, 174, 96);

        public class ItemFactura
        {
            public string Descripcion { get; set; }
            public int Cantidad { get; set; }
            public decimal PrecioUnit { get; set; }
            public decimal Descuento { get; set; } = 0;
            public decimal Total => (Cantidad * PrecioUnit) - Descuento;
        }

        public class DatosFactura
        {
            public string TokenOrden { get; set; }
            public string NumeroFactura { get; set; }  // ej: 001-001-000000001
            public DateTime FechaEmision { get; set; }
            public string NombreCliente { get; set; }
            public string EmailCliente { get; set; }
            public string CedulaRucCliente { get; set; } = "9999999999999"; // consumidor final
            public string DireccionCliente { get; set; }
            public string TelefonoCliente { get; set; }
            public string FormaPago { get; set; } = "Transferencia Bancaria";
            public List<ItemFactura> Items { get; set; } = new();
            public decimal CostoEnvio { get; set; }
            public string ClaveAcceso { get; set; }  // 49 dígitos SRI
            public string NumeroAutorizacion { get; set; }
            public DateTime? FechaAutorizacion { get; set; }
        }

        /// <summary>
        /// Genera el PDF del RIDE y lo devuelve como byte[].
        /// </summary>
        public byte[] GenerarRide(DatosFactura datos)
        {
            using var ms = new MemoryStream();
            var writer = new PdfWriter(ms);
            var pdfDoc = new PdfDocument(writer);
            var doc = new Document(pdfDoc, PageSize.A4);

            doc.SetMargins(20, 25, 20, 25);

            PdfFont fontBold = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
            PdfFont fontNormal = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);

            // ── Calcular totales ──────────────────────────────────
            decimal subtotal0 = 0;
            decimal subtotalGravado = datos.Items.Sum(i => i.Total) + datos.CostoEnvio;
            decimal iva = Math.Round(subtotalGravado * IVA_PORCENTAJE, 2);
            decimal totalFinal = subtotalGravado + iva;

            // Número de autorización para mostrar (se trunca a 49 si viene más largo)
            string numAuth = string.IsNullOrEmpty(datos.NumeroAutorizacion)
                ? GenerarClaveAccesoTemporal(datos)
                : datos.NumeroAutorizacion;

            string claveAcceso = string.IsNullOrEmpty(datos.ClaveAcceso)
                ? numAuth
                : datos.ClaveAcceso;

            // ── SECCIÓN SUPERIOR: emisor + datos de autorización ──
            var tablaHeader = new Table(UnitValue.CreatePercentArray(new float[] { 50, 50 }))
                .UseAllAvailableWidth();

            // Celda izquierda: datos del emisor
            var celdaEmisor = new Cell()
                .SetBorder(new iText.Layout.Borders.SolidBorder(COLOR_PRIMARIO, 2))
                .SetPadding(10);

            celdaEmisor.Add(new Paragraph(RAZON_SOCIAL)
                .SetFont(fontBold).SetFontSize(13).SetFontColor(COLOR_PRIMARIO));
            celdaEmisor.Add(new Paragraph(NOMBRE_COMERCIAL)
                .SetFont(fontNormal).SetFontSize(9).SetFontColor(COLOR_GRIS));
            celdaEmisor.Add(new Paragraph($"Dir. Matriz: {DIRECCION_MATRIZ}")
                .SetFont(fontNormal).SetFontSize(8).SetMarginTop(4));
            celdaEmisor.Add(new Paragraph($"Dir. Establecimiento: {DIRECCION_ESTAB}")
                .SetFont(fontNormal).SetFontSize(8));
            if (!string.IsNullOrEmpty(CONTRIBUYENTE_ESPECIAL))
                celdaEmisor.Add(new Paragraph($"Contribuyente Especial Nro: {CONTRIBUYENTE_ESPECIAL}")
                    .SetFont(fontNormal).SetFontSize(8));
            celdaEmisor.Add(new Paragraph($"Obligado a llevar Contabilidad: {(OBLIGADO_CONTABILIDAD ? "SÍ" : "NO")}")
                .SetFont(fontNormal).SetFontSize(8));

            tablaHeader.AddCell(celdaEmisor);

            // Celda derecha: RUC, nº factura, autorización
            var celdaAutorizacion = new Cell()
                .SetBorder(new iText.Layout.Borders.SolidBorder(COLOR_PRIMARIO, 2))
                .SetPadding(10)
                .SetBackgroundColor(COLOR_GRIS_CLARO);

            celdaAutorizacion.Add(new Paragraph("R.U.C.")
                .SetFont(fontBold).SetFontSize(8).SetFontColor(COLOR_GRIS).SetMarginBottom(0));
            celdaAutorizacion.Add(new Paragraph(RUC_EMISOR)
                .SetFont(fontBold).SetFontSize(12).SetFontColor(COLOR_NEGRO).SetMarginTop(0));

            celdaAutorizacion.Add(new Paragraph("FACTURA")
                .SetFont(fontBold).SetFontSize(10).SetFontColor(COLOR_PRIMARIO).SetMarginTop(6));
            celdaAutorizacion.Add(new Paragraph($"Nº {datos.NumeroFactura}")
                .SetFont(fontBold).SetFontSize(11));

            celdaAutorizacion.Add(new Paragraph($"NÚMERO DE AUTORIZACIÓN")
                .SetFont(fontBold).SetFontSize(7).SetFontColor(COLOR_GRIS).SetMarginTop(6));
            celdaAutorizacion.Add(new Paragraph(numAuth)
                .SetFont(fontNormal).SetFontSize(7).SetWordSpacing(1));

            celdaAutorizacion.Add(new Paragraph($"Fecha y Hora de Autorización: {(datos.FechaAutorizacion?.ToString("dd/MM/yyyy HH:mm:ss") ?? datos.FechaEmision.ToString("dd/MM/yyyy HH:mm:ss"))}")
                .SetFont(fontNormal).SetFontSize(7).SetMarginTop(3));

            celdaAutorizacion.Add(new Paragraph($"Ambiente: {AMBIENTE}")
                .SetFont(fontBold).SetFontSize(8).SetFontColor(COLOR_VERDE).SetMarginTop(3));
            celdaAutorizacion.Add(new Paragraph("Emisión: NORMAL")
                .SetFont(fontNormal).SetFontSize(7));

            tablaHeader.AddCell(celdaAutorizacion);
            doc.Add(tablaHeader);

            // ── CÓDIGO DE BARRAS (clave de acceso 49 dígitos) ─────
            doc.Add(new Paragraph("\n").SetFontSize(3));
            try
            {
                var barcode = new BarcodeEAN(pdfDoc);
                // Para SRI se usa Code128 que soporta los 49 dígitos
                var barcode128 = new Barcode128(pdfDoc);
                barcode128.SetCode(claveAcceso.Length > 49 ? claveAcceso.Substring(0, 49) : claveAcceso);
                barcode128.SetBarHeight(25);
                barcode128.SetX(1.2f);

                var barcodeImage = new Image(barcode128.CreateFormXObject(pdfDoc))
                    .SetHorizontalAlignment(HorizontalAlignment.CENTER)
                    .SetWidth(400);
                doc.Add(barcodeImage);
            }
            catch
            {
                // Si falla el código de barras, mostrar la clave de acceso en texto
                doc.Add(new Paragraph($"Clave de acceso: {claveAcceso}")
                    .SetFont(fontNormal).SetFontSize(7)
                    .SetTextAlignment(TextAlignment.CENTER));
            }

            doc.Add(new Paragraph("\n").SetFontSize(4));

            // ── DATOS DEL COMPRADOR ───────────────────────────────
            var tablaComprador = new Table(UnitValue.CreatePercentArray(new float[] { 25, 40, 15, 20 }))
                .UseAllAvailableWidth()
                .SetMarginTop(4);

            AgregarCeldaEncabezado(tablaComprador, "Razón Social / Nombres y Apellidos:", fontBold);
            AgregarCeldaDato(tablaComprador, datos.NombreCliente, fontNormal, 1);
            AgregarCeldaEncabezado(tablaComprador, "Fecha de Emisión:", fontBold);
            AgregarCeldaDato(tablaComprador, datos.FechaEmision.ToString("dd/MM/yyyy"), fontNormal, 1);

            AgregarCeldaEncabezado(tablaComprador, "Identificación:", fontBold);
            AgregarCeldaDato(tablaComprador, datos.CedulaRucCliente, fontNormal, 1);
            AgregarCeldaEncabezado(tablaComprador, "Guía de Remisión:", fontBold);
            AgregarCeldaDato(tablaComprador, "—", fontNormal, 1);

            AgregarCeldaEncabezado(tablaComprador, "Dirección de Entrega:", fontBold);
            AgregarCeldaDato(tablaComprador, datos.DireccionCliente ?? "—", fontNormal, 3);

            doc.Add(tablaComprador);
            doc.Add(new Paragraph("\n").SetFontSize(4));

            // ── DETALLE DE PRODUCTOS ──────────────────────────────
            var tablaDetalle = new Table(UnitValue.CreatePercentArray(new float[] { 8, 40, 17, 17, 18 }))
                .UseAllAvailableWidth();

            // Encabezados
            foreach (var header in new[] { "Cant.", "Descripción", "Precio Unit.", "Descuento", "Total" })
            {
                tablaDetalle.AddHeaderCell(new Cell()
                    .SetBackgroundColor(COLOR_PRIMARIO)
                    .SetPadding(5)
                    .Add(new Paragraph(header)
                        .SetFont(fontBold).SetFontSize(8).SetFontColor(COLOR_BLANCO)));
            }

            // Filas de productos
            bool fila = false;
            foreach (var item in datos.Items)
            {
                var bg = fila ? COLOR_GRIS_CLARO : COLOR_BLANCO;
                tablaDetalle.AddCell(CeldaDetalle(item.Cantidad.ToString(), fontNormal, bg, TextAlignment.CENTER));
                tablaDetalle.AddCell(CeldaDetalle(item.Descripcion, fontNormal, bg, TextAlignment.LEFT));
                tablaDetalle.AddCell(CeldaDetalle($"${item.PrecioUnit:N2}", fontNormal, bg, TextAlignment.RIGHT));
                tablaDetalle.AddCell(CeldaDetalle(item.Descuento > 0 ? $"${item.Descuento:N2}" : "—", fontNormal, bg, TextAlignment.RIGHT));
                tablaDetalle.AddCell(CeldaDetalle($"${item.Total:N2}", fontBold, bg, TextAlignment.RIGHT));
                fila = !fila;
            }

            // Fila de envío si aplica
            if (datos.CostoEnvio > 0)
            {
                tablaDetalle.AddCell(CeldaDetalle("1", fontNormal, COLOR_BLANCO, TextAlignment.CENTER));
                tablaDetalle.AddCell(CeldaDetalle("Costo de Envío", fontNormal, COLOR_BLANCO, TextAlignment.LEFT));
                tablaDetalle.AddCell(CeldaDetalle($"${datos.CostoEnvio:N2}", fontNormal, COLOR_BLANCO, TextAlignment.RIGHT));
                tablaDetalle.AddCell(CeldaDetalle("—", fontNormal, COLOR_BLANCO, TextAlignment.RIGHT));
                tablaDetalle.AddCell(CeldaDetalle($"${datos.CostoEnvio:N2}", fontBold, COLOR_BLANCO, TextAlignment.RIGHT));
            }

            doc.Add(tablaDetalle);
            doc.Add(new Paragraph("\n").SetFontSize(4));

            // ── TOTALES + FORMA DE PAGO ───────────────────────────
            var tablaTotales = new Table(UnitValue.CreatePercentArray(new float[] { 60, 40 }))
                .UseAllAvailableWidth();

            // Celda izquierda: forma de pago
            var celdaPago = new Cell()
                .SetBorder(new iText.Layout.Borders.SolidBorder(COLOR_PRIMARIO, 1))
                .SetPadding(8);

            celdaPago.Add(new Paragraph("INFORMACIÓN DE PAGO")
                .SetFont(fontBold).SetFontSize(8).SetFontColor(COLOR_PRIMARIO));

            var tablaPago = new Table(UnitValue.CreatePercentArray(new float[] { 50, 50 })).UseAllAvailableWidth();
            tablaPago.AddCell(new Cell().SetBorder(iText.Layout.Borders.Border.NO_BORDER)
                .Add(new Paragraph("Forma de Pago:").SetFont(fontBold).SetFontSize(8)));
            tablaPago.AddCell(new Cell().SetBorder(iText.Layout.Borders.Border.NO_BORDER)
                .Add(new Paragraph(datos.FormaPago).SetFont(fontNormal).SetFontSize(8)));
            tablaPago.AddCell(new Cell().SetBorder(iText.Layout.Borders.Border.NO_BORDER)
                .Add(new Paragraph("Total Pagado:").SetFont(fontBold).SetFontSize(8)));
            tablaPago.AddCell(new Cell().SetBorder(iText.Layout.Borders.Border.NO_BORDER)
                .Add(new Paragraph($"${totalFinal:N2}").SetFont(fontBold).SetFontSize(8).SetFontColor(COLOR_VERDE)));
            tablaPago.AddCell(new Cell().SetBorder(iText.Layout.Borders.Border.NO_BORDER)
                .Add(new Paragraph("Plazo:").SetFont(fontBold).SetFontSize(8)));
            tablaPago.AddCell(new Cell().SetBorder(iText.Layout.Borders.Border.NO_BORDER)
                .Add(new Paragraph("0 días").SetFont(fontNormal).SetFontSize(8)));

            celdaPago.Add(tablaPago);
            tablaTotales.AddCell(celdaPago);

            // Celda derecha: subtotales / IVA / total
            var celdaTotales = new Cell()
                .SetBorder(new iText.Layout.Borders.SolidBorder(COLOR_PRIMARIO, 1))
                .SetPadding(8)
                .SetBackgroundColor(COLOR_GRIS_CLARO);

            void AgregarFila(string label, string valor, bool negrita = false)
            {
                var t = new Table(UnitValue.CreatePercentArray(new float[] { 55, 45 })).UseAllAvailableWidth();
                t.AddCell(new Cell().SetBorder(iText.Layout.Borders.Border.NO_BORDER)
                    .Add(new Paragraph(label).SetFont(negrita ? fontBold : fontNormal).SetFontSize(9)));
                t.AddCell(new Cell().SetBorder(iText.Layout.Borders.Border.NO_BORDER)
                    .Add(new Paragraph(valor).SetFont(negrita ? fontBold : fontNormal).SetFontSize(9)
                        .SetTextAlignment(TextAlignment.RIGHT)));
                celdaTotales.Add(t);
            }

            AgregarFila("Subtotal 0%:", $"${subtotal0:N2}");
            AgregarFila($"Subtotal Gravado (IVA {(IVA_PORCENTAJE * 100):0}%):", $"${subtotalGravado:N2}");
            AgregarFila($"IVA {(IVA_PORCENTAJE * 100):0}%:", $"${iva:N2}");
            AgregarFila("Descuento Total:", "$0.00");

            // Línea separadora
            celdaTotales.Add(new Paragraph("").SetBorderBottom(new iText.Layout.Borders.SolidBorder(COLOR_PRIMARIO, 1)));

            var tTotal = new Table(UnitValue.CreatePercentArray(new float[] { 55, 45 })).UseAllAvailableWidth();
            tTotal.AddCell(new Cell().SetBorder(iText.Layout.Borders.Border.NO_BORDER)
                .Add(new Paragraph("VALOR TOTAL:").SetFont(fontBold).SetFontSize(11).SetFontColor(COLOR_PRIMARIO)));
            tTotal.AddCell(new Cell().SetBorder(iText.Layout.Borders.Border.NO_BORDER)
                .Add(new Paragraph($"${totalFinal:N2}").SetFont(fontBold).SetFontSize(11).SetFontColor(COLOR_PRIMARIO)
                    .SetTextAlignment(TextAlignment.RIGHT)));
            celdaTotales.Add(tTotal);

            tablaTotales.AddCell(celdaTotales);
            doc.Add(tablaTotales);

            // ── INFORMACIÓN ADICIONAL ─────────────────────────────
            doc.Add(new Paragraph("\n").SetFontSize(4));
            var tablaInfo = new Table(UnitValue.CreatePercentArray(new float[] { 100 })).UseAllAvailableWidth();
            var celdaInfo = new Cell()
                .SetBorder(new iText.Layout.Borders.SolidBorder(COLOR_GRIS, 0.5f))
                .SetPadding(8)
                .SetBackgroundColor(new DeviceRgb(255, 250, 245));

            celdaInfo.Add(new Paragraph("INFORMACIÓN ADICIONAL")
                .SetFont(fontBold).SetFontSize(8).SetFontColor(COLOR_PRIMARIO));
            celdaInfo.Add(new Paragraph($"Código de Pedido: {datos.TokenOrden}   |   Email Cliente: {datos.EmailCliente}   |   Teléfono: {datos.TelefonoCliente ?? "—"}")
                .SetFont(fontNormal).SetFontSize(7).SetFontColor(COLOR_GRIS).SetMarginTop(4));

            tablaInfo.AddCell(celdaInfo);
            doc.Add(tablaInfo);

            // ── NOTA LEGAL SRI ────────────────────────────────────
            doc.Add(new Paragraph("\n").SetFontSize(4));
            doc.Add(new Paragraph("Este documento es la representación impresa de un Comprobante Electrónico (RIDE). " +
                "Su validez legal está sujeta a la autorización del Servicio de Rentas Internas del Ecuador (SRI). " +
                "Conserve este documento por un mínimo de 7 años según la normativa vigente.")
                .SetFont(fontNormal).SetFontSize(6.5f).SetFontColor(COLOR_GRIS)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginTop(8));

            doc.Close();
            return ms.ToArray();
        }

        // ── HELPERS INTERNOS ─────────────────────────────────────

        private void AgregarCeldaEncabezado(Table tabla, string texto, PdfFont font)
        {
            tabla.AddCell(new Cell()
                .SetBackgroundColor(COLOR_GRIS_CLARO)
                .SetPadding(4)
                .SetBorder(new iText.Layout.Borders.SolidBorder(new DeviceRgb(200, 200, 200), 0.5f))
                .Add(new Paragraph(texto).SetFont(font).SetFontSize(7.5f).SetFontColor(COLOR_GRIS)));
        }

        private void AgregarCeldaDato(Table tabla, string texto, PdfFont font, int colspan)
        {
            tabla.AddCell(new Cell(1, colspan)
                .SetPadding(4)
                .SetBorder(new iText.Layout.Borders.SolidBorder(new DeviceRgb(200, 200, 200), 0.5f))
                .Add(new Paragraph(texto ?? "—").SetFont(font).SetFontSize(8.5f)));
        }

        private Cell CeldaDetalle(string texto, PdfFont font, Color bg, TextAlignment align)
        {
            return new Cell()
                .SetBackgroundColor(bg)
                .SetPadding(4)
                .SetBorder(new iText.Layout.Borders.SolidBorder(new DeviceRgb(220, 220, 220), 0.3f))
                .Add(new Paragraph(texto).SetFont(font).SetFontSize(8.5f).SetTextAlignment(align));
        }

        /// <summary>
        /// Genera una clave de acceso temporal de 49 dígitos.
        /// En producción real esto vendría del WS del SRI.
        /// Formato: ddMMaaaa + 01 + RUC + 1/2 + serie + secuencial + código numérico + dígito verificador
        /// </summary>
        private string GenerarClaveAccesoTemporal(DatosFactura datos)
        {
            var fecha = datos.FechaEmision;
            var fechaStr = fecha.ToString("ddMMyyyy");
            var tipoComp = "01";                                // 01 = Factura
            var ruc = RUC_EMISOR;
            var ambiente = AMBIENTE == "PRODUCCIÓN" ? "2" : "1";
            var serie = SERIE.Replace("-", "");              // 001001
            var secuencial = datos.NumeroFactura.Split('-').Last().PadLeft(9, '0');
            var codNum = "12345678";
            var emision = "1";

            var base48 = $"{fechaStr}{tipoComp}{ruc}{ambiente}{serie}{secuencial}{codNum}{emision}";
            // Dígito verificador módulo 11
            int dv = CalcularDigitoVerificador(base48);

            return $"{base48}{dv}";
        }

        private int CalcularDigitoVerificador(string clave48)
        {
            int[] pesos = { 2, 3, 4, 5, 6, 7 };
            int suma = 0;
            for (int i = clave48.Length - 1, j = 0; i >= 0; i--, j++)
            {
                suma += int.Parse(clave48[i].ToString()) * pesos[j % 6];
            }
            int residuo = suma % 11;
            return residuo == 0 ? 0 : residuo == 1 ? 1 : 11 - residuo;
        }
    }
}