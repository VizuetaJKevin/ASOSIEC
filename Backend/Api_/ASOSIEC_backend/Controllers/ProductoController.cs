using Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio;
using Negocio.Services;
using ASOSIEC.Services;  // ✅ NUEVO: ConfiguracionService
using System;
using System.Linq;
using System.Collections.Generic;

public class AprobarProductoRequest
{
    public int ProductoId { get; set; }
    public int AdminId { get; set; }
}

public class RechazarProductoRequest
{
    public int ProductoId { get; set; }
    public int AdminId { get; set; }
    public string MotivoRechazo { get; set; }
}

namespace ASOSIEC.Controllers
{
    [ApiController]
    [Route("api")]
    //[Authorize]
    public class ProductoController : Controller
    {
        private readonly negocio _Helper;
        private readonly AuditService _auditService;
        private readonly ConfiguracionService _configuracionService; // ✅ NUEVO

        // ✅ CONSTRUCTOR ACTUALIZADO CON ConfiguracionService
        public ProductoController(negocio Producto, AuditService auditService, ConfiguracionService configuracionService)
        {
            this._Helper = Producto;
            this._auditService = auditService;
            this._configuracionService = configuracionService; // ✅ NUEVO
        }

        // ============================================
        // CONSULTAR TODOS LOS PRODUCTOS (PÚBLICO - CON CONFIGURACIÓN)
        // ============================================
        [HttpGet("ConsultarProducto")]
        public IActionResult Consultar()
        {
            try
            {
                // ✅ LEER CONFIGURACIÓN
                bool mostrarAgotados = _configuracionService.ObtenerBooleano("mostrar_productos_agotados", true);
                Console.WriteLine($"🔍 Config mostrar_productos_agotados: {mostrarAgotados}");

                var productos = _Helper.Consultar<Entidad_Producto>("sp_consultar_productos");

                // ✅ FILTRAR SEGÚN CONFIGURACIÓN
                if (!mostrarAgotados)
                {
                    // No mostrar agotados (estado 2) ni descontinuados (estado 3)
                    productos = productos.Where(p => p.estadoProductoId != 2 && p.estadoProductoId != 3).ToList();
                }
                else
                {
                    // Solo excluir descontinuados
                    productos = productos.Where(p => p.estadoProductoId != 3).ToList();
                }

                Console.WriteLine($"📦 Productos visibles en catálogo: {productos.Count}");

                if (productos.Count > 0)
                {
                    return Ok(productos);
                }
                else
                {
                    return Ok(new List<Entidad_Producto>());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarProducto: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar productos",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR TODOS LOS PRODUCTOS (ADMIN - INCLUYE DESCONTINUADOS)
        // ============================================
        [HttpGet("ConsultarProductoAdmin")]
        public IActionResult ConsultarProductoAdmin()
        {
            try
            {
                var productos = _Helper.Consultar<Entidad_Producto>("sp_consultar_productos");

                Console.WriteLine($"📦 Productos totales (admin): {productos.Count}");

                if (productos.Count > 0)
                {
                    return Ok(productos);
                }
                else
                {
                    return Ok(new List<Entidad_Producto>());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarProductoAdmin: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar productos",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR PRODUCTOS POR VENDEDOR
        // ============================================
        [HttpGet("ConsultarProductosVendedor/{vendedorId}")]
        public IActionResult ConsultarProductosVendedor(int vendedorId)
        {
            try
            {
                Console.WriteLine($"📦 Consultando productos del vendedor {vendedorId}");

                var productos = _Helper.Consultar<Entidad_Producto>("sp_consultar_productos")
                    .Where(p => p.vendedorId == vendedorId)
                    .ToList();

                Console.WriteLine($"✅ Productos encontrados: {productos.Count}");

                return Ok(productos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarProductosVendedor: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar productos del vendedor",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR PRODUCTOS POR USUARIO VENDEDOR
        // ============================================
        [HttpGet("ConsultarProductosPorUsuario/{usuarioId}")]
        public IActionResult ConsultarProductosPorUsuario(int usuarioId)
        {
            try
            {
                Console.WriteLine($"📦 Consultando productos del usuario {usuarioId}");

                var vendedor = _Helper.Consultar<Entidad_Vendedor>("sp_listar_vendedores")
                    .Where(v => v.usuarioId == usuarioId)
                    .FirstOrDefault();

                if (vendedor == null)
                {
                    return Ok(new List<Entidad_Producto>());
                }

                var productos = _Helper.Consultar<Entidad_Producto>("sp_consultar_productos")
                    .Where(p => p.vendedorId == vendedor.id)
                    .ToList();

                Console.WriteLine($"✅ Productos del usuario: {productos.Count}");

                return Ok(productos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarProductosPorUsuario: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar productos",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR VENDEDORES (PARA DROPDOWN)
        // ============================================
        [HttpGet("ConsultarVendedorProducto")]
        public IActionResult ConsultarVendedorProducto()
        {
            try
            {
                Console.WriteLine("📦 Consultando lista de vendedores para dropdown");

                var vendedores = _Helper.Consultar<Entidad_Vendedor>("sp_listar_vendedores");

                Console.WriteLine($"✅ Vendedores encontrados: {vendedores.Count}");

                return Ok(vendedores);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarVendedorProducto: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar vendedores",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // REGISTRAR PRODUCTO - ✅ CON AUDITORÍA Y CONFIGURACIÓN
        // ============================================
        [HttpPost("RegistrarProducto")]
        public IActionResult Registrar([FromBody] Entidad_Producto Producto)
        {
            try
            {
                Console.WriteLine($"📦 Registrando producto del vendedor {Producto.vendedorId}");

                // ✅ LEER CONFIGURACIÓN
                bool requiereAprobacion = _configuracionService.ObtenerBooleano("requiere_aprobacion_producto", true);
                Console.WriteLine($"🔍 Config requiere_aprobacion_producto: {requiereAprobacion}");

                // ✅ ESTABLECER ESTADO SEGÚN CONFIGURACIÓN
                if (!requiereAprobacion)
                {
                    // Aprobación automática
                    Producto.estadoProductoId = 1; // DISPONIBLE
                    Console.WriteLine("✅ Producto con aprobación automática (DISPONIBLE)");
                }
                else
                {
                    // Requiere aprobación manual
                    Producto.estadoProductoId = 4; // PENDIENTE_APROBACION
                    Console.WriteLine("⏳ Producto requiere aprobación manual (PENDIENTE)");
                }

                // ✅ Si el stock es 0, marcarlo como agotado automáticamente
                if (Producto.stock == 0)
                {
                    Producto.estadoProductoId = 2; // Agotado
                    Console.WriteLine("⚠️ Producto sin stock, marcado como AGOTADO");
                }

                var Response = _Helper.Registrar("sp_Registrar_Producto", Producto);

                if (Response)
                {
                    // ✅ AUDITORÍA: Registrar creación exitosa
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "Producto",
                        entidadId: null,
                        accion: $"Creación de producto: {Producto.nombre_producto}",
                        valoresAnteriores: null,
                        valoresNuevos: new
                        {
                            nombre_producto = Producto.nombre_producto,
                            precio_ahora = Producto.precio_ahora,
                            stock = Producto.stock,
                            vendedorId = Producto.vendedorId,
                            categoria_producto_Id = Producto.categoria_producto_Id,
                            estadoProductoId = Producto.estadoProductoId,
                            descripcion = Producto.descripcion,
                            requiereAprobacion = requiereAprobacion
                        },
                        exito: true,
                        codigoError: null,
                        mensajeError: null,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "stock_inicial", Producto.stock },
                            { "precio_inicial", Producto.precio_ahora },
                            { "requiere_aprobacion", requiereAprobacion },
                            { "estado_inicial", requiereAprobacion ? "PENDIENTE_APROBACION" : "DISPONIBLE" }
                        }
                    );

                    return Ok(new
                    {
                        success = true,
                        mensaje = "Producto registrado correctamente",
                        requiereAprobacion = requiereAprobacion,
                        estado = requiereAprobacion ? "PENDIENTE_APROBACION" : "DISPONIBLE"
                    });
                }
                else
                {
                    // ✅ AUDITORÍA: Registrar fallo
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "INSERT",
                        entidad: "Producto",
                        entidadId: null,
                        accion: $"Intento fallido de crear producto: {Producto.nombre_producto}",
                        valoresAnteriores: null,
                        valoresNuevos: new
                        {
                            nombre_producto = Producto.nombre_producto,
                            precio_ahora = Producto.precio_ahora,
                            vendedorId = Producto.vendedorId
                        },
                        exito: false,
                        codigoError: "DB_ERROR",
                        mensajeError: "Error al crear producto en la base de datos",
                        datosAdicionales: null
                    );

                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al registrar el producto"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en RegistrarProducto: {ex.Message}");

                // ✅ AUDITORÍA: Registrar excepción
                _auditService.RegistrarAuditoria(
                    tipoOperacion: "INSERT",
                    entidad: "Producto",
                    entidadId: null,
                    accion: "Error al crear producto",
                    valoresAnteriores: null,
                    valoresNuevos: null,
                    exito: false,
                    codigoError: "EXCEPTION",
                    mensajeError: ex.Message,
                    datosAdicionales: null
                );

                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al registrar producto",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ACTUALIZAR PRODUCTO - ✅ CON AUDITORÍA
        // ============================================
        [HttpPut("ActualizarProducto")]
        public IActionResult Actualizar([FromBody] Entidad_Producto Producto)
        {
            try
            {
                Console.WriteLine($"📦 Actualizando producto {Producto.id}");

                // ✅ PASO 1: Obtener valores anteriores ANTES de actualizar
                var productoAnterior = _Helper.Consultar<Entidad_Producto>("sp_consultar_productos")
                    .FirstOrDefault(p => p.id == Producto.id);

                if (productoAnterior == null)
                {
                    Console.WriteLine($"❌ Producto {Producto.id} no encontrado");
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Producto no encontrado"
                    });
                }

                // ✅ Si el stock es 0, marcarlo como agotado automáticamente
                if (Producto.stock == 0)
                {
                    Producto.estadoProductoId = 2; // Agotado
                    Console.WriteLine("⚠️ Stock en 0, marcando como AGOTADO");
                }
                // Si el stock aumenta, volver a disponible
                else if (Producto.stock > 0 && productoAnterior.stock == 0)
                {
                    Producto.estadoProductoId = 1; // Disponible
                    Console.WriteLine("✅ Stock disponible, marcando como DISPONIBLE");
                }

                var Response = _Helper.Actualizar("sp_Actualizar_Producto", Producto);

                if (Response)
                {
                    // ✅ AUDITORÍA: Registrar actualización exitosa
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "UPDATE",
                        entidad: "Producto",
                        entidadId: Producto.id,
                        accion: $"Producto actualizado: {Producto.nombre_producto}",
                        valoresAnteriores: new
                        {
                            nombre_producto = productoAnterior.nombre_producto,
                            descripcion = productoAnterior.descripcion,
                            precio_ahora = productoAnterior.precio_ahora,
                            precio_antes = productoAnterior.precio_antes,
                            stock = productoAnterior.stock,
                            estadoProductoId = productoAnterior.estadoProductoId,
                            categoria_producto_Id = productoAnterior.categoria_producto_Id
                        },
                        valoresNuevos: new
                        {
                            nombre_producto = Producto.nombre_producto,
                            descripcion = Producto.descripcion,
                            precio_ahora = Producto.precio_ahora,
                            precio_antes = Producto.precio_antes,
                            stock = Producto.stock,
                            estadoProductoId = Producto.estadoProductoId,
                            categoria_producto_Id = Producto.categoria_producto_Id
                        },
                        exito: true,
                        codigoError: null,
                        mensajeError: null,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "stock_anterior", productoAnterior.stock },
                            { "stock_nuevo", Producto.stock },
                            { "cambio_stock", Producto.stock - productoAnterior.stock },
                            { "precio_anterior", productoAnterior.precio_ahora },
                            { "precio_nuevo", Producto.precio_ahora }
                        }
                    );

                    return Ok(new
                    {
                        success = true,
                        mensaje = "Producto actualizado correctamente"
                    });
                }
                else
                {
                    // ✅ AUDITORÍA: Registrar fallo
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "UPDATE",
                        entidad: "Producto",
                        entidadId: Producto.id,
                        accion: $"Intento fallido de actualizar producto: {Producto.nombre_producto}",
                        valoresAnteriores: null,
                        valoresNuevos: null,
                        exito: false,
                        codigoError: "DB_ERROR",
                        mensajeError: "Error al actualizar producto en la base de datos",
                        datosAdicionales: null
                    );

                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al actualizar el producto"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ActualizarProducto: {ex.Message}");

                // ✅ AUDITORÍA: Registrar excepción
                _auditService.RegistrarAuditoria(
                    tipoOperacion: "UPDATE",
                    entidad: "Producto",
                    entidadId: Producto.id,
                    accion: "Error al actualizar producto",
                    valoresAnteriores: null,
                    valoresNuevos: null,
                    exito: false,
                    codigoError: "EXCEPTION",
                    mensajeError: ex.Message,
                    datosAdicionales: null
                );

                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al actualizar producto",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // ELIMINAR PRODUCTO - ✅ CON AUDITORÍA
        // ============================================
        [HttpDelete("EliminarProducto/{id}")]
        public IActionResult Eliminar(int id)
        {
            try
            {
                Console.WriteLine($"📦 Eliminando producto {id}");

                // ✅ Obtener info del producto ANTES de eliminar
                var producto = _Helper.Consultar<Entidad_Producto>("sp_consultar_productos")
                    .FirstOrDefault(p => p.id == id);

                if (producto == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Producto no encontrado"
                    });
                }

                var Response = _Helper.Eliminar("sp_Eliminar_Producto", id);

                if (Response)
                {
                    // ✅ AUDITORÍA: Registrar eliminación exitosa
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "DELETE",
                        entidad: "Producto",
                        entidadId: id,
                        accion: $"Producto eliminado: {producto.nombre_producto}",
                        valoresAnteriores: new
                        {
                            id = producto.id,
                            nombre_producto = producto.nombre_producto,
                            precio_ahora = producto.precio_ahora,
                            stock = producto.stock,
                            vendedorId = producto.vendedorId,
                            categoria_producto_Id = producto.categoria_producto_Id
                        },
                        valoresNuevos: null,
                        exito: true,
                        codigoError: null,
                        mensajeError: null,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "vendedor_id", producto.vendedorId },
                            { "nombre_producto", producto.nombre_producto }
                        }
                    );

                    return Ok(new
                    {
                        success = true,
                        mensaje = "Producto eliminado correctamente"
                    });
                }
                else
                {
                    // ✅ AUDITORÍA: Registrar fallo
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "DELETE",
                        entidad: "Producto",
                        entidadId: id,
                        accion: $"Intento fallido de eliminar producto: {producto.nombre_producto}",
                        valoresAnteriores: null,
                        valoresNuevos: null,
                        exito: false,
                        codigoError: "DB_ERROR",
                        mensajeError: "Error al eliminar producto en la base de datos",
                        datosAdicionales: null
                    );

                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al eliminar el producto"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en EliminarProducto: {ex.Message}");

                // ✅ AUDITORÍA: Registrar excepción
                _auditService.RegistrarAuditoria(
                    tipoOperacion: "DELETE",
                    entidad: "Producto",
                    entidadId: id,
                    accion: "Error al eliminar producto",
                    valoresAnteriores: null,
                    valoresNuevos: null,
                    exito: false,
                    codigoError: "EXCEPTION",
                    mensajeError: ex.Message,
                    datosAdicionales: null
                );

                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al eliminar producto",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR PRODUCTO POR ID
        // ============================================
        [HttpGet("ConsultarProductoId/{id}")]
        public IActionResult ConsultarId(int id)
        {
            try
            {
                var producto = _Helper.ConsultarId<Entidad_Producto>("sp_consultar_productoId", id);

                if (producto != null)
                {
                    return Ok(producto);
                }
                else
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Producto no encontrado"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar producto",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // APROBAR PRODUCTO - ✅ CON AUDITORÍA CORREGIDA
        // ============================================
        [HttpPost("AprobarProducto")]
        public IActionResult AprobarProducto([FromBody] AprobarProductoRequest request)
        {
            try
            {
                Console.WriteLine($"✅ Aprobando producto {request.ProductoId} por admin {request.AdminId}");

                // ✅ Obtener info del producto antes de aprobar
                var producto = _Helper.Consultar<Entidad_Producto>("sp_consultar_productos")
                    .FirstOrDefault(p => p.id == request.ProductoId);

                if (producto == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Producto no encontrado"
                    });
                }

                var response = _Helper.RegistrarConProcedimiento("sp_Aprobar_Producto", new
                {
                    productoId = request.ProductoId,
                    adminId = request.AdminId
                });

                if (response)
                {
                    // ✅ AUDITORÍA: Registrar aprobación
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "APPROVE",
                        entidad: "Producto",
                        entidadId: request.ProductoId,
                        accion: $"Aprobación de producto: {producto.nombre_producto}",
                        valoresAnteriores: new
                        {
                            estadoProductoId = producto.estadoProductoId,
                            aprobado = producto.aprobado
                        },
                        valoresNuevos: new
                        {
                            estadoProductoId = 1, // Aprobado
                            aprobado = true,
                            adminId = request.AdminId,
                            fechaAprobacion = DateTime.Now
                        },
                        exito: true,
                        codigoError: null,
                        mensajeError: null,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "admin_aprobador_id", request.AdminId },
                            { "vendedor_id", producto.vendedorId },
                            { "nombre_producto", producto.nombre_producto }
                        }
                    );

                    return Ok(new
                    {
                        success = true,
                        mensaje = "Producto aprobado exitosamente"
                    });
                }
                else
                {
                    // ✅ AUDITORÍA: Registrar fallo
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "APPROVE",
                        entidad: "Producto",
                        entidadId: request.ProductoId,
                        accion: $"Intento fallido de aprobar producto: {producto.nombre_producto}",
                        valoresAnteriores: null,
                        valoresNuevos: null,
                        exito: false,
                        codigoError: "DB_ERROR",
                        mensajeError: "Error al aprobar producto en la base de datos",
                        datosAdicionales: null
                    );

                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al aprobar producto"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en AprobarProducto: {ex.Message}");

                // ✅ AUDITORÍA: Registrar excepción
                _auditService.RegistrarAuditoria(
                    tipoOperacion: "APPROVE",
                    entidad: "Producto",
                    entidadId: request.ProductoId,
                    accion: "Error al aprobar producto",
                    valoresAnteriores: null,
                    valoresNuevos: null,
                    exito: false,
                    codigoError: "EXCEPTION",
                    mensajeError: ex.Message,
                    datosAdicionales: null
                );

                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al aprobar producto",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // RECHAZAR PRODUCTO - ✅ CON AUDITORÍA CORREGIDA
        // ============================================
        [HttpPost("RechazarProducto")]
        public IActionResult RechazarProducto([FromBody] RechazarProductoRequest request)
        {
            try
            {
                Console.WriteLine($"❌ Rechazando producto {request.ProductoId} por admin {request.AdminId}");
                Console.WriteLine($"Motivo: {request.MotivoRechazo}");

                // ✅ Obtener info del producto antes de rechazar
                var producto = _Helper.Consultar<Entidad_Producto>("sp_consultar_productos")
                    .FirstOrDefault(p => p.id == request.ProductoId);

                if (producto == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        mensaje = "Producto no encontrado"
                    });
                }

                var response = _Helper.RegistrarConProcedimiento("sp_Rechazar_Producto", new
                {
                    productoId = request.ProductoId,
                    adminId = request.AdminId,
                    motivo_rechazo = request.MotivoRechazo
                });

                if (response)
                {
                    // ✅ AUDITORÍA: Registrar rechazo
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "REJECT",
                        entidad: "Producto",
                        entidadId: request.ProductoId,
                        accion: $"Rechazo de producto: {producto.nombre_producto}",
                        valoresAnteriores: new
                        {
                            estadoProductoId = producto.estadoProductoId,
                            aprobado = producto.aprobado
                        },
                        valoresNuevos: new
                        {
                            estadoProductoId = 5, // Rechazado
                            aprobado = false,
                            adminId = request.AdminId,
                            motivoRechazo = request.MotivoRechazo,
                            fechaRechazo = DateTime.Now
                        },
                        exito: true,
                        codigoError: null,
                        mensajeError: null,
                        datosAdicionales: new Dictionary<string, object>
                        {
                            { "admin_rechazador_id", request.AdminId },
                            { "vendedor_id", producto.vendedorId },
                            { "motivo_rechazo", request.MotivoRechazo },
                            { "nombre_producto", producto.nombre_producto }
                        }
                    );

                    return Ok(new
                    {
                        success = true,
                        mensaje = "Producto rechazado"
                    });
                }
                else
                {
                    // ✅ AUDITORÍA: Registrar fallo
                    _auditService.RegistrarAuditoria(
                        tipoOperacion: "REJECT",
                        entidad: "Producto",
                        entidadId: request.ProductoId,
                        accion: $"Intento fallido de rechazar producto: {producto.nombre_producto}",
                        valoresAnteriores: null,
                        valoresNuevos: null,
                        exito: false,
                        codigoError: "DB_ERROR",
                        mensajeError: "Error al rechazar producto en la base de datos",
                        datosAdicionales: null
                    );

                    return BadRequest(new
                    {
                        success = false,
                        mensaje = "Error al rechazar producto"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en RechazarProducto: {ex.Message}");

                // ✅ AUDITORÍA: Registrar excepción
                _auditService.RegistrarAuditoria(
                    tipoOperacion: "REJECT",
                    entidad: "Producto",
                    entidadId: request.ProductoId,
                    accion: "Error al rechazar producto",
                    valoresAnteriores: null,
                    valoresNuevos: null,
                    exito: false,
                    codigoError: "EXCEPTION",
                    mensajeError: ex.Message,
                    datosAdicionales: null
                );

                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al rechazar producto",
                    detalle = ex.Message
                });
            }
        }

        // ============================================
        // CONSULTAR PRODUCTOS PAGINADOS - ✅ NUEVO
        // ============================================
        [HttpGet("ConsultarProductoPaginado")]
        public IActionResult ConsultarPaginado([FromQuery] int pagina = 1)
        {
            try
            {
                // ✅ LEER CONFIGURACIONES
                int productosPorPagina = _configuracionService.ObtenerEntero("productos_por_pagina", 12);
                bool mostrarAgotados = _configuracionService.ObtenerBooleano("mostrar_productos_agotados", true);

                Console.WriteLine($"🔍 Config productos_por_pagina: {productosPorPagina}");
                Console.WriteLine($"🔍 Página solicitada: {pagina}");

                var todosProductos = _Helper.Consultar<Entidad_Producto>("sp_consultar_productos");

                // Filtrar según configuración
                if (!mostrarAgotados)
                {
                    todosProductos = todosProductos.Where(p => p.estadoProductoId != 2 && p.estadoProductoId != 3).ToList();
                }
                else
                {
                    todosProductos = todosProductos.Where(p => p.estadoProductoId != 3).ToList();
                }

                int totalProductos = todosProductos.Count;
                int totalPaginas = (int)Math.Ceiling((double)totalProductos / productosPorPagina);

                // Validar página
                if (pagina < 1) pagina = 1;
                if (pagina > totalPaginas && totalPaginas > 0) pagina = totalPaginas;

                var productosPaginados = todosProductos
                    .Skip((pagina - 1) * productosPorPagina)
                    .Take(productosPorPagina)
                    .ToList();

                return Ok(new
                {
                    productos = productosPaginados,
                    paginacion = new
                    {
                        paginaActual = pagina,
                        productosPorPagina = productosPorPagina,
                        totalProductos = totalProductos,
                        totalPaginas = totalPaginas,
                        tienePaginaAnterior = pagina > 1,
                        tienePaginaSiguiente = pagina < totalPaginas
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en ConsultarProductoPaginado: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al consultar productos paginados",
                    detalle = ex.Message
                });
            }
        }
    }
}