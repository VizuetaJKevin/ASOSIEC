import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import Swal from 'sweetalert2';
import { ApiService } from 'src/app/services/Api.service';
import { Configuracion } from 'src/app/interfaces/configuracion.interface';

type CategoriaConfig = 'security' | 'products' | 'system' | 'all';

@Component({
  selector: 'app-admin-configuracion',
  templateUrl: './admin-configuracion.component.html',
  styleUrls: ['./admin-configuracion.component.css'],
  standalone: false,
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),

    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),

    trigger('modalContentAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) translateY(30px)' }),
        animate('350ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('250ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95) translateY(20px)' }))
      ])
    ])
  ]
})
export class AdminConfiguracionComponent implements OnInit {
  private apiService = inject(ApiService);
  private _fb = inject(FormBuilder);

  // ✅ CONFIGURACIONES FUNCIONALES
  private readonly CONFIGURACIONES_FUNCIONALES = [
    'comision_plataforma',
    'habilitar_alertas_stock',
    'habilitar_emails',
    'max_intentos_login',
    'mostrar_productos_agotados',
    'permitir_venta_sin_stock',
    'productos_por_pagina',
    'requiere_aprobacion_producto',
    'requiere_aprobacion_vendedor',
    'stock_minimo_alerta',
    'tiempo_bloqueo_login_minutos'
  ];

  // 📂 GRUPOS DE CONFIGURACIONES
  private readonly GRUPOS_CONFIG: Record<string, string[]> = {
    security: ['max_intentos_login', 'tiempo_bloqueo_login_minutos'],
    products: [
      'productos_por_pagina',
      'stock_minimo_alerta',
      'mostrar_productos_agotados',
      'permitir_venta_sin_stock',
      'requiere_aprobacion_producto',
      'habilitar_alertas_stock'
    ],
    system: [
      'comision_plataforma',
      'habilitar_emails',
      'requiere_aprobacion_vendedor'
    ]
  };

  // 📝 NOMBRES AMIGABLES
  private readonly NOMBRES_AMIGABLES: { [key: string]: string } = {
    'max_intentos_login': 'Intentos Máximos de Login',
    'tiempo_bloqueo_login_minutos': 'Tiempo de Bloqueo (minutos)',
    'productos_por_pagina': 'Productos por Página',
    'stock_minimo_alerta': 'Stock Mínimo para Alerta',
    'comision_plataforma': 'Comisión de Plataforma (%)',
    'habilitar_alertas_stock': 'Alertas de Stock',
    'habilitar_emails': 'Envío de Emails',
    'mostrar_productos_agotados': 'Mostrar Productos Agotados',
    'permitir_venta_sin_stock': 'Permitir Venta sin Stock',
    'requiere_aprobacion_producto': 'Requiere Aprobación de Productos',
    'requiere_aprobacion_vendedor': 'Requiere Aprobación de Vendedores'
  };

  // 🎨 ÍCONOS POR CONFIGURACIÓN
  private readonly ICONOS_CONFIG: { [key: string]: string } = {
    'max_intentos_login': 'shield',
    'tiempo_bloqueo_login_minutos': 'lock_clock',
    'productos_por_pagina': 'view_module',
    'stock_minimo_alerta': 'notifications_active',
    'comision_plataforma': 'payments',
    'habilitar_alertas_stock': 'notification_important',
    'habilitar_emails': 'email',
    'mostrar_productos_agotados': 'visibility',
    'permitir_venta_sin_stock': 'shopping_cart',
    'requiere_aprobacion_producto': 'verified',
    'requiere_aprobacion_vendedor': 'person_check'
  };

  // 📑 TÍTULOS DE CATEGORÍAS
  private readonly TITULOS_CATEGORIAS: Record<CategoriaConfig, string> = {
    security: 'Seguridad y Autenticación',
    products: 'Productos e Inventario',
    system: 'Sistema y General',
    all: 'Todas las configuraciones'
  };

  listaConfiguraciones: Configuracion[] = [];
  filtroTexto: string = '';
  cargando: boolean = true;
  categoriaActiva: CategoriaConfig = 'all';

  mostrarModalEditar: boolean = false;
  formularioEdicion!: FormGroup;
  configuracionActual: Configuracion | null = null;
  valorBooleanActual: boolean = false;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarConfiguraciones();
  }

  inicializarFormulario(): void {
    this.formularioEdicion = this._fb.group({
      clave: [{ value: '', disabled: true }],
      valor: ['', [Validators.required, Validators.maxLength(500)]],
      descripcion: ['', [Validators.maxLength(255)]],
      tipo: [{ value: '', disabled: true }]
    });
  }

  cargarConfiguraciones(): void {
    this.cargando = true;
    this.apiService.ConsultarConfiguraciones().subscribe({
      next: (data) => {
        this.listaConfiguraciones = data.filter(config =>
          this.CONFIGURACIONES_FUNCIONALES.includes(config.clave)
        );
        this.cargando = false;
        console.log('✅ Configuraciones cargadas:', this.listaConfiguraciones.length);
      },
      error: (err) => {
        this.cargando = false;
        console.error('❌ Error al cargar configuraciones:', err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar las configuraciones',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  // ============================================
  // 📂 NAVEGACIÓN DE CATEGORÍAS
  // ============================================
  cambiarCategoria(categoria: CategoriaConfig): void {
    this.categoriaActiva = categoria;
    this.limpiarFiltro();
  }

  getTituloCategoriaActual(): string {
    return this.TITULOS_CATEGORIAS[this.categoriaActiva];
  }

  getConfiguracionesActuales(): Configuracion[] {
    let configs = this.listaConfiguraciones;

    // Filtrar por categoría si no es 'all'
    if (this.categoriaActiva !== 'all') {
      const clavesCategoria = this.GRUPOS_CONFIG[this.categoriaActiva] || [];
      configs = configs.filter(c => clavesCategoria.includes(c.clave));
    }

    // Aplicar filtro de búsqueda
    if (this.filtroTexto.trim()) {
      const filtro = this.filtroTexto.toLowerCase();
      configs = configs.filter(c =>
        c.clave.toLowerCase().includes(filtro) ||
        c.descripcion?.toLowerCase().includes(filtro) ||
        c.valor?.toLowerCase().includes(filtro) ||
        this.getNombreAmigable(c.clave).toLowerCase().includes(filtro)
      );
    }

    return configs;
  }

  // ============================================
  // 🔍 FILTRADO Y BÚSQUEDA
  // ============================================
  get configuracionesFiltradas(): Configuracion[] {
    return this.getConfiguracionesActuales();
  }

  getConfiguracionesPorGrupo(grupo: 'security' | 'products' | 'system'): Configuracion[] {
    const claves = this.GRUPOS_CONFIG[grupo] || [];
    return this.configuracionesFiltradas.filter(c => claves.includes(c.clave));
  }

  limpiarFiltro(): void {
    this.filtroTexto = '';
  }

  onSearchChange(): void {
    // Placeholder para animaciones futuras si es necesario
  }

  // ============================================
  // 📝 HELPERS PARA NOMBRES E ÍCONOS
  // ============================================
  getNombreAmigable(clave: string): string {
    return this.NOMBRES_AMIGABLES[clave] || this.formatearClave(clave);
  }

  private formatearClave(clave: string): string {
    return clave
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getIconoConfig(clave: string): string {
    return this.ICONOS_CONFIG[clave] || 'settings';
  }

  getColorTipo(tipo: string | undefined): string {
    if (!tipo) return 'texto';
    switch (tipo.toUpperCase()) {
      case 'NUMBER':  return 'numero';
      case 'BOOLEAN': return 'booleano';
      case 'STRING':  return 'texto';
      default:        return 'texto';
    }
  }

  getIconoTipo(tipo: string | undefined): string {
    if (!tipo) return 'help';
    switch (tipo.toUpperCase()) {
      case 'NUMBER':  return 'numbers';
      case 'BOOLEAN': return 'toggle_on';
      case 'STRING':  return 'text_fields';
      default:        return 'help';
    }
  }

  formatearValor(valor: string | undefined, tipo: string | undefined): string {
    if (!valor) return 'N/A';

    if (tipo?.toUpperCase() === 'BOOLEAN') {
      return valor.toLowerCase() === 'true' ? '✓ Activado' : '✗ Desactivado';
    }

    return valor;
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // ============================================
  // 📋 HELPERS DEL MODAL
  // ============================================
  getPlaceholder(tipo: string): string {
    switch (tipo.toUpperCase()) {
      case 'NUMBER':  return 'Ingresa un número...';
      case 'BOOLEAN': return 'true o false';
      case 'STRING':  return 'Ingresa el valor...';
      default:        return 'Valor...';
    }
  }

  getHintText(tipo: string): string {
    switch (tipo.toUpperCase()) {
      case 'NUMBER':  return 'Acepta números enteros o decimales';
      case 'BOOLEAN': return 'Solo acepta: true o false';
      case 'STRING':  return 'Texto libre';
      default:        return '';
    }
  }

  getErrorText(tipo: string): string {
    switch (tipo.toUpperCase()) {
      case 'NUMBER':  return 'Debe ser un número válido';
      case 'BOOLEAN': return 'Debe ser true o false';
      default:        return 'Formato inválido';
    }
  }

  esConfiguracionCritica(clave: string): boolean {
    const criticas = ['max_intentos_login', 'tiempo_bloqueo_login_minutos', 'comision_plataforma'];
    return criticas.includes(clave);
  }

  // ============================================
  // 📝 MODAL EDITAR
  // ============================================
  abrirModalEditar(config: Configuracion): void {
    this.configuracionActual = { ...config };

    // Inicializar valor boolean para el toggle
    if (config.tipo === 'BOOLEAN') {
      this.valorBooleanActual = config.valor?.toLowerCase() === 'true';
    }

    this.formularioEdicion.patchValue({
      clave: config.clave,
      valor: config.valor,
      descripcion: config.descripcion || '',
      tipo: config.tipo
    });

    // Validación dinámica
    if (config.tipo === 'NUMBER') {
      this.formularioEdicion.get('valor')?.setValidators([
        Validators.required,
        Validators.pattern(/^-?\d+(\.\d+)?$/)
      ]);
    } else if (config.tipo === 'BOOLEAN') {
      this.formularioEdicion.get('valor')?.setValidators([
        Validators.required,
        Validators.pattern(/^(true|false)$/i)
      ]);
    } else {
      this.formularioEdicion.get('valor')?.setValidators([
        Validators.required,
        Validators.maxLength(500)
      ]);
    }
    this.formularioEdicion.get('valor')?.updateValueAndValidity();

    this.mostrarModalEditar = true;
    document.body.style.overflow = 'hidden';
  }

  // ============================================
  // 🔄 TOGGLE SWITCH (BOOLEAN)
  // ============================================
  onToggleChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.valorBooleanActual = checkbox.checked;
    this.formularioEdicion.patchValue({
      valor: this.valorBooleanActual ? 'true' : 'false'
    });
  }

  // ============================================
  // ➕➖ COUNTER (NUMBER)
  // ============================================
  incrementarValor(): void {
    const valorActual = this.formularioEdicion.get('valor')?.value;
    const nuevoValor = valorActual ? parseFloat(valorActual) + 1 : 1;
    this.formularioEdicion.patchValue({
      valor: nuevoValor.toString()
    });
  }

  decrementarValor(): void {
    const valorActual = this.formularioEdicion.get('valor')?.value;
    const nuevoValor = valorActual ? parseFloat(valorActual) - 1 : 0;
    this.formularioEdicion.patchValue({
      valor: nuevoValor.toString()
    });
  }

  puedeDecrementar(): boolean {
    const valorActual = this.formularioEdicion.get('valor')?.value;
    if (!valorActual) return false;
    const valor = parseFloat(valorActual);

    // Verificar si es una configuración que no puede ser negativa
    const noPermiteNegativos = [
      'max_intentos_login',
      'tiempo_bloqueo_login_minutos',
      'productos_por_pagina',
      'stock_minimo_alerta'
    ];

    if (noPermiteNegativos.includes(this.configuracionActual?.clave || '')) {
      return valor > 0;
    }

    return true;
  }

  onNumberInputChange(): void {
    // Validar que el input sea un número válido
    const valor = this.formularioEdicion.get('valor')?.value;
    if (valor && !/^-?\d+(\.\d+)?$/.test(valor)) {
      // Si no es válido, mantener el valor anterior o poner 0
      this.formularioEdicion.patchValue({
        valor: '0'
      }, { emitEvent: false });
    }
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.configuracionActual = null;
    this.formularioEdicion.reset();
    this.inicializarFormulario();
    document.body.style.overflow = 'auto';
  }

  // ============================================
  // 💾 GUARDAR CONFIGURACIÓN
  // ============================================
  guardarConfiguracion(): void {
    if (this.formularioEdicion.invalid || !this.configuracionActual) return;

    const configActualizada: Configuracion = {
      ...this.configuracionActual,
      valor: this.formularioEdicion.get('valor')?.value?.toString().trim(),
      descripcion: this.formularioEdicion.get('descripcion')?.value?.trim() || '',
      activo: true
    };

    Swal.fire({
      title: 'Guardando...',
      text: 'Actualizando configuración',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.apiService.ActualizarConfiguracion(configActualizada).subscribe({
      next: (respuesta) => {
        Swal.close();

        if (respuesta.actualizado) {
          Swal.fire({
            title: '¡Actualizada!',
            html: `
              <p>La configuración <strong>${this.getNombreAmigable(configActualizada.clave)}</strong> se actualizó correctamente.</p>
              <p class="text-muted" style="font-size: 0.9rem; margin-top: 10px;">
                ⚠️ Los cambios afectarán al sistema inmediatamente.
              </p>
            `,
            icon: 'success',
            timer: 2500,
            showConfirmButton: false,
            confirmButtonColor: '#667eea'
          });

          this.cerrarModalEditar();
          this.cargarConfiguraciones();
        } else {
          this.cargarConfiguraciones();
          Swal.fire({
            title: 'No se pudo actualizar',
            text: respuesta.mensaje || 'Intenta nuevamente',
            icon: 'warning',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#667eea'
          });
        }
      },
      error: (err) => {
        Swal.close();
        console.error('❌ Error al actualizar:', err);
        this.cargarConfiguraciones();

        Swal.fire({
          title: 'Error del servidor',
          html: `
            <p>Ocurrió un error al actualizar.</p>
            <p style="font-size: 12px; color: #888;">
              Se recargó la lista para verificar si el cambio se aplicó.
            </p>
          `,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  // ============================================
  // 🔄 REFRESCAR CACHÉ
  // ============================================
  refrescarCache(): void {
    Swal.fire({
      title: '¿Refrescar caché?',
      text: 'Se recargará la caché de configuraciones en el servidor',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, refrescar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.RefrescarCacheConfiguracion().subscribe({
          next: () => {
            Swal.fire({
              title: '¡Listo!',
              text: 'Caché refrescado exitosamente',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.cargarConfiguraciones();
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo refrescar el caché',
              icon: 'error',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#667eea'
            });
          }
        });
      }
    });
  }
}
