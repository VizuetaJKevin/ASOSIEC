import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Servicio de Configuración
 *
 * Gestiona TODAS las configuraciones del sistema:
 * 1. Configuraciones del environment.ts
 * 2. Configuraciones dinámicas del backend (tabla Configuracion)
 * 3. Caché de configuraciones para rendimiento
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  // Caché de configuraciones desde el backend
  private configuracionesCache = new BehaviorSubject<Map<string, any>>(new Map());
  private ultimaActualizacion: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor(private http: HttpClient) {
    this.cargarConfiguraciones();
  }

  // ============================================
  // CONFIGURACIONES DEL ENVIRONMENT
  // ============================================

  /**
   * Obtiene la URL base del API
   */
  get apiBaseUrl(): string {
    return environment.api.baseUrl;
  }

  /**
   * Verifica si estamos en producción
   */
  get isProduction(): boolean {
    return environment.production;
  }

  /**
   * Obtiene el timeout de las peticiones HTTP
   */
  get apiTimeout(): number {
    return environment.api.timeout;
  }

  /**
   * Obtiene el tamaño máximo de archivo permitido
   */
  get maxFileSize(): number {
    return environment.files.maxFileSize;
  }

  /**
   * Obtiene los tipos de imagen permitidos
   */
  get allowedImageTypes(): string[] {
    return environment.files.allowedImageTypes;
  }

  /**
   * Obtiene el tamaño de página por defecto
   */
  get defaultPageSize(): number {
    return environment.ui.defaultPageSize;
  }

  /**
   * Obtiene las opciones de tamaño de página
   */
  get pageSizeOptions(): number[] {
    return environment.ui.pageSizeOptions;
  }

  /**
   * Obtiene el tiempo de debounce para búsquedas
   */
  get debounceTime(): number {
    return environment.ui.debounceTime;
  }

  /**
   * Obtiene la duración de las notificaciones toast
   */
  get toastDuration(): number {
    return environment.ui.toastDuration;
  }

  // ============================================
  // REGLAS DE NEGOCIO
  // ============================================

  /**
   * Stock mínimo para mostrar alerta
   */
  get minStockAlert(): number {
    return this.obtenerConfiguracion('minStockAlert', environment.businessRules.minStockAlert);
  }

  /**
   * Máximo de items por orden
   */
  get maxItemsPerOrder(): number {
    return this.obtenerConfiguracion('maxItemsPerOrder', environment.businessRules.maxItemsPerOrder);
  }

  /**
   * Longitud mínima de contraseña
   */
  get minPasswordLength(): number {
    return this.obtenerConfiguracion('minPasswordLength', environment.businessRules.minPasswordLength);
  }

  /**
   * Máximo de intentos de login
   */
  get maxLoginAttempts(): number {
    return this.obtenerConfiguracion('maxLoginAttempts', environment.businessRules.maxLoginAttempts);
  }

  /**
   * Días de expiración de orden
   */
  get orderExpirationDays(): number {
    return this.obtenerConfiguracion('orderExpirationDays', environment.businessRules.orderExpirationDays);
  }

  /**
   * Porcentaje de comisión de la plataforma
   */
  get platformCommissionPercent(): number {
    return this.obtenerConfiguracion('platformCommissionPercent', environment.businessRules.platformCommissionPercent);
  }

  // ============================================
  // FEATURES (Funcionalidades habilitadas)
  // ============================================

  /**
   * Verifica si las reviews están habilitadas
   */
  get enableReviews(): boolean {
    return environment.features.enableReviews;
  }

  /**
   * Verifica si la wishlist está habilitada
   */
  get enableWishlist(): boolean {
    return environment.features.enableWishlist;
  }

  /**
   * Verifica si el modo debug está habilitado
   */
  get enableDebugMode(): boolean {
    return environment.features.enableDebugMode;
  }

  /**
   * Verifica si las notificaciones están habilitadas
   */
  get enableNotifications(): boolean {
    return environment.features.enableNotifications;
  }

  // ============================================
  // MENSAJES DEL SISTEMA
  // ============================================

  /**
   * Obtiene un mensaje de éxito
   */
  getMensajeExito(tipo: string): string {
    const mensajes = environment.messages.success;
    return (tipo in mensajes) ? (mensajes as any)[tipo] : 'Operación exitosa';
  }

  /**
   * Obtiene un mensaje de error
   */
  getMensajeError(tipo: string): string {
    const mensajes = environment.messages.errors;
    return (tipo in mensajes) ? (mensajes as any)[tipo] : 'Ha ocurrido un error';
  }

  /**
   * Obtiene un mensaje de advertencia
   */
  getMensajeAdvertencia(tipo: string): string {
    const mensajes = environment.messages.warnings;
    return (tipo in mensajes) ? (mensajes as any)[tipo] : 'Advertencia';
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  /**
   * Obtiene el patrón de validación de email
   */
  get emailPattern(): string {
    return environment.validations.email.pattern;
  }

  /**
   * Obtiene el patrón de validación de contraseña
   */
  get passwordPattern(): string {
    return environment.validations.password.pattern;
  }

  /**
   * Obtiene el mensaje de validación de email
   */
  get emailValidationMessage(): string {
    return environment.validations.email.message;
  }

  /**
   * Obtiene el mensaje de validación de contraseña
   */
  get passwordValidationMessage(): string {
    return environment.validations.password.message;
  }

  // ============================================
  // CONFIGURACIONES DINÁMICAS (desde Backend)
  // ============================================

  /**
   * Carga todas las configuraciones desde el backend
   */
  private cargarConfiguraciones(): void {
    // Solo recargar si el caché ha expirado
    if (this.ultimaActualizacion &&
        (Date.now() - this.ultimaActualizacion.getTime() < this.CACHE_DURATION)) {
      return;
    }

    this.http.get<any[]>(`${this.apiBaseUrl}ConsultarConfiguraciones`)
      .pipe(
        catchError(error => {
          console.warn('No se pudieron cargar configuraciones del backend, usando valores por defecto', error);
          return of([]);
        })
      )
      .subscribe(configuraciones => {
        const mapaConfig = new Map<string, any>();
        configuraciones.forEach(config => {
          mapaConfig.set(config.clave, this.parsearValor(config.valor, config.tipo));
        });
        this.configuracionesCache.next(mapaConfig);
        this.ultimaActualizacion = new Date();
      });
  }

  /**
   * Obtiene una configuración (primero del backend, luego de environment)
   */
  private obtenerConfiguracion<T>(clave: string, valorPorDefecto: T): T {
    const cache = this.configuracionesCache.value;
    if (cache.has(clave)) {
      return cache.get(clave) as T;
    }
    return valorPorDefecto;
  }

  /**
   * Parsea el valor según su tipo
   */
  private parsearValor(valor: string, tipo: string): any {
    switch (tipo.toUpperCase()) {
      case 'NUMBER':
        return parseFloat(valor);
      case 'BOOLEAN':
        return valor.toLowerCase() === 'true';
      case 'JSON':
        try {
          return JSON.parse(valor);
        } catch {
          return valor;
        }
      default:
        return valor;
    }
  }

  /**
   * Fuerza la recarga de configuraciones desde el backend
   */
  public recargarConfiguraciones(): Observable<void> {
    this.ultimaActualizacion = null;
    this.cargarConfiguraciones();
    return of(void 0);
  }

  /**
   * Guarda una configuración en el backend (solo ADMIN)
   */
  public guardarConfiguracion(clave: string, valor: any, descripcion?: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiBaseUrl}GuardarConfiguracion`, {
      clave,
      valor: valor.toString(),
      descripcion
    }).pipe(
      tap(() => this.recargarConfiguraciones()),
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Obtiene todas las configuraciones como Observable
   */
  public obtenerConfiguracionesObservable(): Observable<Map<string, any>> {
    return this.configuracionesCache.asObservable();
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Registra un log (solo si debug está habilitado)
   */
  public log(mensaje: string, ...args: any[]): void {
    if (this.enableDebugMode) {
      console.log(`[ConfigService] ${mensaje}`, ...args);
    }
  }

  /**
   * Formatea un número como moneda
   */
  public formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  }

  /**
   * Valida el tamaño de un archivo
   */
  public validarTamanoArchivo(archivo: File): boolean {
    return archivo.size <= this.maxFileSize;
  }

  /**
   * Valida el tipo de un archivo
   */
  public validarTipoArchivo(archivo: File): boolean {
    const extension = '.' + archivo.name.split('.').pop()?.toLowerCase();
    return this.allowedImageTypes.includes(extension);
  }

  /**
   * Obtiene el mensaje de error de validación de archivo
   */
  public obtenerMensajeErrorArchivo(archivo: File): string {
    if (!this.validarTamanoArchivo(archivo)) {
      return `El archivo es demasiado grande. Máximo ${this.maxFileSize / 1024 / 1024}MB`;
    }
    if (!this.validarTipoArchivo(archivo)) {
      return `Tipo de archivo no permitido. Permitidos: ${this.allowedImageTypes.join(', ')}`;
    }
    return '';
  }
}
