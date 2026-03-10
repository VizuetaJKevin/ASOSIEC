// ============================================
// ESTADOS DE USUARIO
// ============================================
export const ESTADOS_USUARIO = {
  PENDIENTE: 1,
  ACTIVO: 2,
  BLOQUEADO: 3,
  INACTIVO: 4,
  ELIMINADO: 5,
} as const;

export const ESTADOS_USUARIO_NOMBRES: { [key: number]: string } = {
  [ESTADOS_USUARIO.PENDIENTE]: 'Pendiente',
  [ESTADOS_USUARIO.ACTIVO]: 'Activo',
  [ESTADOS_USUARIO.BLOQUEADO]: 'Bloqueado',
  [ESTADOS_USUARIO.INACTIVO]: 'Inactivo',
  [ESTADOS_USUARIO.ELIMINADO]: 'Eliminado',
};

// ============================================
// ROLES
// ============================================
export const ROLES = {
  ADMIN: 1,
  CLIENTE: 2,
  VENDEDOR: 3,
} as const;

export const ROLES_NOMBRES: { [key: number]: string } = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.CLIENTE]: 'Cliente',
  [ROLES.VENDEDOR]: 'Vendedor',
};

// ============================================
// ESTADOS DE PRODUCTO
// ============================================
export const ESTADOS_PRODUCTO = {
  PENDIENTE: 1,
  APROBADO: 2,
  RECHAZADO: 3,
  AGOTADO: 4,
  DESCONTINUADO: 5,
} as const;

export const ESTADOS_PRODUCTO_NOMBRES: { [key: number]: string } = {
  [ESTADOS_PRODUCTO.PENDIENTE]: 'Pendiente',
  [ESTADOS_PRODUCTO.APROBADO]: 'Aprobado',
  [ESTADOS_PRODUCTO.RECHAZADO]: 'Rechazado',
  [ESTADOS_PRODUCTO.AGOTADO]: 'Agotado',
  [ESTADOS_PRODUCTO.DESCONTINUADO]: 'Descontinuado',
};

// Colores para badges de productos
export const ESTADOS_PRODUCTO_COLORES: { [key: number]: string } = {
  [ESTADOS_PRODUCTO.PENDIENTE]: 'warning',
  [ESTADOS_PRODUCTO.APROBADO]: 'success',
  [ESTADOS_PRODUCTO.RECHAZADO]: 'danger',
  [ESTADOS_PRODUCTO.AGOTADO]: 'secondary',
  [ESTADOS_PRODUCTO.DESCONTINUADO]: 'dark',
};

// ============================================
// ESTADOS DE ORDEN
// ============================================
export const ESTADOS_ORDEN = {
  PENDIENTE: 1,
  PAGADA: 2,
  EN_PREPARACION: 3,
  ENVIADA: 4,
  ENTREGADA: 5,
  CANCELADA: 6,
  DEVOLUCION: 7,
} as const;

export const ESTADOS_ORDEN_NOMBRES: { [key: number]: string } = {
  [ESTADOS_ORDEN.PENDIENTE]: 'Pendiente',
  [ESTADOS_ORDEN.PAGADA]: 'Pagada',
  [ESTADOS_ORDEN.EN_PREPARACION]: 'En Preparación',
  [ESTADOS_ORDEN.ENVIADA]: 'Enviada',
  [ESTADOS_ORDEN.ENTREGADA]: 'Entregada',
  [ESTADOS_ORDEN.CANCELADA]: 'Cancelada',
  [ESTADOS_ORDEN.DEVOLUCION]: 'Devolución',
};

// Colores para badges de órdenes
export const ESTADOS_ORDEN_COLORES: { [key: number]: string } = {
  [ESTADOS_ORDEN.PENDIENTE]: 'warning',
  [ESTADOS_ORDEN.PAGADA]: 'info',
  [ESTADOS_ORDEN.EN_PREPARACION]: 'primary',
  [ESTADOS_ORDEN.ENVIADA]: 'primary',
  [ESTADOS_ORDEN.ENTREGADA]: 'success',
  [ESTADOS_ORDEN.CANCELADA]: 'danger',
  [ESTADOS_ORDEN.DEVOLUCION]: 'secondary',
};

// Iconos para estados de orden
export const ESTADOS_ORDEN_ICONOS: { [key: number]: string } = {
  [ESTADOS_ORDEN.PENDIENTE]: 'schedule',
  [ESTADOS_ORDEN.PAGADA]: 'payment',
  [ESTADOS_ORDEN.EN_PREPARACION]: 'inventory',
  [ESTADOS_ORDEN.ENVIADA]: 'local_shipping',
  [ESTADOS_ORDEN.ENTREGADA]: 'check_circle',
  [ESTADOS_ORDEN.CANCELADA]: 'cancel',
  [ESTADOS_ORDEN.DEVOLUCION]: 'keyboard_return',
};

// ============================================
// ESTADOS DE ITEM
// ============================================
export const ESTADOS_ITEM = {
  PENDIENTE: 1,
  CONFIRMADO: 2,
  EN_PREPARACION: 3,
  ENVIADO: 4,
  ENTREGADO: 5,
  CANCELADO: 6,
} as const;

export const ESTADOS_ITEM_NOMBRES: { [key: number]: string } = {
  [ESTADOS_ITEM.PENDIENTE]: 'Pendiente',
  [ESTADOS_ITEM.CONFIRMADO]: 'Confirmado',
  [ESTADOS_ITEM.EN_PREPARACION]: 'En Preparación',
  [ESTADOS_ITEM.ENVIADO]: 'Enviado',
  [ESTADOS_ITEM.ENTREGADO]: 'Entregado',
  [ESTADOS_ITEM.CANCELADO]: 'Cancelado',
};

// ============================================
// RUTAS DEL SISTEMA
// ============================================
export const RUTAS = {
  // Públicas
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTOS: '/productos',
  PRODUCTO_DETALLE: '/producto',

  // Cliente
  CARRITO: '/carrito',
  MIS_ORDENES: '/mis-ordenes',
  PERFIL: '/perfil',

  // Vendedor
  VENDEDOR_DASHBOARD: '/vendedor/dashboard',
  VENDEDOR_PRODUCTOS: '/vendedor/productos',
  VENDEDOR_ORDENES: '/vendedor/ordenes',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USUARIOS: '/admin/usuarios',
  ADMIN_PRODUCTOS: '/admin/productos',
  ADMIN_ORDENES: '/admin/ordenes',
  ADMIN_REPORTES: '/admin/reportes',
  ADMIN_CONFIGURACION: '/admin/configuracion',
} as const;

// ============================================
// ENDPOINTS DEL API
// ============================================
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: 'Login',
  REGISTER: 'RegistrarUsuario',
  REFRESH_TOKEN: 'RefreshToken',

  // Usuarios
  USUARIOS: 'ConsultarUsuarios',
  USUARIO_POR_ID: 'ConsultarUsuario',
  ACTUALIZAR_USUARIO: 'ActualizarUsuario',
  ELIMINAR_USUARIO: 'EliminarUsuario',

  // Productos
  PRODUCTOS: 'ConsultarProductos',
  PRODUCTO_POR_ID: 'ConsultarProducto',
  CREAR_PRODUCTO: 'RegistrarProducto',
  ACTUALIZAR_PRODUCTO: 'ActualizarProducto',
  ELIMINAR_PRODUCTO: 'EliminarProducto',

  // Órdenes
  ORDENES: 'ConsultarOrdenes',
  ORDEN_POR_ID: 'ConsultarOrden',
  CREAR_ORDEN: 'RegistrarOrden',
  ACTUALIZAR_ORDEN: 'ActualizarOrden',

  // Reportes
  REPORTE_VENTAS: 'ReporteVentas',
  REPORTE_PRODUCTOS: 'ReporteProductos',
  REPORTE_USUARIOS: 'ReporteUsuarios',

  // Configuración
  CONFIGURACIONES: 'ConsultarConfiguraciones',
  GUARDAR_CONFIGURACION: 'GuardarConfiguracion',
} as const;

// ============================================
// MENSAJES DE CONFIRMACIÓN
// ============================================
export const MENSAJES_CONFIRMACION = {
  ELIMINAR_USUARIO: '¿Estás seguro de eliminar este usuario?',
  ELIMINAR_PRODUCTO: '¿Estás seguro de eliminar este producto?',
  CANCELAR_ORDEN: '¿Estás seguro de cancelar esta orden?',
  CERRAR_SESION: '¿Deseas cerrar sesión?',
  APROBAR_VENDEDOR: '¿Aprobar este vendedor?',
  RECHAZAR_PRODUCTO: '¿Rechazar este producto?',
} as const;

// ============================================
// LÍMITES Y VALIDACIONES
// ============================================
export const LIMITES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 50,
  MIN_STOCK: 0,
  MAX_STOCK: 99999,
  MIN_PRICE: 1.00,
  MAX_PRICE: 99999.99,
  MAX_FILE_SIZE: 5242880,  // 5 MB
  MAX_ITEMS_PER_ORDER: 50,
  MIN_STOCK_ALERT: 5,
} as const;

// ============================================
// TIPOS DE ARCHIVO PERMITIDOS
// ============================================
export const TIPOS_ARCHIVO = {
  IMAGENES: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  DOCUMENTOS: ['.pdf', '.doc', '.docx'],
  COMPROBANTES: ['.pdf', '.jpg', '.jpeg', '.png'],
} as const;

// ============================================
// PATRONES DE VALIDACIÓN (REGEX)
// ============================================
export const PATRONES = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
  TELEFONO: /^[0-9]{10}$/,
  SOLO_NUMEROS: /^[0-9]+$/,
  SOLO_LETRAS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  PRECIO: /^\d+(\.\d{1,2})?$/,
} as const;

// ============================================
// CONFIGURACIÓN DE PAGINACIÓN
// ============================================
export const PAGINACION = {
  PAGE_SIZE_DEFAULT: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  FIRST_PAGE: 0,
} as const;

// ============================================
// TIMEOUTS Y DELAYS
// ============================================
export const TIEMPOS = {
  DEBOUNCE_SEARCH: 300,      // ms para búsquedas
  TOAST_DURATION: 3000,      // ms para notificaciones
  AUTO_LOGOUT: 3600000,      // ms para auto-logout (1 hora)
  LOADING_DELAY: 500,        // ms antes de mostrar spinner
  RETRY_DELAY: 1000,         // ms antes de reintentar request
} as const;

// ============================================
// COLORES DEL SISTEMA
// ============================================
export const COLORES = {
  PRIMARY: '#3f51b5',
  ACCENT: '#ff4081',
  WARN: '#f44336',
  SUCCESS: '#4caf50',
  INFO: '#2196f3',
  WARNING: '#ff9800',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtiene el nombre de un estado de usuario
 */
export function obtenerNombreEstadoUsuario(estadoId: number): string {
  return ESTADOS_USUARIO_NOMBRES[estadoId] || 'Desconocido';
}

/**
 * Obtiene el nombre de un rol
 */
export function obtenerNombreRol(rolId: number): string {
  return ROLES_NOMBRES[rolId] || 'Desconocido';
}

/**
 * Obtiene el nombre de un estado de producto
 */
export function obtenerNombreEstadoProducto(estadoId: number): string {
  return ESTADOS_PRODUCTO_NOMBRES[estadoId] || 'Desconocido';
}

/**
 * Obtiene el nombre de un estado de orden
 */
export function obtenerNombreEstadoOrden(estadoId: number): string {
  return ESTADOS_ORDEN_NOMBRES[estadoId] || 'Desconocido';
}

/**
 * Verifica si un usuario es admin
 */
export function esAdmin(rolId: number): boolean {
  return rolId === ROLES.ADMIN;
}

/**
 * Verifica si un usuario es vendedor
 */
export function esVendedor(rolId: number): boolean {
  return rolId === ROLES.VENDEDOR;
}

/**
 * Verifica si un usuario es cliente
 */
export function esCliente(rolId: number): boolean {
  return rolId === ROLES.CLIENTE;
}
