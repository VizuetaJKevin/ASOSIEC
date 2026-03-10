import { Component, OnInit } from '@angular/core';
import { AuditService, AuditLog } from 'src/app/services/audit.service';
import { ExportService } from 'src/app/services/export.service';
import Swal from 'sweetalert2';

interface Estadistica {
  label: string;
  valor: number;
  icon: string;
  color: string;
  trend?: number;
}

@Component({
  selector: 'app-admin-audit',
  templateUrl: './admin-audit.component.html',
  styleUrls: ['./admin-audit.component.css'],
  standalone: false,
})
export class AdminAuditComponent implements OnInit {
  logs: AuditLog[] = [];
  logsFiltrados: AuditLog[] = [];
  logsPaginados: AuditLog[] = [];
  Math = Math;

  // Control del modal
  modalAbierto = false;
  logSeleccionado: AuditLog | null = null;

  filtros = {
    fechaInicio: undefined as Date | undefined,
    fechaFin: undefined as Date | undefined,
    entidad: '',
    tipoOperacion: '',
    soloExitosos: undefined as boolean | undefined
  };

  entidades = ['Usuario', 'Producto', 'Orden', 'ComprobantePago', 'Vendedor'];
  tiposOperacion = ['INSERT', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN'];

  cargando = false;
  totalRegistros = 0;
  mostrarFiltros = true;

  // Paginación
  paginaActual: number = 0;
  registrosPorPagina: number = 50;
  opcionesPaginacion: number[] = [10, 25, 50, 100];

  // Sorting
  ordenActual = 'fecha_evento';
  ordenDireccion: 'asc' | 'desc' = 'desc';

  // Estadísticas
  estadisticas: Estadistica[] = [
    {
      label: 'Total de Eventos',
      valor: 0,
      icon: 'fas fa-clipboard-list',
      color: 'primary',
      trend: 12
    },
    {
      label: 'Operaciones Exitosas',
      valor: 0,
      icon: 'fas fa-check-circle',
      color: 'success',
      trend: 8
    },
    {
      label: 'Operaciones Fallidas',
      valor: 0,
      icon: 'fas fa-exclamation-triangle',
      color: 'warning',
      trend: -5
    },
    {
      label: 'Usuarios Activos',
      valor: 0,
      icon: 'fas fa-users',
      color: 'info',
      trend: 3
    }
  ];

  constructor(private auditService: AuditService, private exportService: ExportService) { }

  ngOnInit(): void {
    this.cargarLogs();
  }

  cargarLogs(): void {
    this.cargando = true;

    this.auditService.getLogs(this.filtros).subscribe({
      next: (response) => {
        if (response.success) {
          this.logs = response.data;
          this.totalRegistros = response.total || this.logs.length;
          this.calcularEstadisticas();
          this.aplicarFiltrosYOrdenamiento();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar logs:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar registros',
          text: 'No se pudieron cargar los logs de auditoría',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#667eea',
          background: 'rgba(255, 255, 255, 0.95)',
          backdrop: 'rgba(0, 0, 0, 0.4)',
          customClass: {
            popup: 'glass-modal-swal',
            title: 'swal-title',
            htmlContainer: 'swal-text'
          }
        });
        this.cargando = false;
      }
    });
  }

  calcularEstadisticas(): void {
    const exitosos = this.logs.filter(log => log.exito).length;
    const fallidos = this.logs.filter(log => !log.exito).length;
    const usuariosUnicos = new Set(this.logs.map(log => log.usuario_email).filter(email => email)).size;

    this.estadisticas[0].valor = this.totalRegistros;
    this.estadisticas[1].valor = exitosos;
    this.estadisticas[2].valor = fallidos;
    this.estadisticas[3].valor = usuariosUnicos;
  }

  aplicarFiltros(): void {
    this.paginaActual = 0;
    this.aplicarFiltrosYOrdenamiento();
  }

  aplicarFiltrosYOrdenamiento(): void {
    this.logsFiltrados = this.logs.filter(log => {

      // ── Fecha inicio ──────────────────────────────────────────
      if (this.filtros.fechaInicio) {
        const inicio = new Date(this.filtros.fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        if (new Date(log.fecha_evento) < inicio) return false;
      }

      // ── Fecha fin ─────────────────────────────────────────────
      if (this.filtros.fechaFin) {
        const fin = new Date(this.filtros.fechaFin);
        fin.setHours(23, 59, 59, 999);
        if (new Date(log.fecha_evento) > fin) return false;
      }

      // ── Entidad ───────────────────────────────────────────────
      if (this.filtros.entidad && this.filtros.entidad !== '') {
        if (log.entidad !== this.filtros.entidad) return false;
      }

      // ── Tipo de operación ─────────────────────────────────────
      if (this.filtros.tipoOperacion && this.filtros.tipoOperacion !== '') {
        if (log.tipo_operacion !== this.filtros.tipoOperacion) return false;
      }

      // ── Estado: exitoso / fallido ─────────────────────────────
      if (this.filtros.soloExitosos !== undefined && this.filtros.soloExitosos !== null) {
        if (log.exito !== this.filtros.soloExitosos) return false;
      }

      return true;
    });

    this.aplicarOrdenamiento();
    this.actualizarPaginacion();
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaInicio: undefined,
      fechaFin: undefined,
      entidad: '',
      tipoOperacion: '',
      soloExitosos: undefined
    };
    this.paginaActual = 0;
    this.aplicarFiltrosYOrdenamiento();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  // Sorting
  ordenarPor(campo: string): void {
    if (this.ordenActual === campo) {
      this.ordenDireccion = this.ordenDireccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenActual = campo;
      this.ordenDireccion = 'asc';
    }
    this.aplicarOrdenamiento();
    this.actualizarPaginacion();
  }

  aplicarOrdenamiento(): void {
    this.logsFiltrados.sort((a: any, b: any) => {
      let valorA = a[this.ordenActual];
      let valorB = b[this.ordenActual];

      // Manejo especial para valores nulos o undefined
      if (valorA === null || valorA === undefined) valorA = '';
      if (valorB === null || valorB === undefined) valorB = '';

      // Convertir a minúsculas si son strings para comparación case-insensitive
      if (typeof valorA === 'string') valorA = valorA.toLowerCase();
      if (typeof valorB === 'string') valorB = valorB.toLowerCase();

      let comparacion = 0;
      if (valorA < valorB) comparacion = -1;
      if (valorA > valorB) comparacion = 1;

      return this.ordenDireccion === 'asc' ? comparacion : -comparacion;
    });
  }

  // Paginación
  get totalPaginas(): number {
    return Math.ceil(this.logsFiltrados.length / this.registrosPorPagina);
  }

  get infoPaginacion(): string {
    const total = this.logsFiltrados.length;
    if (total === 0) return 'No hay registros';
    const inicio = this.paginaActual * this.registrosPorPagina + 1;
    const fin = Math.min((this.paginaActual + 1) * this.registrosPorPagina, total);
    return `Mostrando ${inicio} - ${fin} de ${total} registros`;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
  }

  cambiarRegistrosPorPagina(cantidad: number): void {
    this.registrosPorPagina = cantidad;
    this.paginaActual = 0;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    const inicio = this.paginaActual * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    this.logsPaginados = this.logsFiltrados.slice(inicio, fin);
  }

  obtenerPaginasVisibles(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const visibles: number[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) {
        visibles.push(i);
      }
    } else {
      visibles.push(0);
      if (actual > 3) {
        visibles.push(-1);
      }
      const inicio = Math.max(1, actual - 1);
      const fin = Math.min(total - 2, actual + 1);
      for (let i = inicio; i <= fin; i++) {
        visibles.push(i);
      }
      if (actual < total - 4) {
        visibles.push(-1);
      }
      visibles.push(total - 1);
    }
    return visibles;
  }

  // Helpers
  getOperationIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'INSERT': 'add_circle',
      'UPDATE': 'edit',
      'DELETE': 'delete',
      'APPROVE': 'check_circle',
      'REJECT': 'cancel',
      'LOGIN': 'login'
    };
    return icons[tipo] || 'settings';
  }

  // Control del Modal
  abrirModal(log: AuditLog): void {
    this.logSeleccionado = log;
    this.modalAbierto = true;
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.logSeleccionado = null;
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  formatearJSON(valor: string): string {
    try {
      const obj = JSON.parse(valor);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return valor;
    }
  }

  exportarExcel(): void {
    if (!this.logsFiltrados || this.logsFiltrados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay registros para exportar.',
        confirmButtonColor: '#667eea',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(0, 0, 0, 0.4)',
        customClass: { popup: 'glass-modal-swal' }
      });
      return;
    }

    Swal.fire({
      title: 'Generando archivo...',
      html: '<div style="text-align:center;padding:1rem;"><div style="display:inline-block;width:50px;height:50px;border:4px solid rgba(102,126,234,0.2);border-top-color:#667eea;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin-top:1rem;color:rgba(0,0,0,0.6);">Exportando registros a Excel...</p></div>',
      showConfirmButton: false,
      allowOutsideClick: false,
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      customClass: { popup: 'glass-modal-swal' }
    });

    try {
      this.exportService.exportarAuditExcel(this.logsFiltrados);
      Swal.fire({
        icon: 'success',
        title: '¡Exportación Exitosa!',
        text: 'El archivo Excel ha sido descargado correctamente.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#667eea',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(0, 0, 0, 0.4)',
        customClass: { popup: 'glass-modal-swal', title: 'swal-title', confirmButton: 'swal-confirm-btn' }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al exportar',
        text: 'No se pudo generar el archivo Excel.',
        confirmButtonColor: '#667eea',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(0, 0, 0, 0.4)',
        customClass: { popup: 'glass-modal-swal' }
      });
    }
  }

  exportarPDF(): void {
    if (!this.logsFiltrados || this.logsFiltrados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay registros para exportar.',
        confirmButtonColor: '#667eea',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(0, 0, 0, 0.4)',
        customClass: { popup: 'glass-modal-swal' }
      });
      return;
    }

    Swal.fire({
      title: 'Generando archivo...',
      html: '<div style="text-align:center;padding:1rem;"><div style="display:inline-block;width:50px;height:50px;border:4px solid rgba(231,76,60,0.2);border-top-color:#e74c3c;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin-top:1rem;color:rgba(0,0,0,0.6);">Exportando registros a PDF...</p></div>',
      showConfirmButton: false,
      allowOutsideClick: false,
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      customClass: { popup: 'glass-modal-swal' }
    });

    try {
      this.exportService.exportarAuditPDF(this.logsFiltrados, this.estadisticas);
      Swal.fire({
        icon: 'success',
        title: '¡Exportación Exitosa!',
        text: 'El archivo PDF ha sido descargado correctamente.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#667eea',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(0, 0, 0, 0.4)',
        customClass: { popup: 'glass-modal-swal', title: 'swal-title', confirmButton: 'swal-confirm-btn' }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al exportar',
        text: 'No se pudo generar el archivo PDF.',
        confirmButtonColor: '#667eea',
        background: 'rgba(255, 255, 255, 0.95)',
        backdrop: 'rgba(0, 0, 0, 0.4)',
        customClass: { popup: 'glass-modal-swal' }
      });
    }
  }
}
