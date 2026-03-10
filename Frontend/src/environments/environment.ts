export const environment = {
  // Identificador de ambiente
  production: false,
  environmentName: 'Desarrollo',
  api: {
    baseUrl: 'https://localhost:44392/api/',
    timeout: 30000,  // 30 segundos
  },

  // ============================================
  // CONFIGURACIÓN DE AUTENTICACIÓN
  // ============================================
  recaptcha: {
    siteKey: '6Lc9_lwsAAAAAIybBbuJs_p0jSZyP-50gzOM3rfN'
  },

  auth: {
    tokenKey: 'jwt_token',
    userKey: 'current_user',
    sessionTimeout: 3600000,
    refreshTokenBefore: 300000,
  },

  // ============================================
  // REGLAS DE NEGOCIO (sincronizadas con backend)
  // ============================================
  businessRules: {
    minStockAlert: 5,
    maxItemsPerOrder: 50,
    minPasswordLength: 8,
    maxLoginAttempts: 3,
    stockReservationMinutes: 30,
    orderExpirationDays: 7,
    platformCommissionPercent: 10.0,
  },

  // ============================================
  // CONFIGURACIÓN DE ARCHIVOS
  // ============================================
  files: {
    maxFileSize: 5242880,  // 5 MB en bytes
    allowedImageTypes: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    allowedImageMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },

  // ============================================
  // PAGINACIÓN Y UI
  // ============================================
  ui: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100],
    debounceTime: 300,           // Milisegundos para búsquedas
    toastDuration: 3000,         // Duración de notificaciones
    loadingDelay: 500,           // Delay antes de mostrar spinner
  },

  // ============================================
  // CACHÉ
  // ============================================
  cache: {
    enabled: true,
    productsCacheDuration: 300000,    // 5 minutos
    categoriesCacheDuration: 1800000, // 30 minutos
    userCacheDuration: 900000,        // 15 minutos
  },

  // ============================================
  // FEATURES (Funcionalidades habilitadas)
  // ============================================
  features: {
    enableReviews: false,          // Sistema de reviews (futuro)
    enableWishlist: false,         // Lista de deseos (futuro)
    enableChat: false,             // Chat con vendedor (futuro)
    enableNotifications: true,     // Notificaciones en tiempo real
    enableAnalytics: false,        // Google Analytics
    enableDebugMode: true,         // Logs detallados en consola
  },

  // ============================================
  // MENSAJES DEL SISTEMA
  // ============================================
  messages: {
    success: {
      loginSuccess: '¡Inicio de sesión exitoso!',
      registerSuccess: '¡Registro exitoso! Espera la aprobación.',
      productAdded: 'Producto agregado al carrito',
      orderCreated: 'Orden creada exitosamente',
      profileUpdated: 'Perfil actualizado',
    },
    errors: {
      loginFailed: 'Credenciales inválidas',
      serverError: 'Error del servidor. Intenta nuevamente.',
      networkError: 'Error de conexión. Verifica tu internet.',
      unauthorized: 'No tienes permisos para esta acción',
      sessionExpired: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
      invalidToken: 'Token inválido o expirado',
    },
    warnings: {
      lowStock: 'Stock bajo para este producto',
      accountPending: 'Tu cuenta está pendiente de aprobación',
      accountLocked: 'Cuenta bloqueada por intentos fallidos',
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
      message: 'Teléfono debe tener 10 dígitos',
    },
    price: {
      min: 1.00,
      max: 99999.99,
      message: 'Precio debe estar entre $1.00 y $99,999.99',
    },
  },

  // ============================================
  // INTEGRACIONES EXTERNAS (Desarrollo)
  // ============================================
  integrations: {
    googleMapsApiKey: '',  // Tu API Key de Google Maps
    stripePublicKey: '',   // Tu Public Key de Stripe (futuro)
    paypalClientId: '',    // Tu Client ID de PayPal (futuro)
  },

  // ============================================
  // LOGGING Y DEBUG
  // ============================================
  logging: {
    enableConsoleLog: true,
    enableErrorTracking: false,  // Sentry, LogRocket, etc.
    logLevel: 'debug',           // 'debug', 'info', 'warn', 'error'
  },
};
