import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "src/environments/environment";
import { Item } from "../interfaces/items.interface";
import { Orden } from '../interfaces/Orden.interface';
import { producto } from "../interfaces/producto.interface";
import { categoria_prod } from "../interfaces/categoria_prod.interface";
import { vendedorProducto } from "../interfaces/vendedorProducto.interface";
import { LoginService } from "./login.service";
import { CarritoInterface } from "../interfaces/carrito";
import { Configuracion } from "../interfaces/configuracion.interface";
import { Devolucion, ItemDevolucion, VerificacionDevolucion, EstadoDevolucion } from "../interfaces/devolucion.interface";

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl: string = environment.api.baseUrl;
    private http = inject(HttpClient);
    private sso = inject(LoginService);
    private headers: HttpHeaders = new HttpHeaders();

    // ✅ Contador de items en carrito (para el badge del header)
    totalItems: number = 0;

    private setHeaders() {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        this.headers = headers;
    }

    // ============================================
    // CONTADOR DE ITEMS (PARA UI)
    // ============================================

    /**
     * Actualiza el contador de items en el carrito
     * Este método se usa principalmente para actualizar el badge del carrito en el header
     */
    items(): void {
        // Verificar que el usuario esté logueado
        if (!this.sso.usuario || this.sso.usuario.id === 0) {
            this.totalItems = 0;
            return;
        }

        this.ConsultarItemsUsuarioId(this.sso.usuario.id).subscribe({
            next: (resp) => {
                this.totalItems = (resp && Array.isArray(resp)) ? resp.length : 0;
                console.log(`🛒 Items en carrito: ${this.totalItems}`);
            },
            error: (err) => {
                this.totalItems = 0;
                console.log('Carrito vacío o error al consultar items');
            }
        });
    }

    // ============================================
    // VENDEDOR_PRODUCTO
    // ============================================
    ConsultarVendedorProducto(): Observable<vendedorProducto[]> {
        this.setHeaders();
        return this.http.get<vendedorProducto[]>(`${this.baseUrl}ConsultarVendedorProducto`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    RegistrarVendedorProducto(vendedorProducto: vendedorProducto): Observable<boolean> {
        this.setHeaders();
        return this.http.post<boolean>(`${this.baseUrl}Registrar_VendedorProducto`, vendedorProducto, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ActualizarVendedorProducto(vendedorProducto: vendedorProducto): Observable<boolean> {
        this.setHeaders();
        return this.http.put<boolean>(`${this.baseUrl}Actualizar_VendedorProducto`, vendedorProducto, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    EliminarVendedorProducto(id: number): Observable<boolean> {
        this.setHeaders();
        return this.http.delete<boolean>(`${this.baseUrl}Eliminar_VendedorProducto/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    // ============================================
    // PRODUCTOS POR VENDEDOR
    // ============================================

    ConsultarProductosPorVendedor(vendedorId: number): Observable<producto[]> {
        this.setHeaders();
        return this.http.get<producto[]>(`${this.baseUrl}ConsultarProductosVendedor/${vendedorId}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ConsultarProductosPorUsuario(usuarioId: number): Observable<producto[]> {
        this.setHeaders();
        return this.http.get<producto[]>(`${this.baseUrl}ConsultarProductosPorUsuario/${usuarioId}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    // ============================================
    // CATEGORIA_PRODUCTO
    // ============================================
    ConsultarCategoria_Producto(): Observable<categoria_prod[]> {
        this.setHeaders();
        return this.http.get<categoria_prod[]>(`${this.baseUrl}ConsultarCategoriaProducto`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    RegistrarCategoria_Producto(Categoria_Producto: categoria_prod): Observable<boolean> {
        this.setHeaders();
        return this.http.post<boolean>(`${this.baseUrl}RegistrarCategoriaProducto`, Categoria_Producto, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ActualizarCategoria_Producto(Categoria_Producto: categoria_prod): Observable<boolean> {
        this.setHeaders();
        return this.http.put<boolean>(`${this.baseUrl}ActualizarCategoriaProducto`, Categoria_Producto, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    EliminarCategoria_Producto(id: number): Observable<boolean> {
        this.setHeaders();
        return this.http.delete<boolean>(`${this.baseUrl}EliminarCategoriaProducto/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    // ============================================
    // PRODUCTO
    // ============================================

    /**
     * Consulta productos para usuarios (excluye descontinuados)
     */
    ConsultarProducto(): Observable<producto[]> {
        this.setHeaders();
        return this.http.get<producto[]>(`${this.baseUrl}ConsultarProducto`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    /**
     * Consulta TODOS los productos (incluye descontinuados) - Solo para admin
     */
    ConsultarProductoAdmin(): Observable<producto[]> {
        this.setHeaders();
        return this.http.get<producto[]>(`${this.baseUrl}ConsultarProductoAdmin`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    RegistrarProducto(producto: producto): Observable<boolean> {
        this.setHeaders();
        return this.http.post<boolean>(`${this.baseUrl}RegistrarProducto`, producto, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ActualizarProducto(producto: producto): Observable<boolean> {
        this.setHeaders();
        return this.http.put<boolean>(`${this.baseUrl}ActualizarProducto`, producto, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    EliminarProducto(id: number): Observable<boolean> {
        this.setHeaders();
        return this.http.delete<boolean>(`${this.baseUrl}EliminarProducto/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

        /**
     * Listar productos pendientes de aprobación
     */
    ListarProductosPendientes(): Observable<producto[]> {
        this.setHeaders();
        return this.http.get<producto[]>(`${this.baseUrl}ListarProductosPendientes`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    /**
     * Listar productos por estado específico
     */
    ListarProductosPorEstado(estadoProductoId: number): Observable<producto[]> {
        this.setHeaders();
        return this.http.get<producto[]>(`${this.baseUrl}ListarProductosPorEstado/${estadoProductoId}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    /**
     * Aprobar un producto pendiente
     */
    AprobarProducto(productoId: number, adminId: number): Observable<any> {
        this.setHeaders();
        return this.http.post<any>(`${this.baseUrl}AprobarProducto`, {
            ProductoId: productoId,
            AdminId: adminId
        }, {
            headers: this.headers,
            responseType: 'json'
        });
    }

/**
 * Rechazar un producto pendiente
 */
RechazarProducto(productoId: number, adminId: number, motivoRechazo: string): Observable<any> {
    this.setHeaders();
    return this.http.post<any>(`${this.baseUrl}RechazarProducto`, {
        ProductoId: productoId,
        AdminId: adminId,
        MotivoRechazo: motivoRechazo
    }, {
        headers: this.headers,
        responseType: 'json'
    });
}

    // ============================================
    // ORDEN
    // ============================================
    ConsultarOrden(): Observable<Orden[]> {
        this.setHeaders();
        return this.http.get<Orden[]>(`${this.baseUrl}ConsultarOrdenes`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    consultarOrdenToken(token: string): Observable<Orden> {
        this.setHeaders();
        return this.http.get<Orden>(`${this.baseUrl}ConsultarOrden/${token}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ConsultarOrdenUsuarioId(id: number): Observable<Orden[]> {
        this.setHeaders();
        return this.http.get<Orden[]>(`${this.baseUrl}ConsultarOrdenUserId/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    RegistrarOrden(Orden: Orden): Observable<boolean> {
        this.setHeaders();
        localStorage.setItem('tokenOrden', Orden.token_orden);
        return this.http.post<boolean>(`${this.baseUrl}Registrar_orden`, Orden, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ActualizarOrden(Orden: Orden): Observable<boolean> {
        this.setHeaders();
        return this.http.put<boolean>(`${this.baseUrl}Actualizar_orden`, Orden, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    EliminarOrden(id: number): Observable<boolean> {
        this.setHeaders();
        return this.http.delete<boolean>(`${this.baseUrl}Eliminar_orden/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    // ============================================
    // COMPROBANTES DE PAGO
    // ============================================

    /**
     * Consulta todos los comprobantes de pago
     */
    ConsultarComprobantes(): Observable<any[]> {
        this.setHeaders();
        return this.http.get<any[]>(`${this.baseUrl}ConsultarComprobantes`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ConsultarComprobantePorOrden(ordenId: number): Observable<any> {
        this.setHeaders();
        return this.http.get<any>(`${this.baseUrl}ConsultarComprobantePorOrden/${ordenId}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    RegistrarComprobante(comprobante: any): Observable<any> {
        this.setHeaders();
        return this.http.post<any>(`${this.baseUrl}RegistrarComprobante`, comprobante, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    /**
     * Rechaza un comprobante de pago con motivo
     * @param id ID del comprobante
     * @param adminId ID del administrador que rechaza
     * @param motivo Motivo del rechazo (opcional, por defecto '')
     */
RechazarComprobante(id: number, adminId: number, motivo: string = ''): Observable<any> {
    console.log('🔍 Motivo recibido:', motivo);
    this.setHeaders();
    return this.http.post<any>(
        `${this.baseUrl}RechazarComprobante/${id}/${adminId}`,
        { motivo: motivo },
        { headers: this.headers }
    );
}

    VerificarComprobante(id: number, adminId: number): Observable<any> {
        this.setHeaders();
        return this.http.put<any>(`${this.baseUrl}VerificarComprobante/${id}/${adminId}`, {}, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ConsultarOrdenesConComprobantes(): Observable<any[]> {
        this.setHeaders();
        return this.http.get<any[]>(`${this.baseUrl}ConsultarOrdenesConComprobantes`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    // ============================================
    // DATOS BANCARIOS
    // ============================================
    ConsultarDatosBancariosActivos(): Observable<any[]> {
        this.setHeaders();
        return this.http.get<any[]>(`${this.baseUrl}ConsultarDatosBancariosActivos`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ConsultarDatosBancarios(): Observable<any[]> {
        this.setHeaders();
        return this.http.get<any[]>(`${this.baseUrl}ConsultarDatosBancarios`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    RegistrarDatosBancarios(datos: any): Observable<boolean> {
        this.setHeaders();
        return this.http.post<boolean>(`${this.baseUrl}RegistrarDatosBancarios`, datos, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ActualizarDatosBancarios(datos: any): Observable<boolean> {
        this.setHeaders();
        return this.http.put<boolean>(`${this.baseUrl}ActualizarDatosBancarios`, datos, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    EliminarDatosBancarios(id: number): Observable<boolean> {
        this.setHeaders();
        return this.http.delete<boolean>(`${this.baseUrl}EliminarDatosBancarios/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    // ============================================
    // ITEMS (CARRITO)
    // ============================================

    /**
     * Consulta todos los items
     */
    ConsultarItems(): Observable<Item[]> {
        this.setHeaders();
        return this.http.get<Item[]>(`${this.baseUrl}ConsultarItem`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ConsultarItemsPorOrden(ordenId: number): Observable<Item[]> {
    this.setHeaders();
    return this.http.get<Item[]>(`${this.baseUrl}ConsultarItemsPorOrden/${ordenId}`, {
        headers: this.headers,
        responseType: 'json'
    });
}

    /**
     * Consulta items del carrito de un usuario específico
     * Este es el método principal para obtener el carrito
     */
    ConsultarItemsUsuarioId(id: number): Observable<CarritoInterface[]> {
        this.setHeaders();
        return this.http.get<CarritoInterface[]>(`${this.baseUrl}ConsultarItemId/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    /**
     * Consulta productos comprados por un usuario
     */
    ConsultarmisproductosUsuarioId(id: number): Observable<Item[]> {
        this.setHeaders();
        return this.http.get<Item[]>(`${this.baseUrl}Consultarmisproductosid/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    /**
     * Registra un nuevo item en el carrito
     * Retorna { success: boolean } indicando si se agregó correctamente
     */
    RegistrarItems(Items: Item): Observable<{ success: boolean }> {
        this.setHeaders();
        return this.http.post<{ success: boolean }>(`${this.baseUrl}Registrar_Item`, Items, {
            headers: this.headers,
            responseType: 'json'
        }).pipe(
            tap(resp => {
                // Actualizar el contador de items si se agregó exitosamente
                if (resp.success) {
                    this.items();
                }
            })
        );
    }

    /**
     * Actualiza un item del carrito
     */
    ActualizarItems(Items: Item): Observable<boolean> {
        this.setHeaders();
        return this.http.put<boolean>(`${this.baseUrl}Actualizar_Item`, Items, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    /**
     * Elimina un item del carrito
     */
    EliminaItems(id: number): Observable<{ success: boolean }> {
        this.setHeaders();
        return this.http.delete<{ success: boolean }>(`${this.baseUrl}Eliminar_Item/${id}`, {
            headers: this.headers,
            responseType: 'json'
        }).pipe(
            tap(resp => {
                // Actualizar el contador de items si se eliminó exitosamente
                if (resp.success) {
                    this.items();
                }
            })
        );
    }

    /**
     * Actualiza items de un usuario y los asocia a una orden
     * Se usa al finalizar la compra
     */
    Actualizar_ItemUserId(userid: number, ordenId: number): Observable<{ success: boolean }> {
        this.setHeaders();
        return this.http.put<{ success: boolean }>(
            `${this.baseUrl}Actualizar_ItemUserId/${userid}/${ordenId}`,
            {}, // Body vacío requerido por HttpClient
            { headers: this.headers, responseType: 'json' }
        );
    }

      /**
       * Consulta todas las devoluciones (ADMIN)
       */
      ConsultarTodasDevoluciones(): Observable<Devolucion[]> {
        return this.http.get<Devolucion[]>(`${this.baseUrl}Devolucion/admin/todas`);
      }

      ConsultarEstadosDevolucion(): Observable<EstadoDevolucion[]> {
        return this.http.get<EstadoDevolucion[]>(`${this.baseUrl}Devolucion/estados`);
      }

      ConsultarDevolucionesPorUsuario(usuarioId: number): Observable<Devolucion[]> {
        return this.http.get<Devolucion[]>(`${this.baseUrl}Devolucion/usuario/${usuarioId}`);
      }

      ConsultarItemsDevolucion(devolucionId: number): Observable<ItemDevolucion[]> {
        return this.http.get<ItemDevolucion[]>(`${this.baseUrl}Devolucion/${devolucionId}/items`);
      }

      VerificarPuedeDevolver(ordenId: number): Observable<VerificacionDevolucion> {
        return this.http.get<VerificacionDevolucion>(`${this.baseUrl}Devolucion/verificar/${ordenId}`);
      }

      RegistrarDevolucion(devolucion: Partial<Devolucion>): Observable<any> {
        this.setHeaders();
        return this.http.post(`${this.baseUrl}Devolucion/registrar`, devolucion, {
          headers: this.headers,
          responseType: 'json'
        });
      }

       RegistrarItemsDevolucion(items: Partial<ItemDevolucion>[]): Observable<any> {
        this.setHeaders();  // ✅ AGREGAR ESTA LÍNEA
        return this.http.post(`${this.baseUrl}Devolucion/items`, items, {
          headers: this.headers,  // ✅ AGREGAR HEADERS
          responseType: 'json'
        });
      }

         ActualizarEstadoDevolucion(devolucionId: number, datos: any): Observable<any> {
        return this.http.put(`${this.baseUrl}Devolucion/admin/${devolucionId}/estado`, datos);
      }

      AprobarDevolucion(devolucionId: number, data: {
          NumeroSeguimiento: string;
          RespondidoPor: number;
          RespuestaAdmin?: string;
      }): Observable<any> {
          this.setHeaders();
          return this.http.post<any>(`${this.baseUrl}Devolucion/admin/${devolucionId}/aprobar`, data, {
              headers: this.headers,
              responseType: 'json'
          });
      }

      /**
       * ✅ CORREGIDO: Rechazar una devolución (ADMIN)
       * Parámetros con nombres en minúsculas para coincidir con el backend
       */
      RechazarDevolucion(devolucionId: number, data: {
          RespondidoPor: number;
          RespuestaAdmin: string;
      }): Observable<any> {
          this.setHeaders();
          return this.http.post<any>(`${this.baseUrl}Devolucion/admin/${devolucionId}/rechazar`, data, {
              headers: this.headers,
              responseType: 'json'
          });
      }

      /**
       * Sube una foto de devolución
       */
      SubirFotoDevolucion(formData: FormData): Observable<any> {
        return this.http.post(`${this.baseUrl}Devolucion/subir-foto`, formData);
      }

      /**
       * Consulta una devolución por ID
       */
      ConsultarDevolucionPorId(id: number): Observable<Devolucion> {
        return this.http.get<Devolucion>(`${this.baseUrl}Devolucion/${id}`);
      }

      /**
       * Cancela una devolución (Cliente)
       */
      CancelarDevolucion(devolucionId: number, usuarioId: number): Observable<any> {
        return this.http.put(`${this.baseUrl}Devolucion/${devolucionId}/cancelar`, usuarioId);
      }


    // ============================================
    // CONFIGURACIONES
    // ============================================

    /**
     * Obtiene todas las configuraciones del sistema
     */
    ConsultarConfiguraciones(): Observable<Configuracion[]> {
        this.setHeaders();
        return this.http.get<Configuracion[]>(`${this.baseUrl}ConsultarConfiguraciones`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    /**
     * Obtiene una configuración por su clave
     */
    ConsultarConfiguracionPorClave(clave: string): Observable<{ clave: string, valor: string }> {
        this.setHeaders();
        return this.http.get<{ clave: string, valor: string }>(`${this.baseUrl}Configuracion/Clave/${clave}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    /**
     * Actualiza una configuración existente (solo Admin)
     */
    ActualizarConfiguracion(config: Configuracion): Observable<{ mensaje: string, actualizado: boolean }> {
        this.setHeaders();
        return this.http.put<{ mensaje: string, actualizado: boolean }>(`${this.baseUrl}Actualizar_Configuracion`, config, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    /**
     * Refresca el caché de configuraciones en el backend (solo Admin)
     */
    RefrescarCacheConfiguracion(): Observable<{ mensaje: string }> {
        this.setHeaders();
        return this.http.post<{ mensaje: string }>(`${this.baseUrl}RefreshCache_Configuracion`, {}, {
            headers: this.headers,
            responseType: 'json'
        });
    }
}
