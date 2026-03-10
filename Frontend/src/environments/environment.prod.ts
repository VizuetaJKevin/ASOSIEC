export const environment = {
  // Identificador de ambiente
  production: true,
  environmentName: 'Producción',

  // ============================================
  // URLs DEL API
  // ============================================
  api: {
   baseUrl: 'https://localhost:44392/api/',
   timeout: 30000,
  },

  recaptcha: {
  siteKey: '6Lc9_lwsAAAAAIybBbuJs_p0jSZyP-50gzOM3rfN'
  },
  // ============================================
  // CONFIGURACIÓN DE AUTENTICACIÓN
  // ============================================
  auth: {
    tokenKey: 'jwt_token',
    userKey: 'current_user',
    sessionTimeout: 1800000,         // 30 minutos (más corto en producción)
    refreshTokenBefore: 300000,
  },

  // ============================================
  // REGLAS DE NEGOCIO
  // ============================================
  businessRules: {
    minStockAlert: 5,
    maxItemsPerOrder: 50,
    minPasswordLength: 8,
    maxLoginAttempts: 5,             // Más intentos en producción
    stockReservationMinutes: 30,
    orderExpirationDays: 7,
    platformCommissionPercent: 10.0,
  },

  // ============================================
  // CONFIGURACIÓN DE ARCHIVOS
  // ============================================
  files: {
    maxFileSize: 5242880,
    allowedImageTypes: ['.jpg', '.jpeg', '.png', '.webp'],  // Menos formatos en prod
    allowedImageMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // ============================================
  // PAGINACIÓN Y UI
  // ============================================
  ui: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50],   // Menos opciones en producción
    debounceTime: 500,               // Más largo para reducir requests
    toastDuration: 3000,
    loadingDelay: 300,
  },

  // ============================================
  // CACHÉ (más agresivo en producción)
  // ============================================
  cache: {
    enabled: true,
    productsCacheDuration: 600000,    // 10 minutos
    categoriesCacheDuration: 3600000, // 60 minutos
    userCacheDuration: 1800000,       // 30 minutos
  },

  // ============================================
  // FEATURES
  // ============================================
  features: {
    enableReviews: false,
    enableWishlist: false,
    enableChat: false,
    enableNotifications: true,
    enableAnalytics: true,           // Habilitar analytics en prod
    enableDebugMode: false,          // ⚠️ DESACTIVAR debug en producción
  },

  // ============================================
  // MENSAJES DEL SISTEMA
  // ============================================
  messages: {
    success: {
      loginSuccess: '¡Bienvenido!',
      registerSuccess: 'Registro exitoso',
      productAdded: 'Agregado al carrito',
      orderCreated: 'Orden creada',
      profileUpdated: 'Perfil actualizado',
    },
    errors: {
      loginFailed: 'Credenciales inválidas',
      serverError: 'Error del servidor',
      networkError: 'Error de conexión',
      unauthorized: 'Sin permisos',
      sessionExpired: 'Sesión expirada',
      invalidToken: 'Token inválido',
    },
    warnings: {
      lowStock: 'Stock bajo',
      accountPending: 'Cuenta pendiente',
      accountLocked: 'Cuenta bloqueada',
    },
  },

  // ============================================
  // VALIDACIONES
  // ============================================
  validations: {
    email: {
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      message: 'Email inválido',
    },
    password: {
      minLength: 8,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$',
      message: 'Contraseña debe tener mayúsculas, minúsculas y números',
    },
    phone: {
      pattern: '^[0-9]{10}$',
      message: 'Teléfono inválido',
    },
    price: {
      min: 1.00,
      max: 99999.99,
      message: 'Precio inválido',
    },
  },

  // ============================================
  // INTEGRACIONES EXTERNAS (Producción)
  // ============================================
  integrations: {
    googleMapsApiKey: 'TU_API_KEY_DE_GOOGLE_MAPS',  // ⚠️ CAMBIAR
    stripePublicKey: 'TU_PUBLIC_KEY_DE_STRIPE',     // ⚠️ CAMBIAR
    paypalClientId: 'TU_CLIENT_ID_DE_PAYPAL',       // ⚠️ CAMBIAR
  },

  // ============================================
  // LOGGING Y DEBUG (Restrictivo en producción)
  // ============================================
  logging: {
    enableConsoleLog: false,         // ⚠️ Desactivar logs en producción
    enableErrorTracking: true,       // Habilitar tracking de errores
    logLevel: 'error',               // Solo errores
  },
};
