using DataAccess;
using Entidad;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.SqlClient;
using System.Data;
using ASOSIEC.Services;

namespace Negocio
{
    public partial class negocio
    {
        DataAcces DataAcces = new DataAcces();
        private readonly EmailService _emailService;
        private readonly ConfiguracionService _configuracionService;
        private readonly string _connectionString;


        public negocio(EmailService emailService, ConfiguracionService configuracionService)
        {
            _emailService = emailService;
            _configuracionService = configuracionService;

        }

        // ============================================
        // MÉTODOS GENÉRICOS
        // ============================================
        public List<T> Consultar<T>(string comando)
        {
            return DataAcces.Consultar<T>(comando);
        }
        public T ConsultarConParametro<T>(string comando, string nombreParametro, int valorParametro)
        {
            return DataAcces.ConsultarConParametro<T>(comando, nombreParametro, valorParametro);
        }
        public bool EliminarOrdenesPorUsuario(string comando, int usuarioId)
        {
            return DataAcces.EliminarOrdenesPorUsuario(comando, usuarioId);
        }

        public T ConsultarId<T>(string comando, int id)
        {
            return DataAcces.ConsultarId<T>(comando, id);
        }

        public bool Registrar<T>(string comando, T objeto)
        {
            return DataAcces.Registrar(comando, objeto);
        }

        public bool Actualizar<T>(string comando, T objeto)
        {
            return DataAcces.Actualizar(comando, objeto);
        }

        public bool Eliminar(string comando, int id)
        {
            return DataAcces.Eliminar(comando, id);
        }

        // ============================================
        // ✅ NUEVO: MÉTODO PARA APROBAR/RECHAZAR PRODUCTOS
        // ============================================

        /// <summary>
        /// Ejecuta un procedimiento almacenado con parámetros y retorna bool (éxito/fallo).
        /// Uso: RegistrarConProcedimiento("sp_Aprobar_Producto", new { productoId = 1, adminId = 5 })
        /// </summary>
        public bool RegistrarConProcedimiento(string comando, object parametros)
        {
            return DataAcces.RegistrarConProcedimiento(comando, parametros);
        }

        // ============================================
        // LOGIN - ✅ CORREGIDO: parámetros a los SPs de bloqueo
        // ============================================
        public Entidad_Response_Login Login(Entidad_Login credenciales)
        {
            Entidad_Response_Login response = new Entidad_Response_Login();

            try
            {
                // ✅ Verificar bloqueo temporal
                var bloqueoInfo = DataAcces.ConsultarConParametros<BloqueoUsuario>(
                    "sp_Verificar_Usuario_Bloqueado",
                    new { email = credenciales.email }
                );

                if (bloqueoInfo != null && bloqueoInfo.esta_bloqueado == 1)
                {
                    Console.WriteLine($"🚫 Cuenta bloqueada: {credenciales.email} (hasta {bloqueoInfo.bloqueado_hasta})");
                    response.statusok = false;
                    response.mensaje = $"Tu cuenta está temporalmente bloqueada. Intenta de nuevo en {bloqueoInfo.minutos_restantes} minutos.";
                    response.codigoError = "CUENTA_BLOQUEADA";
                    return response;
                }

                // ✅ CAMBIO: Usar sp_Login optimizado
                var usuario = DataAcces.ConsultarConParametros<Entidad_Usuario>(
                    "sp_Login",
                    new { email = credenciales.email }
                );

                // Verificar si el usuario existe
                if (usuario == null)
                {
                    Console.WriteLine($"🚫 Login fallido: Email no encontrado: {credenciales.email}");
                    response.statusok = false;
                    response.mensaje = "Email o contraseña incorrectos.";
                    response.codigoError = "CREDENCIALES_INVALIDAS";
                    return response;
                }

                // ✅ VERIFICAR CONTRASEÑA CON BCRYPT
                bool passwordValida = DataAccess.DataAcces.VerifyPassword(credenciales.password, usuario.password);

                if (!passwordValida)
                {
                    Console.WriteLine($"🚫 Login fallido: Contraseña incorrecta para {credenciales.email}");

                    var intentoFallidoInfo = DataAcces.ConsultarConParametros<IntentoFallidoResponse>(
                        "sp_Registrar_Intento_Fallido",
                        new
                        {
                            email = credenciales.email,
                            max_intentos = 10,
                            tiempo_bloqueo_minutos = 15
                        }
                    );

                    if (intentoFallidoInfo != null && intentoFallidoInfo.bloqueado_hasta != null)
                    {
                        response.mensaje = $"Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.";
                    }
                    else
                    {
                        var intentosRestantes = (intentoFallidoInfo?.max_intentos ?? 10) - (intentoFallidoInfo?.intentos_fallidos ?? 0);
                        response.mensaje = $"Email o contraseña incorrectos. Te quedan {intentosRestantes} intentos.";
                    }

                    response.statusok = false;
                    response.codigoError = "CREDENCIALES_INVALIDAS";
                    return response;
                }

                // ✅ VALIDACIONES DE ESTADO (igual que antes)
                if (usuario.estadoUsuarioId == 4) // PENDIENTE_APROBACION
                {
                    Console.WriteLine($"🚫 Login denegado: Usuario {usuario.email} pendiente de aprobación");
                    response.statusok = false;
                    response.mensaje = "Tu cuenta está pendiente de aprobación por un administrador.";
                    response.codigoError = "PENDIENTE_APROBACION";
                    return response;
                }

                if (usuario.estadoUsuarioId == 5) // RECHAZADO
                {
                    Console.WriteLine($"🚫 Login denegado: Usuario {usuario.email} rechazado");
                    response.statusok = false;
                    response.mensaje = "Tu solicitud de vendedor fue rechazada. Contacta al administrador.";
                    response.codigoError = "RECHAZADO";
                    return response;
                }

                if (usuario.estadoUsuarioId == 3) // BLOQUEADO
                {
                    Console.WriteLine($"🚫 Login denegado: Usuario {usuario.email} bloqueado");
                    response.statusok = false;
                    response.mensaje = "Tu cuenta ha sido bloqueada. Contacta al administrador.";
                    response.codigoError = "BLOQUEADO";
                    return response;
                }

                if (usuario.estadoUsuarioId == 2) // INACTIVO
                {
                    Console.WriteLine($"🚫 Login denegado: Usuario {usuario.email} inactivo");
                    response.statusok = false;
                    response.mensaje = "Tu cuenta está inactiva. Contacta al administrador.";
                    response.codigoError = "INACTIVO";
                    return response;
                }

                if (usuario.estadoUsuarioId != 1) // Cualquier otro estado no válido
                {
                    Console.WriteLine($"🚫 Login denegado: Usuario {usuario.email} con estado no válido: {usuario.estadoUsuarioId}");
                    response.statusok = false;
                    response.mensaje = "No tienes permisos para acceder al sistema.";
                    response.codigoError = "ESTADO_INVALIDO";
                    return response;
                }

                // ✅ Usuario ACTIVO - Login exitoso
                Console.WriteLine($"✅ Login exitoso: {usuario.email} (Rol: {usuario.rolId})");

                // ✅ LIMPIAR INTENTOS FALLIDOS
                DataAcces.Ejecutar("sp_Limpiar_Intentos_Fallidos", new { email = credenciales.email });

                response.id = usuario.id;
                response.nombre = usuario.nombre;
                response.apellido = usuario.apellido;
                response.email = usuario.email;
                response.rolid = usuario.rolId;
                response.statusok = true;
                response.mensaje = "Login exitoso";

                return response;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR EN LOGIN: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                response.statusok = false;
                response.mensaje = "Error interno del servidor";
                response.codigoError = "ERROR_INTERNO";
                return response;
            }
        }

        // ============================================
        // GESTIÓN DE COMPROBANTES
        // ============================================
        public Entidad_ComprobantePago ConsultarComprobantePorOrden(int ordenId)
        {
            var comprobantes = DataAcces.Consultar<Entidad_ComprobantePago>("sp_Consultar_ComprobantesPago");
            return comprobantes.Where(c => c.ordenId == ordenId).FirstOrDefault();
        }

        public bool VerificarComprobante(int comprobanteId, int adminId)
        {
            return DataAcces.VerificarComprobante(comprobanteId, adminId);
        }

        public bool RechazarComprobante(int comprobanteId, int adminId, string motivoRechazo = "")
        {
            return DataAcces.RechazarComprobante(comprobanteId, adminId, motivoRechazo);
        }



        // ============================================
        // ✅ REDUCIR STOCK CON NOTIFICACIONES
        // ============================================
        public bool ReducirStockPorOrden(int ordenId)
        {
            try
            {
                Console.WriteLine($"");
                Console.WriteLine($"╔══════════════════════════════════════════════════════════╗");
                Console.WriteLine($"║  🔄 INICIANDO REDUCCIÓN DE STOCK PARA ORDEN #{ordenId}");
                Console.WriteLine($"╚══════════════════════════════════════════════════════════╝");

                // Obtener todos los items de la orden
                var items = Consultar<Entidad_Item>("sp_consultar_items")
                    .Where(i => i.ordenId == ordenId)
                    .ToList();

                if (items.Count == 0)
                {
                    Console.WriteLine($"⚠️ No se encontraron items para la orden {ordenId}");
                    return false;
                }

                Console.WriteLine($"📦 Se encontraron {items.Count} items en la orden");
                Console.WriteLine($"");

                // Procesar cada item
                foreach (var item in items)
                {
                    Console.WriteLine($"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

                    // Obtener el producto
                    var producto = ConsultarId<Entidad_Producto>("sp_consultar_productoId", item.productoId);

                    if (producto == null)
                    {
                        Console.WriteLine($"❌ Producto {item.productoId} no encontrado");
                        return false;
                    }

                    Console.WriteLine($"📦 Producto: {producto.nombre_producto}");
                    Console.WriteLine($"   Stock actual: {producto.stock}");
                    Console.WriteLine($"   Cantidad vendida: {item.cantidad}");

                    // Reducir stock
                    int stockNuevo = producto.stock - item.cantidad;
                    producto.stock = stockNuevo;

                    Console.WriteLine($"   Stock nuevo: {stockNuevo}");

                    // ✅ CAMBIAR ESTADO SI STOCK = 0
                    if (stockNuevo <= 0)
                    {
                        producto.estadoProductoId = 2; // AGOTADO
                        Console.WriteLine($"   ⚠️ Producto AGOTADO - Estado cambiado a 2");

                        // ✅✅✅ VERIFICAR SI LAS ALERTAS DE STOCK ESTÁN HABILITADAS
                        bool alertasHabilitadas = _configuracionService.ObtenerBooleano("habilitar_alertas_stock", true);
                        Console.WriteLine($"   🔧 Configuración habilitar_alertas_stock = {alertasHabilitadas}");

                        if (alertasHabilitadas)
                        {
                            // ✅ NOTIFICAR AL VENDEDOR
                            try
                            {
                                Console.WriteLine($"");
                                Console.WriteLine($"   📧 Enviando notificación de stock agotado...");

                                var vendedor = Consultar<Entidad_Vendedor>("sp_listar_vendedores")
                                    .Where(v => v.id == producto.vendedorId)
                                    .FirstOrDefault();

                                if (vendedor != null)
                                {
                                    Console.WriteLine($"   ✅ Vendedor: {vendedor.nombre_comercial} (ID: {vendedor.id})");

                                    var usuarioVendedor = Consultar<Entidad_Usuario>("sp_listar_usuario")
                                        .Where(u => u.id == vendedor.usuarioId)
                                        .FirstOrDefault();

                                    if (usuarioVendedor != null)
                                    {
                                        Console.WriteLine($"   ✅ Email vendedor: {usuarioVendedor.email}");
                                        Console.WriteLine($"   📧 Llamando a NotificarStockAgotado...");

                                        var enviadoStock = _emailService.NotificarStockAgotado(
                                            producto.nombre_producto,
                                            producto.id,
                                            vendedor.nombre_comercial,
                                            usuarioVendedor.email
                                        ).Result;

                                        if (enviadoStock)
                                        {
                                            Console.WriteLine($"   ✅✅✅ EMAILS DE STOCK AGOTADO ENVIADOS CORRECTAMENTE");
                                        }
                                        else
                                        {
                                            Console.WriteLine($"   ❌❌❌ NO SE PUDIERON ENVIAR EMAILS DE STOCK");
                                        }
                                    }
                                    else
                                    {
                                        Console.WriteLine($"   ❌ Usuario vendedor NO encontrado (usuarioId: {vendedor.usuarioId})");
                                    }
                                }
                                else
                                {
                                    Console.WriteLine($"   ❌ Vendedor NO encontrado (vendedorId: {producto.vendedorId})");
                                }
                            }
                            catch (Exception exStock)
                            {
                                Console.WriteLine($"   ❌ ERROR notificando stock: {exStock.Message}");
                                Console.WriteLine($"   Stack: {exStock.StackTrace}");
                            }
                        }
                        else
                        {
                            Console.WriteLine($"   ⚠️⚠️⚠️ ALERTAS DE STOCK DESHABILITADAS - No se enviará email");
                        }
                    }
                    else if (stockNuevo > 0)
                    {
                        // ✅✅✅ NUEVO: VERIFICAR SI LLEGÓ AL STOCK MÍNIMO
                        int stockMinimo = _configuracionService.ObtenerEntero("stock_minimo_alerta", 5);

                        if (stockNuevo <= stockMinimo)
                        {
                            Console.WriteLine($"   ⚠️ Stock en nivel MÍNIMO (stock: {stockNuevo} <= mínimo: {stockMinimo})");

                            bool alertasHabilitadas = _configuracionService.ObtenerBooleano("habilitar_alertas_stock", true);
                            Console.WriteLine($"   🔧 Configuración habilitar_alertas_stock = {alertasHabilitadas}");

                            if (alertasHabilitadas)
                            {
                                try
                                {
                                    Console.WriteLine($"");
                                    Console.WriteLine($"   📧 Enviando notificación de stock mínimo...");

                                    var vendedor = Consultar<Entidad_Vendedor>("sp_listar_vendedores")
                                        .Where(v => v.id == producto.vendedorId)
                                        .FirstOrDefault();

                                    if (vendedor != null)
                                    {
                                        Console.WriteLine($"   ✅ Vendedor: {vendedor.nombre_comercial} (ID: {vendedor.id})");

                                        var usuarioVendedor = Consultar<Entidad_Usuario>("sp_listar_usuario")
                                            .Where(u => u.id == vendedor.usuarioId)
                                            .FirstOrDefault();

                                        if (usuarioVendedor != null)
                                        {
                                            Console.WriteLine($"   ✅ Email vendedor: {usuarioVendedor.email}");
                                            Console.WriteLine($"   📧 Llamando a NotificarStockMinimo...");

                                            var enviadoMinimo = _emailService.NotificarStockMinimo(
                                                producto.nombre_producto,
                                                producto.id,
                                                stockNuevo,
                                                stockMinimo,
                                                vendedor.nombre_comercial,
                                                usuarioVendedor.email
                                            ).Result;

                                            if (enviadoMinimo)
                                            {
                                                Console.WriteLine($"   ✅✅✅ EMAIL DE STOCK MÍNIMO ENVIADO CORRECTAMENTE");
                                            }
                                            else
                                            {
                                                Console.WriteLine($"   ❌❌❌ NO SE PUDO ENVIAR EMAIL DE STOCK MÍNIMO");
                                            }
                                        }
                                        else
                                        {
                                            Console.WriteLine($"   ❌ Usuario vendedor NO encontrado (usuarioId: {vendedor.usuarioId})");
                                        }
                                    }
                                    else
                                    {
                                        Console.WriteLine($"   ❌ Vendedor NO encontrado (vendedorId: {producto.vendedorId})");
                                    }
                                }
                                catch (Exception exMinimo)
                                {
                                    Console.WriteLine($"   ❌ ERROR notificando stock mínimo: {exMinimo.Message}");
                                    Console.WriteLine($"   Stack: {exMinimo.StackTrace}");
                                }
                            }
                            else
                            {
                                Console.WriteLine($"   ⚠️ ALERTAS DE STOCK DESHABILITADAS - No se enviará email de stock mínimo");
                            }
                        }

                        // Reactivar si tenía stock y estaba agotado
                        if (producto.estadoProductoId == 2)
                        {
                            producto.estadoProductoId = 1; // DISPONIBLE
                            Console.WriteLine($"   ✅ Producto reactivado a DISPONIBLE");
                        }
                    }

                    // Actualizar producto en BD
                    Console.WriteLine($"");
                    Console.WriteLine($"   💾 Actualizando producto en base de datos...");
                    bool actualizado = Actualizar("sp_Actualizar_Producto", producto);

                    if (!actualizado)
                    {
                        Console.WriteLine($"   ❌ ERROR al actualizar producto {producto.nombre_producto}");
                        return false;
                    }

                    Console.WriteLine($"   ✅ Producto actualizado correctamente en BD");
                }

                Console.WriteLine($"");
                Console.WriteLine($"╔══════════════════════════════════════════════════════════╗");
                Console.WriteLine($"║  ✅ STOCK REDUCIDO CORRECTAMENTE PARA ORDEN #{ordenId}");
                Console.WriteLine($"╚══════════════════════════════════════════════════════════╝");
                Console.WriteLine($"");

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"");
                Console.WriteLine($"❌❌❌ ERROR EN REDUCIRSTOCKPORORDEN ❌❌❌");
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                Console.WriteLine($"");
                return false;
            }
        }

        // ============================================
        // GESTIÓN DE VENDEDORES
        // ============================================
        public bool AprobarUsuario(int usuarioId, int adminId)
        {
            return DataAcces.AprobarUsuario(usuarioId, adminId);
        }

        public bool RechazarUsuario(int usuarioId, int adminId)
        {
            return DataAcces.RechazarUsuario(usuarioId, adminId);
        }

        public List<Entidad_Producto> ObtenerProductosPorVendedor(int vendedorId)
        {
            return Consultar<Entidad_Producto>("sp_consultar_productos")
                .Where(p => p.vendedorId == vendedorId)
                .ToList();
        }

        public Entidad_Vendedor ObtenerVendedorPorUsuario(int usuarioId)
        {
            return Consultar<Entidad_Vendedor>("sp_listar_vendedores")
                .Where(v => v.usuarioId == usuarioId)
                .FirstOrDefault();
        }

        // ============================================
        // VALIDACIÓN DE PERMISOS
        // ============================================
        public bool VendedorPuedeEditarProducto(int usuarioId, int productoId)
        {
            var vendedor = ObtenerVendedorPorUsuario(usuarioId);
            if (vendedor == null) return false;

            var producto = ConsultarId<Entidad_Producto>("sp_consultar_productoId", productoId);
            if (producto == null) return false;

            return producto.vendedorId == vendedor.id;
        }

        public bool UsuarioEsVendedor(int usuarioId)
        {
            var usuario = Consultar<Entidad_Usuario>("sp_listar_usuario")
                .Where(u => u.id == usuarioId)
                .FirstOrDefault();

            return usuario != null && usuario.rolId == 3;
        }

        public bool UsuarioEsAdmin(int usuarioId)
        {
            var usuario = Consultar<Entidad_Usuario>("sp_listar_usuario")
                .Where(u => u.id == usuarioId)
                .FirstOrDefault();

            return usuario != null && usuario.rolId == 1;
        }


        // ============================================
        // ✅ CARRITO - CON INFORMACIÓN DEL VENDEDOR
        // ============================================
        public List<Entidad_carrito> elementosCart(int id)
        {
            Console.WriteLine($"🔍 Buscando items para usuario: {id}");

            List<Entidad_carrito> response = new List<Entidad_carrito>();

            var items = Consultar<Entidad_Item>("sp_consultar_items")
                .Where(p => p.usuarioId == id)
                .Where(p => p.estadoItemId == 1)
                .ToList();

            Console.WriteLine($"📦 Items encontrados después del filtro: {items.Count}");

            foreach (var item in items)
            {
                Console.WriteLine($"   - Item ID: {item.id}, Producto: {item.productoId}, Usuario: {item.usuarioId}, Estado: {item.estadoItemId}");

                var producto = ConsultarId<Entidad_Producto>("sp_consultar_productoId", item.productoId);

                if (producto == null)
                {
                    Console.WriteLine($"   ⚠️ ADVERTENCIA: Producto {item.productoId} no encontrado");
                    continue;
                }

                Console.WriteLine($"   ✅ Producto encontrado: {producto.nombre_producto}");
                Console.WriteLine($"   ✅ Categoría: {producto.categoria_producto_Id}");
                Console.WriteLine($"   ✅ Vendedor ID: {producto.vendedorId}");

                // ✅ OBTENER INFORMACIÓN DEL VENDEDOR
                string nombreVendedor = "Vendedor desconocido";
                try
                {
                    var vendedor = Consultar<Entidad_Vendedor>("sp_listar_vendedores")
                        .Where(v => v.id == producto.vendedorId)
                        .FirstOrDefault();

                    if (vendedor != null)
                    {
                        nombreVendedor = vendedor.nombre_comercial;
                        Console.WriteLine($"   ✅ Vendedor: {nombreVendedor}");
                    }
                    else
                    {
                        Console.WriteLine($"   ⚠️ Vendedor no encontrado para ID: {producto.vendedorId}");
                    }
                }
                catch (Exception exVendedor)
                {
                    Console.WriteLine($"   ❌ Error al obtener vendedor: {exVendedor.Message}");
                }

                // ✅ CREAR OBJETO CON TODOS LOS CAMPOS INCLUYENDO VENDEDOR
                var elemento = new Entidad_carrito
                {
                    id = item.id,
                    descripcion = producto.descripcion,
                    Nombre = producto.nombre_producto,
                    nombre_producto = producto.nombre_producto,
                    img = producto.url_Img,
                    precio = producto.precio_ahora,
                    stock = producto.stock,
                    categoria_producto_Id = producto.categoria_producto_Id,
                    vendedorId = producto.vendedorId,            // ✅ AGREGADO
                    nombre_vendedor = nombreVendedor,            // ✅ AGREGADO
                    Entidad_Item = item
                };

                response.Add(elemento);
            }

            Console.WriteLine($"✅ Total items en carrito a retornar: {response.Count}");
            return response;
        }

        // ============================================
        // MÉTODOS DE DEVOLUCIONES
        // ============================================

        /// <summary>
        /// Consulta todos los estados de devolución
        /// </summary>
        public List<Entidad_EstadoDevolucion> ConsultarEstadoDevolucion()
        {
            return DataAcces.Consultar<Entidad_EstadoDevolucion>("sp_Consultar_EstadoDevolucion");
        }

        /// <summary>
        /// Registra una nueva devolución
        /// </summary>
        public int RegistrarDevolucion(Entidad_Devolucion devolucion)
        {
            try
            {
                var parametros = new
                {
                    ordenId = devolucion.ordenId,
                    usuarioId = devolucion.usuarioId,
                    motivo = devolucion.motivo,
                    tipo_devolucion = devolucion.tipo_devolucion,
                    descripcion_detallada = devolucion.descripcion_detallada ?? string.Empty,
                    url_foto_1 = devolucion.url_foto_1,
                    url_foto_2 = devolucion.url_foto_2,
                    url_foto_3 = devolucion.url_foto_3
                };

                var resultado = DataAcces.RegistrarDevolucionConRetorno("sp_Registrar_Devolucion", parametros);
                Console.WriteLine($"🔍 RegistrarDevolucion resultado: {resultado}");
                return resultado;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al registrar devolución: {ex.Message}");
                return 0;
            }
        }

        /// <summary>
        /// Registra un item de devolución
        /// </summary>
        public bool RegistrarItemDevolucion(Entidad_ItemDevolucion item)
        {
            try
            {
                return DataAcces.Registrar("sp_Registrar_ItemDevolucion", item);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al registrar item de devolución: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Consulta las devoluciones de un usuario
        /// </summary>
        public List<Entidad_Devolucion> ConsultarDevolucionesPorUsuario(int usuarioId)
        {
            try
            {
                // Usar el método Consultar genérico con filtro LINQ
                return DataAcces.Consultar<Entidad_Devolucion>("sp_Consultar_TodasDevoluciones")
                    .Where(d => d.usuarioId == usuarioId)
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al consultar devoluciones: {ex.Message}");
                return new List<Entidad_Devolucion>();
            }
        }

        /// <summary>
        /// Consulta los items de una devolución
        /// </summary>
        public List<Entidad_ItemDevolucion> ConsultarItemsDevolucion(int devolucionId)
        {
            var items = new List<Entidad_ItemDevolucion>();
            try
            {
                string connStr = DataAcces.GetConnectionString();
                using (var connection = new SqlConnection(connStr))
                using (var command = new SqlCommand("sp_Consultar_ItemsDevolucion", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@devolucionId", devolucionId);
                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            items.Add(new Entidad_ItemDevolucion
                            {
                                id = reader["id"] != DBNull.Value ? Convert.ToInt32(reader["id"]) : 0,
                                devolucionId = reader["devolucionId"] != DBNull.Value ? Convert.ToInt32(reader["devolucionId"]) : 0,
                                itemId = reader["itemId"] != DBNull.Value ? Convert.ToInt32(reader["itemId"]) : 0,
                                productoId = reader["productoId"] != DBNull.Value ? Convert.ToInt32(reader["productoId"]) : 0,
                                cantidad = reader["cantidad"] != DBNull.Value ? Convert.ToInt32(reader["cantidad"]) : 0,
                                precio_unitario = reader["precio_unitario"] != DBNull.Value ? Convert.ToDecimal(reader["precio_unitario"]) : 0,
                                motivo_item = reader["motivo_item"] != DBNull.Value ? reader["motivo_item"].ToString() : null,
                                nombre_producto = reader["nombre_producto"] != DBNull.Value ? reader["nombre_producto"].ToString() : null,
                                url_imagen = reader["url_imagen"] != DBNull.Value ? reader["url_imagen"].ToString() : null
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al consultar items de devolución: {ex.Message}");
            }
            return items;
        }
        /// <summary>
        /// Consulta una devolución por ID
        /// </summary>
        public Entidad_Devolucion ConsultarDevolucionPorId(int id)
        {
            try
            {
                return DataAcces.ConsultarId<Entidad_Devolucion>("sp_Consultar_DevolucionPorId", id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al consultar devolución: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Verifica si una orden puede ser devuelta
        /// </summary>
        public dynamic VerificarPuedeDevolver(int ordenId)
        {
            try
            {
                var parametros = new { ordenId = ordenId };
                return DataAcces.VerificarPuedeDevolver("sp_Verificar_PuedeDevolver", parametros);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al verificar devolución: {ex.Message}");
                return new { puede_devolver = false, motivo_no_puede = "Error al verificar" };
            }
        }

        /// <summary>
        /// Cancela una devolución (cliente)
        /// </summary>
        public bool CancelarDevolucion(int devolucionId, int usuarioId)
        {
            try
            {
                var parametros = new
                {
                    devolucionId = devolucionId,
                    usuarioId = usuarioId
                };

                return DataAcces.RegistrarConProcedimiento("sp_Cancelar_Devolucion", parametros);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al cancelar devolución: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Consulta todas las devoluciones (ADMIN)
        /// </summary>
        public List<Entidad_Devolucion> ConsultarTodasDevoluciones()
        {
            try
            {
                return DataAcces.Consultar<Entidad_Devolucion>("sp_Consultar_TodasDevoluciones");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al consultar todas las devoluciones: {ex.Message}");
                return new List<Entidad_Devolucion>();
            }
        }

        /// <summary>
        /// Actualiza el estado de una devolución (ADMIN)
        /// </summary>
        public bool ActualizarEstadoDevolucion(
            int devolucionId,
            int estadoDevolucionId,
            string numeroSeguimiento = null,
            int? respondidoPor = null,
            string respuestaAdmin = null)
        {
            try
            {
                var parametros = new
                {
                    devolucionId = devolucionId,
                    estadoDevolucionId = estadoDevolucionId,
                    numero_seguimiento = numeroSeguimiento,
                    respondido_por = respondidoPor,
                    respuesta_admin = respuestaAdmin
                };

                return DataAcces.RegistrarConProcedimiento("sp_Actualizar_EstadoDevolucion", parametros);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al actualizar estado de devolución: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// ✅ NUEVO: Aprueba una solicitud de devolución y notifica al cliente
        /// </summary>
        public bool AprobarDevolucion(int devolucionId, string numeroSeguimiento, int respondidoPor, string respuestaAdmin)
        {
            try
            {
                string connStr = DataAcces.GetConnectionString();
                Console.WriteLine($"🔍 AprobarDevolucion - connStr null? {connStr == null} - devolucionId={devolucionId} respondidoPor={respondidoPor}");

                using (var connection = new SqlConnection(connStr))
                {
                    using (var command = new SqlCommand("sp_Aprobar_Devolucion_SinEmails", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@devolucionId", devolucionId);
                        command.Parameters.AddWithValue("@numero_seguimiento", numeroSeguimiento ?? $"REF-{devolucionId}-{DateTime.Now:yyyyMMdd}");
                        command.Parameters.AddWithValue("@respondido_por", respondidoPor);
                        command.Parameters.AddWithValue("@respuesta_admin",
                            string.IsNullOrEmpty(respuestaAdmin) ? (object)DBNull.Value : respuestaAdmin);

                        var outputParam = new SqlParameter("@accion", SqlDbType.Bit)
                        {
                            Direction = ParameterDirection.Output
                        };
                        command.Parameters.Add(outputParam);

                        connection.Open();
                        command.ExecuteNonQuery();
                        bool accion = outputParam.Value != DBNull.Value && (bool)outputParam.Value;
                        Console.WriteLine($"🔍 sp_Aprobar resultado @accion = {accion}");

                        if (accion && _emailService != null)
                        {
                            try
                            {
                                var devolucion = ConsultarDevolucionPorId(devolucionId);
                                if (devolucion != null)
                                {
                                    var items = ConsultarItemsDevolucion(devolucionId);
                                    decimal totalDevolucion = items.Sum(i => i.cantidad * i.precio_unitario);
                                    _emailService.EnviarEmailDevolucionAprobada(
                                        devolucion.email_usuario, devolucion.nombre_usuario,
                                        devolucion.token_orden, devolucion.tipo_devolucion,
                                        totalDevolucion, numeroSeguimiento, respuestaAdmin
                                    ).Wait();
                                }
                            }
                            catch (Exception emailEx)
                            {
                                Console.WriteLine($"⚠️ Devolución aprobada pero error al enviar email: {emailEx.Message}");
                            }
                        }

                        return accion;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error EXACTO AprobarDevolucion #{devolucionId}: {ex.Message}");
                Console.WriteLine($"❌ Inner: {ex.InnerException?.Message}");
                return false;
            }
        }

        /// <summary>
        /// ✅ NUEVO: Rechaza una solicitud de devolución y notifica al cliente con el motivo
        /// </summary>
        public bool RechazarDevolucion(int devolucionId, int respondidoPor, string respuestaAdmin)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(respuestaAdmin))
                {
                    Console.WriteLine("❌ El motivo del rechazo es requerido");
                    return false;
                }

                string connStr = DataAcces.GetConnectionString();
                Console.WriteLine($"🔍 RechazarDevolucion - connStr null? {connStr == null} - devolucionId={devolucionId}");

                using (var connection = new SqlConnection(connStr))
                {
                    using (var command = new SqlCommand("sp_Rechazar_Devolucion_SinEmails", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@devolucionId", devolucionId);
                        command.Parameters.AddWithValue("@respondido_por", respondidoPor);
                        command.Parameters.AddWithValue("@respuesta_admin", respuestaAdmin);

                        var outputParam = new SqlParameter("@accion", SqlDbType.Bit)
                        {
                            Direction = ParameterDirection.Output
                        };
                        command.Parameters.Add(outputParam);

                        connection.Open();
                        command.ExecuteNonQuery();
                        bool accion = outputParam.Value != DBNull.Value && (bool)outputParam.Value;
                        Console.WriteLine($"🔍 sp_Rechazar resultado @accion = {accion}");

                        if (accion && _emailService != null)
                        {
                            try
                            {
                                var devolucion = ConsultarDevolucionPorId(devolucionId);
                                if (devolucion != null)
                                {
                                    _emailService.EnviarEmailDevolucionRechazada(
                                        devolucion.email_usuario, devolucion.nombre_usuario,
                                        devolucion.token_orden, devolucion.tipo_devolucion,
                                        devolucion.motivo, respuestaAdmin
                                    ).Wait();
                                }
                            }
                            catch (Exception emailEx)
                            {
                                Console.WriteLine($"⚠️ Devolución rechazada pero error al enviar email: {emailEx.Message}");
                            }
                        }

                        return accion;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error EXACTO RechazarDevolucion #{devolucionId}: {ex.Message}");
                Console.WriteLine($"❌ Inner: {ex.InnerException?.Message}");
                return false;
            }
        }

        /// <summary>
        /// Obtiene la información del vendedor asociado a una orden (PRIVADO)
        /// </summary>
        private dynamic ObtenerVendedorDeOrden(int ordenId)
        {
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    var query = @"
                        SELECT TOP 1 
                            u.email,
                            u.nombre + ' ' + u.apellido as nombre
                        FROM Items i
                        INNER JOIN producto p ON i.productoId = p.id
                        INNER JOIN Vendedor v ON p.vendedorId = v.id
                        INNER JOIN Usuario u ON v.usuarioId = u.id
                        WHERE i.ordenId = @ordenId";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@ordenId", ordenId);
                        connection.Open();

                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                return new
                                {
                                    email = reader["email"].ToString(),
                                    nombre = reader["nombre"].ToString()
                                };
                            }
                        }
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al obtener vendedor: {ex.Message}");
                return null;
            }
        }
    }
    public class BloqueoUsuario
    {
        public string email { get; set; }
        public int esta_bloqueado { get; set; }
        public DateTime? bloqueado_hasta { get; set; }
        public int intentos_fallidos { get; set; }
        public int minutos_restantes { get; set; }
    }

    public class IntentoFallidoResponse
    {
        public int intentos_fallidos { get; set; }
        public int max_intentos { get; set; }
        public DateTime? bloqueado_hasta { get; set; }
    }
}