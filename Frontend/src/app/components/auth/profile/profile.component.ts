import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { LoginService } from '../../../services/login.service';
import { PerfilService } from '../../../services/perfil.service';
import { UploadService } from '../../../services/upload.service';
import { PerfilUsuario, CambioContrasena, MensajeUsuario, ComprasPorMes } from '../../../interfaces/perfil-usuario.interface';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'client-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private _sso = inject(LoginService);
  private _fb = inject(FormBuilder);
  private _perfilService = inject(PerfilService);
  private _uploadService = inject(UploadService);

  // ============================================
  // FORMULARIOS
  // ============================================

  formularioPerfil: FormGroup = this._fb.group({
    id: [0],
    estadoUsuarioId: [1],
    rolId: [2],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    direccion: [''],
    fotoPerfil: ['']
  });

  formularioRedes: FormGroup = this._fb.group({
    twitter: [''],
    instagram: [''],
    facebook: ['']
  });

  formularioContrasena: FormGroup = this._fb.group({
    contrasenaActual: ['', [Validators.required]],
    nuevaContrasena: ['', [Validators.required, Validators.minLength(8)]],
    confirmarContrasena: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  formularioMensaje: FormGroup = this._fb.group({
    asunto: ['', [Validators.required]],
    mensaje: ['', [Validators.required]]
  });

  // ============================================
  // VARIABLES DE ESTADO
  // ============================================

  perfilUsuario: PerfilUsuario | null = null;
  mensajesRecibidos: MensajeUsuario[] = [];
  mostrarCambioContrasena = false;
  mostrarMensajes = false;
  mostrarNuevoMensaje = false;
  cargandoImagen = false;
  usuarioSeleccionado: any = null;
  viendoPerfilAjeno = false;

  // ============================================
  // KPIs DEL MES ACTUAL
  // ============================================

  /** Total gastado en el mes en curso */
  totalGastadoMes: number = 0;

  /** Cantidad de productos comprados en el mes en curso */
  productosCompradosMes: number = 0;

  /** Promedio de gasto por compra (monto / cantidad) del mes actual */
  promedioPorCompraMes: number = 0;

  // ============================================
  // RESUMEN HISTÓRICO
  // ============================================

  /** Suma total de todos los montos históricos */
  totalHistoricoGastado: number = 0;

  /** Número de meses que tienen al menos una compra */
  mesesConCompras: number = 0;

  /** Etiqueta del mes con el monto más alto */
  mesMayorGasto: string = '—';

  // ============================================
  // GRÁFICA DE LÍNEA — Evolución del gasto mensual (últimos 6 meses)
  // ============================================

  public lineChartGastoData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Gasto mensual ($)',
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.12)',
        pointBackgroundColor: '#764ba2',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 9,
        fill: true,
        tension: 0.4
      }
    ]
  };

  public lineChartGastoOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` $${(ctx.raw as number).toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgba(0,0,0,0.6)', font: { weight: 600 } },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      y: {
        ticks: {
          color: 'rgba(0,0,0,0.6)',
          callback: (value) => `$${value}`
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
        beginAtZero: true
      }
    }
  };

  // ============================================
  // GRÁFICA DE DONA — Productos mes actual vs promedio otros meses
  // ============================================

  public doughnutChartProductosData: ChartData<'doughnut'> = {
    labels: ['Este mes', 'Promedio otros meses'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#667eea', 'rgba(118, 75, 162, 0.25)'],
      borderColor: ['#667eea', '#764ba2'],
      borderWidth: 2,
      hoverOffset: 8,
      cutout: '70%'
    } as any]
  };

  public doughnutChartProductosOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(0,0,0,0.7)',
          font: { weight: 600 },
          padding: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} productos`
        }
      }
    }
  };

  // ============================================
  // GRÁFICAS LEGACY (se mantienen para no romper otras referencias)
  // ============================================

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#f8f9fa' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#f8f9fa' },
        grid: { color: 'rgba(248, 249, 250, 0.1)' }
      },
      y: {
        ticks: { color: '#f8f9fa' },
        grid: { color: 'rgba(248, 249, 250, 0.1)' }
      }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'Productos Comprados',
        backgroundColor: '#667eea',
        borderColor: '#667eea',
        borderWidth: 2
      },
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'Gasto ($)',
        backgroundColor: '#764ba2',
        borderColor: '#764ba2',
        borderWidth: 2
      }
    ]
  };

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Últimos 7 días', 'Resto del mes'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#667eea', '#764ba2']
    }]
  };

  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#f8f9fa' }
      }
    }
  };

  // ============================================
  // VALIDADORES
  // ============================================

  passwordMatchValidator(form: FormGroup) {
    const nueva = form.get('nuevaContrasena');
    const confirmar = form.get('confirmarContrasena');

    if (nueva && confirmar && nueva.value !== confirmar.value) {
      confirmar.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarMensajes();
  }

  // ============================================
  // MÉTODOS DE CARGA
  // ============================================

  cargarPerfil(): void {
    if (this._sso.usuario.id != 0) {
      this._sso.ConsultarUsuarios().subscribe({
        next: (resp) => {
          const usuario = resp.find(p => p.id === this._sso.usuario.id)!;

          if (usuario) {
            this.formularioPerfil.patchValue({
              id: usuario.id,
              estadoUsuarioId: usuario.estadoUsuarioId,
              rolId: usuario.rolId,
              nombre: usuario.nombre,
              apellido: usuario.apellido,
              email: usuario.email,
              telefono: usuario.telefono || '',
              direccion: usuario.direccion || '',
              fotoPerfil: usuario.fotoPerfil || ''
            });

            this.formularioRedes.patchValue({
              twitter: usuario.twitter || '',
              instagram: usuario.instagram || '',
              facebook: usuario.facebook || ''
            });

            this.cargarEstadisticas(usuario.id);
          }
        },
        error: (err) => {
          console.error('❌ Error al cargar perfil:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar tu perfil',
            confirmButtonColor: '#667eea'
          });
        }
      });
    }
  }

  cargarEstadisticas(usuarioId: number): void {
    this._perfilService.obtenerEstadisticas(usuarioId).subscribe({
      next: (stats) => {
        console.log('📊 Estadísticas recibidas:', stats);

        if (stats.comprasPorMes && stats.comprasPorMes.length > 0) {
          const compras: ComprasPorMes[] = stats.comprasPorMes;

          // ── Actualizar gráficas legacy ──────────────────────────
          this.barChartData.labels = compras.map(c => c.mes);
          this.barChartData.datasets[0].data = compras.map(c => c.cantidad);
          this.barChartData.datasets[1].data = compras.map(c => c.monto);

          // ── KPIs del mes actual (último elemento del array) ──────
          const mesActual = compras[compras.length - 1];
          this.totalGastadoMes = mesActual.monto;
          this.productosCompradosMes = mesActual.cantidad;
          this.promedioPorCompraMes =
            mesActual.cantidad > 0
              ? mesActual.monto / mesActual.cantidad
              : 0;

          // ── Resumen histórico ─────────────────────────────────────
          this.totalHistoricoGastado = compras.reduce((acc, c) => acc + c.monto, 0);
          this.mesesConCompras = compras.filter(c => c.cantidad > 0).length;
          this.mesMayorGasto = this.obtenerMesMayorGasto(compras);

          // ── Gráfica de línea: últimos 6 meses ────────────────────
          const ultimos6 = compras.slice(-6);
          this.lineChartGastoData.labels = ultimos6.map(c => c.mes);
          this.lineChartGastoData.datasets[0].data = ultimos6.map(c => c.monto);

          // ── Gráfica de dona: mes actual vs promedio otros meses ──
          const otrosMeses = compras.slice(0, compras.length - 1);
          const promedioCantidadOtros =
            otrosMeses.length > 0
              ? Math.round(otrosMeses.reduce((acc, c) => acc + c.cantidad, 0) / otrosMeses.length)
              : 0;

          this.doughnutChartProductosData.datasets[0].data = [
            mesActual.cantidad,
            promedioCantidadOtros
          ];

          // ── Dona legacy ────────────────────────────────────────────
          const productosUltimos7Dias = stats.productosComprados7Dias || 0;
          const restoMes = Math.max(0, 30 - productosUltimos7Dias);
          this.doughnutChartData.datasets[0].data = [productosUltimos7Dias, restoMes];

          this.chart?.update();
          console.log('✅ Gráficas actualizadas correctamente');
        } else {
          console.warn('⚠️ No hay datos de compras por mes');
        }
      },
      error: (err) => {
        console.warn('⚠️ No se pudieron cargar estadísticas:', err);
      }
    });
  }

  cargarMensajes(): void {
    if (this._sso.usuario.id != 0) {
      this._perfilService.obtenerMensajes(this._sso.usuario.id).subscribe({
        next: (mensajes) => {
          this.mensajesRecibidos = mensajes;
          console.log('📬 Mensajes cargados:', mensajes.length);
        },
        error: (err) => {
          console.error('❌ Error al cargar mensajes:', err);
        }
      });
    }
  }

  // ============================================
  // MÉTODOS DE ACTUALIZACIÓN
  // ============================================

  actualizarPerfil(): void {
    if (this.formularioPerfil.invalid) {
      this.formularioPerfil.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos correctamente.',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const perfil = this.formularioPerfil.value;

    this._perfilService.actualizarPerfil(perfil).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          text: 'Tu información ha sido actualizada correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
      },
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'No se pudo actualizar el perfil',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  actualizarRedesSociales(): void {
    const redes = this.formularioRedes.value;

    this._perfilService.actualizarRedesSociales(this._sso.usuario.id, redes).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Redes sociales actualizadas',
          text: 'Tus redes sociales han sido guardadas',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
      },
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron guardar las redes sociales',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  cambiarContrasena(): void {
    if (this.formularioContrasena.invalid) {
      this.formularioContrasena.markAllAsTouched();
      return;
    }

    const datos: CambioContrasena = {
      usuarioId: this._sso.usuario.id,
      contrasenaActual: this.formularioContrasena.value.contrasenaActual,
      nuevaContrasena: this.formularioContrasena.value.nuevaContrasena,
      confirmarContrasena: this.formularioContrasena.value.confirmarContrasena
    };

    this._perfilService.cambiarContrasena(datos).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Contraseña cambiada',
          text: 'Tu contraseña ha sido actualizada correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
        this.formularioContrasena.reset();
        this.mostrarCambioContrasena = false;
      },
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'No se pudo cambiar la contraseña',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  // ============================================
  // MENSAJERÍA
  // ============================================

  abrirFormularioMensaje(): void {
    this.mostrarNuevoMensaje = true;
  }

  enviarMensaje(): void {
    if (this.formularioMensaje.invalid) {
      this.formularioMensaje.markAllAsTouched();
      return;
    }

    const mensaje: MensajeUsuario = {
      remitenteId: this._sso.usuario.id,
      destinatarioId: this.usuarioSeleccionado?.id || 1,
      asunto: this.formularioMensaje.value.asunto,
      mensaje: this.formularioMensaje.value.mensaje
    };

    this._perfilService.enviarMensaje(mensaje).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Mensaje enviado',
          text: 'Tu mensaje ha sido enviado correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
        this.formularioMensaje.reset();
        this.mostrarNuevoMensaje = false;
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo enviar el mensaje',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  marcarComoLeido(mensajeId: number): void {
    this._perfilService.marcarComoLeido(mensajeId).subscribe({
      next: () => {
        const mensaje = this.mensajesRecibidos.find(m => m.id === mensajeId);
        if (mensaje) {
          mensaje.leido = true;
        }
      }
    });
  }

  eliminarMensaje(mensajeId: number): void {
    Swal.fire({
      title: '¿Eliminar mensaje?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._perfilService.eliminarMensaje(mensajeId).subscribe({
          next: () => {
            this.mensajesRecibidos = this.mensajesRecibidos.filter(m => m.id !== mensajeId);
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El mensaje ha sido eliminado',
              confirmButtonColor: '#667eea',
              timer: 2000
            });
          }
        });
      }
    });
  }

  // ============================================
  // SUBIDA DE FOTO
  // ============================================

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validation = this._uploadService.validateImageFile(file);
      if (!validation.valid) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo inválido',
          text: validation.error,
          confirmButtonColor: '#667eea'
        });
        return;
      }
      this.subirFoto(file);
    }
  }

  subirFoto(file: File): void {
    this.cargandoImagen = true;

    this._uploadService.uploadProfileImage(file).subscribe({
      next: (resp: any) => {
        if (resp.success && resp.url) {
          const fotoUrl = resp.url;
          this.formularioPerfil.patchValue({ fotoPerfil: fotoUrl });

          this._perfilService.subirFotoPerfil(this._sso.usuario.id, fotoUrl).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Foto actualizada',
                text: 'Tu foto de perfil ha sido actualizada',
                confirmButtonColor: '#667eea',
                timer: 2000
              });
              this.cargandoImagen = false;
            },
            error: () => {
              this.cargandoImagen = false;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la foto de perfil',
                confirmButtonColor: '#667eea'
              });
            }
          });
        } else {
          this.cargandoImagen = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo subir la imagen',
            confirmButtonColor: '#667eea'
          });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo subir la foto de perfil',
          confirmButtonColor: '#667eea'
        });
        this.cargandoImagen = false;
      }
    });
  }

  abrirEmailCliente(): void {
    window.location.href = `mailto:${this.formularioPerfil.value.email}`;
  }

  // ============================================
  // GETTERS Y HELPERS
  // ============================================

  get nombreCompleto(): string {
    return `${this.formularioPerfil.value.nombre} ${this.formularioPerfil.value.apellido}`;
  }

  get fotoPerfil(): string {
    return this.formularioPerfil.value.fotoPerfil || '/assets/Images/auth/avatar.png';
  }

  get mensajesNoLeidos(): number {
    return this.mensajesRecibidos.filter(m => !m.leido).length;
  }

  /** Devuelve el nombre del mes con mayor monto de gasto */
  obtenerMesMayorGasto(compras: ComprasPorMes[]): string {
    if (!compras || compras.length === 0) return '—';
    const max = compras.reduce((prev, curr) => (curr.monto > prev.monto ? curr : prev));
    return max.monto > 0 ? max.mes : '—';
  }

  /** @deprecated Usar totalGastadoMes directamente */
  obtenerProductos7Dias(): number {
    return this.doughnutChartData.datasets[0]?.data[0] as number || 0;
  }

  /** @deprecated Usar totalHistoricoGastado directamente */
  obtenerTotalGastado(): string {
    const total = this.barChartData.datasets[1]?.data.reduce((acc: number, val) => {
      return acc + (typeof val === 'number' ? val : 0);
    }, 0) || 0;
    return total.toFixed(2);
  }

  // ============================================
  // ROL Y CONTROL
  // ============================================

  obtenerNombreRol(): string {
    const rolId = this.formularioPerfil.value.rolId;
    switch (rolId) {
      case 1: return 'Administrador';
      case 2: return 'Cliente';
      case 3: return 'Vendedor';
      default: return 'Usuario';
    }
  }

  obtenerClaseBadgeRol(): string {
    const rolId = this.formularioPerfil.value.rolId;
    switch (rolId) {
      case 1: return 'badge-admin';
      case 2: return 'badge-cliente';
      case 3: return 'badge-vendedor';
      default: return 'badge-secondary';
    }
  }

  puedeContactarCliente(): boolean {
    return this._sso.esAdmin() || this._sso.esVendedor();
  }

  puedeEnviarMensajes(): boolean {
    return this._sso.esAdmin() || this._sso.esVendedor();
  }
}
