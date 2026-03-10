using Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using ASOSIEC.Services;  // ✅ NUEVO: ConfiguracionService
using System;
using System.Linq;
using System.Collections.Generic;

namespace ASOSIEC.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    [Produces("application/json")]
    public class ItemController : Controller
    {
        private readonly negocio _Helper;
        private readonly ConfiguracionService _configuracionService; // ✅ NUEVO
        private const int ESTADO_EN_CARRITO = 1;
        private const int ESTADO_COMPRADO = 2;

        // ✅ CONSTRUCTOR ACTUALIZADO CON ConfiguracionService
        public ItemController(negocio Item, ConfiguracionService configuracionService)
        {
            this._Helper = Item;
            this._configuracionService = configuracionService; // ✅ NUEVO
        }

        [HttpGet("ConsultarItem")]
        public IActionResult Consultar()
        {
            try
            {
                var item = _Helper.Consultar<Entidad_Item>("sp_listar_Item");
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error", detalle = ex.Message });
            }
        }

        [HttpGet("ConsultarItemId/{id}")]
        public IActionResult ConsultarItemId(int id)
        {
            try
            {
                var item = _Helper.elementosCart(id);
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error", detalle = ex.Message });
            }
        }

        [HttpGet("Consultarmisproductosid/{id}")]
        public IActionResult Consultarmisproductosid(int id)
        {
            try
            {
                var item = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
                    .Where(p => p.usuarioId == id)
                    .Where(p => p.estadoItemId == ESTADO_COMPRADO) // ← PROBLEMA AQUÍ
                    .ToList();
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error", detalle = ex.Message });
            }
        }

        /// <summary>
        /// Consulta items de una orden específica (para devoluciones)
        /// </summary>
        [HttpGet("ConsultarItemsPorOrden/{ordenId}")]
        public IActionResult ConsultarItemsPorOrden(int ordenId)
        {
            try
            {
                var items = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
                    .Where(p => p.ordenId == ordenId)
                    .Where(p => p.estadoItemId == ESTADO_COMPRADO)
                    .ToList();

                if (items.Count == 0)
                {
                    Console.WriteLine($"⚠️ No se encontraron items para la orden {ordenId}");
                }
                else
                {
                    Console.WriteLine($"✅ Se encontraron {items.Count} items para la orden {ordenId}");
                }

                return Ok(items);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al consultar items por orden: {ex.Message}");
                return StatusCode(500, new { mensaje = "Error al consultar items", detalle = ex.Message });
            }
        }

        // ============================================
        // REGISTRAR ITEM - ✅ ACTUALIZADO CON CONFIGURACIÓN
        // ============================================
        [HttpPost("Registrar_Item")]
        [ProducesResponseType(typeof(bool), 200)]
        public IActionResult Registrar([FromBody] Entidad_Item Item)
        {
            try
            {
                Console.WriteLine($"🛒 Agregando producto {Item.productoId} al carrito del usuario {Item.usuarioId}");

                // ✅ VERIFICAR SI YA EXISTE EL ITEM EN EL CARRITO
                var ordenado = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
                    .Where(p => p.usuarioId == Item.usuarioId)
                    .Where(p => p.estadoItemId == ESTADO_EN_CARRITO)
                    .Where(p => p.productoId == Item.productoId)
                    .FirstOrDefault();

                if (ordenado != null)
                {
                    // El producto ya está en el carrito
                    Console.WriteLine($"⚠️ Producto {Item.productoId} ya está en el carrito");
                    return Ok(new
                    {
                        success = false,
                        mensaje = "Este producto ya está en tu carrito",
                        yaEnCarrito = true
                    });
                }

                // ✅ OBTENER INFORMACIÓN DEL PRODUCTO (usando ConsultarId)
                var producto = _Helper.ConsultarId<Entidad_Producto>("sp_consultar_productoId", Item.productoId);

                if (producto == null)
                {
                    Console.WriteLine($"❌ Producto {Item.productoId} no encontrado");
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Producto no encontrado"
                    });
                }

                // ✅ VERIFICAR CONFIGURACIÓN DE VENTA SIN STOCK
                bool permitirVentaSinStock = _configuracionService.ObtenerBooleano("permitir_venta_sin_stock", false);
                Console.WriteLine($"🔍 Config permitir_venta_sin_stock: {permitirVentaSinStock}");

                // ✅ VALIDAR STOCK
                if (!permitirVentaSinStock && producto.stock < Item.cantidad)
                {
                    Console.WriteLine($"❌ Stock insuficiente. Disponible: {producto.stock}, Solicitado: {Item.cantidad}");
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = $"Stock insuficiente. Disponible: {producto.stock}",
                        stockDisponible = producto.stock,
                        cantidadSolicitada = Item.cantidad
                    });
                }

                // Si permitir_venta_sin_stock está habilitado y no hay stock, mostrar advertencia
                if (permitirVentaSinStock && producto.stock < Item.cantidad)
                {
                    Console.WriteLine($"⚠️ ADVERTENCIA: Agregando al carrito sin stock suficiente (disponible: {producto.stock}, solicitado: {Item.cantidad})");
                }

                // ✅ REGISTRAR EL ITEM
                bool resultado = _Helper.Registrar("sp_Registrar_Item", Item);

                if (resultado)
                {
                    Console.WriteLine($"✅ Producto agregado al carrito exitosamente");
                    return Ok(new
                    {
                        success = true,
                        mensaje = "Producto agregado al carrito",
                        sinStock = producto.stock < Item.cantidad && permitirVentaSinStock
                    });
                }
                else
                {
                    Console.WriteLine($"❌ Error al agregar producto al carrito");
                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "No se pudo agregar el producto al carrito"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en Registrar_Item: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al agregar producto al carrito",
                    detalle = ex.Message
                });
            }
        }

        [HttpPut("Actualizar_Item")]
        [ProducesResponseType(typeof(bool), 200)]
        public IActionResult Actualizar([FromBody] Entidad_Item Item)
        {
            try
            {
                var Response = _Helper.Actualizar("sp_Actualizar_Item", Item);
                return Ok(new { success = Response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, mensaje = "Error", detalle = ex.Message });
            }
        }

        [HttpDelete("Eliminar_Item/{id}")]
        [ProducesResponseType(typeof(bool), 200)]
        public IActionResult Elimnar(int id)
        {
            try
            {
                var Response = _Helper.Eliminar("sp_Eliminar_Item", id);
                return Ok(new { success = Response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, mensaje = "Error", detalle = ex.Message });
            }
        }

        [HttpPut("Actualizar_ItemUserId/{id}/{orderid}")]
        public IActionResult Actualizar_ItemUserId(int id, int orderid)
        {
            try
            {
                var item = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
                    .Where(p => p.usuarioId == id)
                    .Where(p => p.estadoItemId == ESTADO_EN_CARRITO)
                    .ToList();

                if (item.Count != 0)
                {
                    var Orden = _Helper.Consultar<Entidad_Orden>("sp_consultar_ordenes")
                            .Where(p => p.usuarioId == id)
                            .Where(p => p.id == orderid)
                            .FirstOrDefault();

                    if (Orden != null)
                    {
                        Orden.estadoOrdenId = ESTADO_COMPRADO;
                        var ok = _Helper.Actualizar("sp_Actualizar_Orden", Orden);

                        if (ok)
                        {
                            foreach (var element in item)
                            {
                                element.ordenId = Orden.id;
                                element.estadoItemId = ESTADO_COMPRADO;
                                _Helper.Actualizar("sp_Actualizar_Item", element);
                            }

                            return Ok(new { success = true });
                        }
                    }
                }

                return Ok(new { success = false });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, mensaje = "Error", detalle = ex.Message });
            }
        }

        // ============================================
        // VALIDAR STOCK ANTES DE CHECKOUT - ✅ NUEVO
        // ============================================
        [HttpPost("ValidarStockCarrito")]
        public IActionResult ValidarStockCarrito([FromBody] int usuarioId)
        {
            try
            {
                Console.WriteLine($"🔍 Validando stock del carrito para usuario {usuarioId}");

                // ✅ OBTENER ITEMS DEL CARRITO
                var itemsCarrito = _Helper.Consultar<Entidad_Item>("sp_consultar_items")
                    .Where(p => p.usuarioId == usuarioId)
                    .Where(p => p.estadoItemId == ESTADO_EN_CARRITO)
                    .ToList();

                if (itemsCarrito.Count == 0)
                {
                    Console.WriteLine("ℹ️ Carrito vacío");
                    return Ok(new
                    {
                        valido = true,
                        mensaje = "Carrito vacío"
                    });
                }

                // ✅ LEER CONFIGURACIÓN
                bool permitirVentaSinStock = _configuracionService.ObtenerBooleano("permitir_venta_sin_stock", false);
                Console.WriteLine($"🔍 Config permitir_venta_sin_stock: {permitirVentaSinStock}");

                var productosConProblemas = new List<dynamic>();

                // ✅ VALIDAR STOCK DE CADA ITEM (usando ConsultarId)
                foreach (var item in itemsCarrito)
                {
                    var producto = _Helper.ConsultarId<Entidad_Producto>("sp_consultar_productoId", item.productoId);

                    if (producto == null)
                    {
                        Console.WriteLine($"❌ Producto {item.productoId} no encontrado");
                        productosConProblemas.Add(new
                        {
                            itemId = item.id,
                            productoId = item.productoId,
                            problema = "Producto no encontrado",
                            critico = true
                        });
                        continue;
                    }

                    if (!permitirVentaSinStock && producto.stock < item.cantidad)
                    {
                        Console.WriteLine($"❌ Stock insuficiente para producto {producto.nombre_producto}. Disponible: {producto.stock}, Solicitado: {item.cantidad}");
                        productosConProblemas.Add(new
                        {
                            itemId = item.id,
                            productoId = item.productoId,
                            nombreProducto = producto.nombre_producto,
                            cantidadSolicitada = item.cantidad,
                            stockDisponible = producto.stock,
                            problema = "Stock insuficiente",
                            critico = true
                        });
                    }
                    else if (producto.stock < item.cantidad)
                    {
                        // Advertencia (no crítico si se permite venta sin stock)
                        Console.WriteLine($"⚠️ Advertencia: Stock bajo para producto {producto.nombre_producto}. Disponible: {producto.stock}, Solicitado: {item.cantidad}");
                        productosConProblemas.Add(new
                        {
                            itemId = item.id,
                            productoId = item.productoId,
                            nombreProducto = producto.nombre_producto,
                            cantidadSolicitada = item.cantidad,
                            stockDisponible = producto.stock,
                            problema = "Stock insuficiente (advertencia)",
                            critico = false
                        });
                    }
                }

                bool esValido = !productosConProblemas.Any(p => p.critico);

                if (esValido)
                {
                    Console.WriteLine("✅ Todos los productos tienen stock disponible");
                }
                else
                {
                    Console.WriteLine($"❌ Hay {productosConProblemas.Count(p => p.critico)} productos con problemas críticos de stock");
                }

                return Ok(new
                {
                    valido = esValido,
                    permitirVentaSinStock = permitirVentaSinStock,
                    totalItems = itemsCarrito.Count,
                    productosConProblemas = productosConProblemas,
                    mensaje = esValido
                        ? "Todos los productos tienen stock disponible"
                        : "Hay productos con stock insuficiente"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ValidarStockCarrito: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al validar stock",
                    detalle = ex.Message
                });
            }
        }
    }
}