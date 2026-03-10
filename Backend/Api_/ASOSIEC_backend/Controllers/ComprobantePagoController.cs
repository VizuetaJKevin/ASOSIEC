using Entidad;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using Negocio.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using ASOSIEC.Services;


namespace tienda_instrumentos.Controllers
{
    // ============================================
    // ✅ NUEVO: Clase para recibir el motivo del rechazo en el body
    // ============================================
    public class RechazarComprobanteRequest
    {
        public string motivo { get; set; } = "";
    }

    [ApiController]
    [Route("api")]
    [Authorize]


    public class ComprobantePagoController : Controller
    {
        private readonly negocio _Helper;
        private readonly EmailService _emailService;
        private readonly RideService _rideService;

        public ComprobantePagoController(negocio helper, EmailService emailService, RideService rideService)
        {
            this._Helper = helper;
            this._emailService = emailService;
            this._rideService = rideService;
        }

        // ============================================
        // REGISTRAR COMPROBANTE (cuando el cliente finaliza la compra)
        // ============================================
        [HttpPost("RegistrarComprobante")]
        public async Task<IActionResult> RegistrarComprobante([FromBody] Entidad_ComprobantePago comprobante)
        {
            try
            {
                Console.WriteLine($"📦 Registrando comprobante para orden {comprobante.ordenId}");

                var Response = _Helper.Registrar("sp_Registrar_ComprobantePago", comprobante);

                if (Response)
                {
                    // ✅ Actualizar estado de la orden a "Comprobante Enviado"
                    var orden = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes")
                        .Where(o => o.id == comprobante.ordenId)
                        .FirstOrDefault();

                    if (orden != null)
                    {
                        orden.estadoOrdenId = 3; // 3 = COMPROBANTE_ENVIADO
                        _Helper.Actualizar("sp_Actualizar_Orden", orden);

                        // Enviar emails
                        await _emailService.EnviarEmailCompraPendiente(
                            orden.email,
                            $"{orden.nombre} {orden.apellido}",
                            orden.token_orden,
                            orden.total
                        );

                        await _emailService.NotificarAdminNuevaCompra(
                            orden.token_orden,
                            $"{orden.nombre} {orden.apellido}",
                            orden.email,
                            orden.total
                        );

                        Console.WriteLine($"✅ Comprobante registrado - Orden actualizada a estado 3 (COMPROBANTE_ENVIADO)");
                    }

                    return Ok(new
                    {
                        success = true,
                        mensaje = "Comprobante registrado correctamente.",
                        ordenId = comprobante.ordenId
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al registrar el comprobante."
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en RegistrarComprobante: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error interno del servidor",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR ÓRDENES CON COMPROBANTES (para el admin)
        // ✅ ACTUALIZADO: Ahora incluye comprobantes rechazados (estado 9)
        // ============================================
        [HttpGet("ConsultarOrdenesConComprobantes")]
        public IActionResult ConsultarOrdenesConComprobantes([FromQuery] bool? soloNoVerificados = null)
        {
            try
            {
                Console.WriteLine("📋 Admin consultando órdenes con comprobantes...");

                var comprobantes = _Helper.Consultar<Entidad_ComprobantePago>("sp_Consultar_ComprobantesPago");

                if (soloNoVerificados == true)
                {
                    comprobantes = comprobantes.Where(c => c.verificado == false).ToList();
                    Console.WriteLine($"   Filtrando solo NO verificados");
                }

                Console.WriteLine($"   Comprobantes encontrados: {comprobantes.Count}");

                var ordenesConComprobantes = new List<Entidad_OrdenConComprobante>();

                foreach (var comprobante in comprobantes)
                {
                    var orden = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes")
                        .Where(o => o.id == comprobante.ordenId)
                        .FirstOrDefault();

                    if (orden != null)
                    {
                        var usuario = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuario")
                            .Where(u => u.id == orden.usuarioId)
                            .FirstOrDefault();

                        ordenesConComprobantes.Add(new Entidad_OrdenConComprobante
                        {
                            Orden = orden,
                            Comprobante = comprobante,
                            Usuario = usuario
                        });

                        Console.WriteLine($"   ✅ Orden {orden.token_orden} - Verificado: {comprobante.verificado}");
                    }
                }

                ordenesConComprobantes = ordenesConComprobantes
                    .OrderByDescending(o => o.Comprobante.fecha_subida)
                    .ToList();

                Console.WriteLine($"✅ Total órdenes con comprobantes: {ordenesConComprobantes.Count}");

                return Ok(ordenesConComprobantes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarOrdenesConComprobantes: {ex.Message}");
                Console.WriteLine($"❌ Stack: {ex.StackTrace}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar órdenes con comprobantes",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // VERIFICAR COMPROBANTE (cuando el admin acepta el pago)
        // ✅ MANTIENE LA LÓGICA ORIGINAL - NO MODIFICADO
        // ============================================
        [HttpPut("VerificarComprobante/{id}/{adminId}")]
        public async Task<IActionResult> VerificarComprobante(int id, int adminId)
        {
            try
            {
                Console.WriteLine($"✅ Admin {adminId} verificando comprobante {id}");

                var verificado = _Helper.VerificarComprobante(id, adminId);

                if (verificado)
                {
                    var comprobante = _Helper.Consultar<Entidad_ComprobantePago>("sp_Consultar_ComprobantesPago")
                        .Where(c => c.id == id)
                        .FirstOrDefault();

                    if (comprobante != null)
                    {
                        var orden = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes")
                            .Where(o => o.id == comprobante.ordenId)
                            .FirstOrDefault();

                        if (orden != null)
                        {
                            // ✅ PASO 1: REDUCIR STOCK DE PRODUCTOS
                            var stockReducido = _Helper.ReducirStockPorOrden(orden.id);

                            if (!stockReducido)
                            {
                                Console.WriteLine($"⚠️ ADVERTENCIA: No se pudo reducir el stock para la orden {orden.id}");
                                return BadRequest(new
                                {
                                    success = false,
                                    mensaje = "Error al reducir el stock de los productos. Puede que no haya stock suficiente."
                                });
                            }

                            // ✅ PASO 2: ACTUALIZAR ESTADO DE LA ORDEN A PAGO_VERIFICADO
                            orden.estadoOrdenId = 4; // 4 = PAGO_VERIFICADO
                            var ordenActualizada = _Helper.Actualizar("sp_Actualizar_Orden", orden);

                            if (ordenActualizada)
                            {
                                Console.WriteLine($"✅ Orden {orden.id} actualizada a estado 4 (PAGO_VERIFICADO)");

                                // ✅ PASO 3: GENERAR NÚMERO DE SEGUIMIENTO
                                string numeroSeguimiento = $"ENV-{orden.id}-{DateTime.Now:yyyyMMddHHmm}";
                                Console.WriteLine($"📦 Número de seguimiento generado: {numeroSeguimiento}");

                                // ✅ PASO 4: GENERAR RIDE (FACTURA ELECTRÓNICA PDF)
                                byte[] ridePdf = null;
                                string nombreRide = null;
                                try
                                {
                                    ridePdf = await GenerarRideOrden(orden, comprobante);
                                    nombreRide = $"Factura_ASOSIEC_{orden.token_orden}_{DateTime.Now:yyyyMMdd}.pdf";
                                    Console.WriteLine($"✅ RIDE generado correctamente ({ridePdf?.Length / 1024} KB)");
                                }
                                catch (Exception exRide)
                                {
                                    // No bloquear el flujo si falla la generación del RIDE
                                    Console.WriteLine($"⚠️ No se pudo generar el RIDE: {exRide.Message}");
                                }

                                // ✅ PASO 5: ENVIAR EMAIL DE CONFIRMACIÓN AL CLIENTE (con RIDE adjunto)
                                await _emailService.EnviarEmailPagoVerificado(
                                    orden.email,
                                    $"{orden.nombre} {orden.apellido}",
                                    orden.token_orden,
                                    orden.total,
                                    ridePdf,
                                    nombreRide,
                                    numeroSeguimiento
                                );

                                // ✅ PASO 5: NOTIFICAR A LOS VENDEDORES DE LOS PRODUCTOS VENDIDOS
                                Console.WriteLine($"");
                                Console.WriteLine($"📧 Notificando a vendedores sobre las ventas...");
                                await NotificarVendedoresDeVenta(orden.id);
                                Console.WriteLine($"✅ Notificaciones a vendedores enviadas");
                            }
                            else
                            {
                                Console.WriteLine($"⚠️ No se pudo actualizar la orden {orden.id}");
                            }
                        }
                        else
                        {
                            Console.WriteLine($"⚠️ No se encontró la orden ID {comprobante.ordenId}");
                        }
                    }
                    else
                    {
                        Console.WriteLine($"⚠️ No se encontró el comprobante ID {id}");
                    }

                    return Ok(new
                    {
                        success = true,
                        mensaje = "Comprobante verificado correctamente, stock actualizado y vendedores notificados.",
                        comprobanteId = id
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "No se pudo verificar el comprobante."
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en VerificarComprobante: {ex.Message}");
                Console.WriteLine($"❌ Stack: {ex.StackTrace}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al verificar el comprobante",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // NOTIFICAR VENDEDORES DE VENTA
        // ✅ MANTIENE LA LÓGICA ORIGINAL - NO MODIFICADO
        // ============================================
        private async Task NotificarVendedoresDeVenta(int ordenId)
        {
            try
            {
                Console.WriteLine($"");
                Console.WriteLine($"╔════════════════════════════════════════════════════════╗");
                Console.WriteLine($"║  📧 INICIANDO NOTIFICACIONES A VENDEDORES");
                Console.WriteLine($"╚════════════════════════════════════════════════════════╝");
                Console.WriteLine($"");

                // Obtener los items de la orden
                var items = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
                    .Where(i => i.ordenId == ordenId)
                    .ToList();

                Console.WriteLine($"   Items encontrados: {items.Count}");

                // Actualizar estado de items a VENDIDO
                foreach (var item in items)
                {
                    item.estadoItemId = 2; // 2 = VENDIDO
                    _Helper.Actualizar("sp_Actualizar_Item", item);
                }

                Console.WriteLine($"   ✅ Items actualizados a estado VENDIDO");

                // Agrupar productos por vendedor
                var vendedoresProductos = new Dictionary<int, List<dynamic>>();

                foreach (var item in items)
                {
                    var producto = _Helper.ConsultarId<Entidad_Producto>("sp_consultar_productoId", item.productoId);

                    if (producto == null)
                        continue;

                    if (!vendedoresProductos.ContainsKey(producto.vendedorId))
                    {
                        vendedoresProductos[producto.vendedorId] = new List<dynamic>();
                    }

                    vendedoresProductos[producto.vendedorId].Add(new
                    {
                        nombreProducto = producto.nombre_producto, // ✅ CORREGIDO
                        cantidad = item.cantidad,
                        precioUnitario = producto.precio_ahora,
                        totalVenta = item.cantidad * producto.precio_ahora
                    });
                }

                Console.WriteLine($"   Vendedores a notificar: {vendedoresProductos.Count}");

                // Obtener el token de la orden para incluirlo en los emails
                var orden = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes")
                    .Where(o => o.id == ordenId)
                    .FirstOrDefault();

                string tokenOrden = orden?.token_orden ?? "N/A";

                // Notificar a cada vendedor
                foreach (var kvp in vendedoresProductos)
                {
                    int vendedorId = kvp.Key;
                    var productosVendidos = kvp.Value;

                    var vendedor = _Helper.Consultar<Entidad_Vendedor>("sp_listar_vendedor")
                        .Where(v => v.id == vendedorId)
                        .FirstOrDefault();

                    if (vendedor == null)
                        continue;

                    var usuarioVendedor = _Helper.Consultar<Entidad_Usuario>("sp_listar_usuario")
                        .Where(u => u.id == vendedor.usuarioId)
                        .FirstOrDefault();

                    if (usuarioVendedor == null)
                        continue;

                    Console.WriteLine($"   ✅ Vendedor: {vendedor.nombre_comercial}");
                    Console.WriteLine($"   ✅ Email: {usuarioVendedor.email}");
                    Console.WriteLine($"   ✅ Productos vendidos: {productosVendidos.Count}");

                    // Enviar notificación por cada producto vendido
                    foreach (var productoVendido in productosVendidos)
                    {
                        try
                        {
                            Console.WriteLine($"");
                            Console.WriteLine($"   📧 Enviando email por: {productoVendido.nombreProducto}");

                            await _emailService.NotificarVendedorVenta(
                                usuarioVendedor.email,
                                vendedor.nombre_comercial,
                                productoVendido.nombreProducto,
                                productoVendido.cantidad,
                                productoVendido.precioUnitario,
                                productoVendido.totalVenta,
                                tokenOrden
                            );

                            Console.WriteLine($"   ✅ Email enviado exitosamente");
                        }
                        catch (Exception exEmail)
                        {
                            Console.WriteLine($"   ❌ Error al enviar email: {exEmail.Message}");
                            Console.WriteLine($"   Stack: {exEmail.StackTrace}");
                        }
                    }
                }

                Console.WriteLine($"");
                Console.WriteLine($"╔════════════════════════════════════════════════════════╗");
                Console.WriteLine($"║  ✅ NOTIFICACIONES A VENDEDORES COMPLETADAS");
                Console.WriteLine($"╚════════════════════════════════════════════════════════╝");
                Console.WriteLine($"");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"");
                Console.WriteLine($"❌❌❌ ERROR AL NOTIFICAR VENDEDORES ❌❌❌");
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                Console.WriteLine($"");
            }
        }

        // ============================================
        // RECHAZAR COMPROBANTE
        // ✅ ACTUALIZADO: Ahora recibe el motivo desde el BODY
        // ============================================
        [HttpPost("RechazarComprobante/{id}/{adminId}")]
        public async Task<IActionResult> RechazarComprobante(
    int id,
    int adminId,
    [FromBody] RechazarComprobanteRequest request)
        {
            try
            {
                // 🔍 LOGS DE DIAGNÓSTICO
                Console.WriteLine($"");
                Console.WriteLine($"╔════════════════════════════════════════════════════════╗");
                Console.WriteLine($"║  🔍 DEBUG - RECHAZAR COMPROBANTE");
                Console.WriteLine($"╠════════════════════════════════════════════════════════╣");
                Console.WriteLine($"║  ID Comprobante: {id}");
                Console.WriteLine($"║  Admin ID: {adminId}");
                Console.WriteLine($"║  Request es NULL: {(request == null ? "SÍ ❌" : "NO ✅")}");

                if (request != null)
                {
                    Console.WriteLine($"║  request.motivo: '{request.motivo}'");
                    Console.WriteLine($"║  Length: {request.motivo?.Length ?? 0}");
                }
                Console.WriteLine($"╚════════════════════════════════════════════════════════╝");
                Console.WriteLine($"");

                // ✅ Obtener el motivo del body
                string motivo = request?.motivo ?? "";

                Console.WriteLine($"❌ Admin {adminId} rechazando comprobante {id}");
                Console.WriteLine($"   Motivo final: '{motivo}'");

                // Obtener comprobante
                var comprobante = _Helper.Consultar<Entidad_ComprobantePago>("sp_Consultar_ComprobantesPago")
                    .Where(c => c.id == id)
                    .FirstOrDefault();

                if (comprobante == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Comprobante no encontrado"
                    });
                }

                // Obtener orden asociada
                var orden = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes")
                    .Where(o => o.id == comprobante.ordenId)
                    .FirstOrDefault();

                if (orden == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Orden no encontrada"
                    });
                }

                // Cambiar estado de la orden a "Comprobante Rechazado"
                orden.estadoOrdenId = 9; // 9 = COMPROBANTE_RECHAZADO
                var ordenActualizada = _Helper.Actualizar("sp_Actualizar_Orden", orden);

                // ✅ Pasar el motivo al método RechazarComprobante
                Console.WriteLine($"   🔍 Enviando a RechazarComprobante con motivo: '{motivo}'");
                var comprobanteActualizado = _Helper.RechazarComprobante(id, adminId, motivo);

                if (ordenActualizada && comprobanteActualizado)
                {
                    // Enviar email al cliente notificando el rechazo
                    await _emailService.EnviarEmailComprobanteRechazado(
                        orden.email,
                        $"{orden.nombre} {orden.apellido}",
                        orden.token_orden,
                        motivo
                    );

                    Console.WriteLine($"✅ Comprobante {id} rechazado - Orden {orden.id} actualizada a estado 9 (COMPROBANTE_RECHAZADO)");
                    Console.WriteLine($"   El comprobante se mantiene en la base de datos para historial");

                    return Ok(new
                    {
                        success = true,
                        mensaje = "Comprobante rechazado correctamente.",
                        comprobanteId = id,
                        ordenId = orden.id
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al rechazar el comprobante."
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en RechazarComprobante: {ex.Message}");
                Console.WriteLine($"❌ Stack: {ex.StackTrace}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al rechazar el comprobante",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // GENERAR RIDE (FACTURA ELECTRÓNICA)
        // ============================================
        private async Task<byte[]> GenerarRideOrden(Entidad_Orden orden, Entidad_ComprobantePago comprobante)
        {
            var items = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
                .Where(i => i.ordenId == orden.id)
                .ToList();

            var itemsFactura = new List<RideService.ItemFactura>();

            foreach (var item in items)
            {
                var producto = _Helper.ConsultarId<Entidad_Producto>("sp_consultar_productoId", item.productoId);

                if (producto != null)
                {
                    itemsFactura.Add(new RideService.ItemFactura
                    {
                        Descripcion = producto.nombre_producto,
                        Cantidad = item.cantidad,
                        PrecioUnit = producto.precio_ahora,
                        Descuento = 0
                    });
                }
            }

            var numeroFactura = $"001-001-{orden.id.ToString().PadLeft(9, '0')}";

            var datosFactura = new RideService.DatosFactura
            {
                TokenOrden = orden.token_orden,
                NumeroFactura = numeroFactura,
                FechaEmision = orden.fecha != default ? orden.fecha : DateTime.Now,
                NombreCliente = $"{orden.nombre} {orden.apellido}",
                EmailCliente = orden.email,
                CedulaRucCliente = "9999999999999",
                DireccionCliente = !string.IsNullOrEmpty(comprobante.direccion_entrega)
                                        ? comprobante.direccion_entrega
                                        : (orden.direccion_1 ?? "—"),
                TelefonoCliente = comprobante.telefono_contacto,
                FormaPago = "Transferencia Bancaria / Depósito",
                Items = itemsFactura,
                CostoEnvio = orden.costo_envio,
                FechaAutorizacion = DateTime.Now,
            };

            return await Task.Run(() => _rideService.GenerarRide(datosFactura));
        }

        // ============================================
        // ENDPOINTS ADICIONALES
        // ============================================

        [HttpGet("ConsultarComprobantes")]
        public IActionResult ConsultarComprobantes()
        {
            try
            {
                var comprobantes = _Helper.Consultar<Entidad_ComprobantePago>("sp_Consultar_ComprobantesPago");
                return Ok(comprobantes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarComprobantes: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar comprobantes",
                    detalle = ex.Message
                });
            }
        }

        [HttpGet("ConsultarComprobantePorOrden/{ordenId}")]
        public IActionResult ConsultarComprobantePorOrden(int ordenId)
        {
            try
            {
                var comprobante = _Helper.ConsultarComprobantePorOrden(ordenId);

                if (comprobante != null)
                {
                    return Ok(comprobante);
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "No se encontró comprobante para esta orden"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarComprobantePorOrden: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar comprobante",
                    detalle = ex.Message
                });
            }
        }
    }
}