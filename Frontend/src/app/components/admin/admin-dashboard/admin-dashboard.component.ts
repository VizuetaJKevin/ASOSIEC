import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { BaseChartDirective } from 'ng2-charts';
import { ReporteriaService } from 'src/app/services/reporteria.service';
import { LoginService } from 'src/app/services/login.service';
import { ApiService } from 'src/app/services/Api.service';
import { ExportService } from 'src/app/services/export.service';
import Swal from 'sweetalert2';
import {
  DashboardKPIs,
  VentasSemanales,
  ProductoMasVendido,
  VentasPorVendedor,
  ComprobantePendiente
} from 'src/app/interfaces/reporte.interface';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatChipsModule,
    MatTableModule,
    MatDividerModule,
    BaseChartDirective
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private reporteriaService = inject(ReporteriaService);
  private loginService = inject(LoginService);
  private apiService = inject(ApiService);
  private exportService = inject(ExportService);
  private http = inject(HttpClient);

  // KPIs
  public kpis: DashboardKPIs | null = null;

  // Datos para gráficas
  public ventasSemanales: VentasSemanales[] = [];
  public productosMasVendidos: ProductoMasVendido[] = [];
  public ventasPorVendedor: VentasPorVendedor[] = [];

  // Comprobantes
  public comprobantesPendientes: any[] = [];

  // UI
  public cargando: boolean = true;
  public tabIndex: number = 0;

  // Columnas de tablas
  public displayedColumnsProductos: string[] = ['producto', 'cantidad', 'total'];
  public displayedColumnsVendedores: string[] = ['vendedor', 'productos', 'ordenes', 'total'];

  // ============================================
  // CONFIGURACIÓN DE GRÁFICAS
  // ============================================

  public barChartVentasData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  public barChartVentasOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            family: "'Poppins', sans-serif",
            size: 13,
            weight: 500
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 600
        },
        bodyFont: {
          size: 13
        },
        displayColors: true,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return this.ventasSemanales[index]?.dia_nombre || '';
          },
          label: (context) => {
            const value = context.parsed.y ?? 0;
            const ordenes = this.ventasSemanales[context.dataIndex]?.cantidad_ordenes || 0;
            return [
              `Ventas: $${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              `Órdenes: ${ordenes}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12
          },
          callback: (value) => {
            return '$' + value.toLocaleString();
          }
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12
          }
        },
        border: {
          display: false
        }
      }
    }
  };
  public barChartVentasType: ChartType = 'bar';

  public barChartProductosData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  public barChartProductosOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 600
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context) => {
            const producto = this.productosMasVendidos[context.dataIndex];
            return [
              `Cantidad vendida: ${context.parsed.x}`,
              `Total generado: $${producto?.total_generado.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12
          }
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12
          }
        },
        border: {
          display: false
        }
      }
    }
  };
  public barChartProductosType: ChartType = 'bar';

  public barChartVendedoresData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  public barChartVendedoresOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 600
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context) => {
            const vendedor = this.ventasPorVendedor[context.dataIndex];
            const totalVentas = context.parsed.x ?? 0;
            return [
              `Total ventas: $${totalVentas.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              `Productos vendidos: ${vendedor?.total_productos_vendidos || 0}`,
              `Órdenes: ${vendedor?.cantidad_ordenes || 0}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12
          },
          callback: (value) => {
            return '$' + value.toLocaleString();
          }
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12
          }
        },
        border: {
          display: false
        }
      }
    }
  };
  public barChartVendedoresType: ChartType = 'bar';

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.cargando = true;

    // Cargar KPIs
    this.reporteriaService.DashboardKPIs().subscribe({
      next: (data) => {
        this.kpis = data;
        console.log('✅ KPIs cargados:', data);
      },
      error: (err) => {
        console.error('❌ Error al cargar KPIs:', err);
        this.kpis = {
          ventas_mes_actual: 0,
          ventas_mes_anterior: 0,
          crecimiento_porcentaje: 0,
          ordenes_pendientes: 0,
          ordenes_completadas_mes: 0,
          total_ordenes: 0,
          total_productos: 0,
          productos_sin_stock: 0,
          total_clientes: 0,
          vendedores_activos: 0,
          solicitudes_pendientes: 0
        };
      }
    });

    // Cargar ventas semanales
    this.reporteriaService.VentasSemanales().subscribe({
      next: (data) => {
        this.ventasSemanales = data;
        this.configurarGraficaVentasSemanales();
        console.log('✅ Ventas semanales cargadas:', data);
      },
      error: (err) => {
        console.error('❌ Error al cargar ventas semanales:', err);
        this.ventasSemanales = [];
      }
    });

    // Cargar productos más vendidos
    this.reporteriaService.ProductosMasVendidos().subscribe({
      next: (data) => {
        this.productosMasVendidos = data;
        this.configurarGraficaProductos();
        console.log('✅ Productos más vendidos cargados:', data);
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
        this.productosMasVendidos = [];
      }
    });

    // Cargar ventas por vendedor
    this.reporteriaService.VentasPorVendedor().subscribe({
      next: (data) => {
        this.ventasPorVendedor = data;
        this.configurarGraficaVendedores();
        console.log('✅ Ventas por vendedor cargadas:', data);
      },
      error: (err) => {
        console.error('❌ Error al cargar ventas por vendedor:', err);
        this.ventasPorVendedor = [];
      }
    });

    // Cargar comprobantes pendientes
    this.apiService.ConsultarOrdenesConComprobantes().subscribe({
      next: (resp) => {
        console.log('📋 Órdenes con comprobantes recibidas:', resp);

        const pendientesMayuscula = resp
          .filter(o => o.Comprobante && o.Comprobante.verificado === false && (o.Orden?.estadoOrdenId !== 9));

        const pendientesMinuscula = resp
          .filter(o => o.comprobante && o.comprobante.verificado === false && (o.orden?.estadoOrdenId !== 9));

        this.comprobantesPendientes = pendientesMayuscula.length > 0
          ? pendientesMayuscula
          : pendientesMinuscula;

        console.log('✅ Comprobantes pendientes:', this.comprobantesPendientes.length);
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar comprobantes:', err);
        this.comprobantesPendientes = [];
        this.cargando = false;
      }
    });
  }

  configurarGraficaVentasSemanales() {
    if (!this.ventasSemanales || this.ventasSemanales.length === 0) {
      console.warn('⚠️ No hay datos de ventas semanales para mostrar');
      return;
    }

    this.barChartVentasData = {
      labels: this.ventasSemanales.map(v => v.fecha_corta),
      datasets: [
        {
          label: 'Ventas Diarias ($)',
          data: this.ventasSemanales.map(v => v.total),
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: '#667eea',
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 50,
          hoverBackgroundColor: 'rgba(102, 126, 234, 1)',
          hoverBorderColor: '#667eea',
          hoverBorderWidth: 3
        }
      ]
    };
  }

  configurarGraficaProductos() {
    if (!this.productosMasVendidos || this.productosMasVendidos.length === 0) {
      console.warn('⚠️ No hay productos vendidos para mostrar');
      return;
    }

    const gradientColors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
      '#43e97b', '#38f9d7', '#fa709a', '#fee140', '#30cfd0'
    ];

    this.barChartProductosData = {
      labels: this.productosMasVendidos.map(p => p.nombre_producto),
      datasets: [
        {
          label: 'Cantidad Vendida',
          data: this.productosMasVendidos.map(p => p.cantidad_vendida),
          backgroundColor: gradientColors.slice(0, this.productosMasVendidos.length),
          borderColor: gradientColors.slice(0, this.productosMasVendidos.length),
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 35
        }
      ]
    };
  }

  configurarGraficaVendedores() {
    if (!this.ventasPorVendedor || this.ventasPorVendedor.length === 0) {
      console.warn('⚠️ No hay datos de vendedores para mostrar');
      return;
    }

    this.barChartVendedoresData = {
      labels: this.ventasPorVendedor.map(v => v.nombre_vendedor),
      datasets: [
        {
          label: 'Ventas Totales ($)',
          data: this.ventasPorVendedor.map(v => v.total_ventas),
          backgroundColor: '#667eea',
          borderColor: '#667eea',
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 50
        }
      ]
    };
  }

  getCurrentDate(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return now.toLocaleDateString('es-ES', options);
  }

  abrirComprobante(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  calcularDiasPendientes(fechaSubida: string | Date): number {
    if (!fechaSubida) return 0;
    const fecha = new Date(fechaSubida);
    const hoy = new Date();
    const diferencia = hoy.getTime() - fecha.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  exportarExcel(): void {
    Swal.fire({
      title: 'Generando archivo...',
      html: '<div style="text-align:center;padding:1rem;"><div style="display:inline-block;width:50px;height:50px;border:4px solid rgba(33,115,70,0.2);border-top-color:#217346;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin-top:1rem;color:rgba(0,0,0,0.6);">Exportando dashboard a Excel...</p></div>',
      showConfirmButton: false,
      allowOutsideClick: false,
      background: 'rgba(255,255,255,0.95)',
      backdrop: 'rgba(0,0,0,0.4)'
    });

    try {
      this.exportService.exportarDashboardExcel(
        this.kpis,
        this.ventasSemanales,
        this.productosMasVendidos,
        this.ventasPorVendedor
      );
      Swal.fire({
        icon: 'success',
        title: '¡Exportación Exitosa!',
        text: 'El archivo Excel ha sido descargado correctamente.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#667eea',
        background: 'rgba(255,255,255,0.95)',
        backdrop: 'rgba(0,0,0,0.4)'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al exportar',
        text: 'No se pudo generar el archivo Excel.',
        confirmButtonColor: '#667eea',
        background: 'rgba(255,255,255,0.95)',
        backdrop: 'rgba(0,0,0,0.4)'
      });
    }
  }

  exportarPDF(): void {
    Swal.fire({
      title: 'Generando archivo...',
      html: '<div style="text-align:center;padding:1rem;"><div style="display:inline-block;width:50px;height:50px;border:4px solid rgba(192,57,43,0.2);border-top-color:#c0392b;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin-top:1rem;color:rgba(0,0,0,0.6);">Exportando dashboard a PDF...</p></div>',
      showConfirmButton: false,
      allowOutsideClick: false,
      background: 'rgba(255,255,255,0.95)',
      backdrop: 'rgba(0,0,0,0.4)'
    });

    try {
      this.exportService.exportarDashboardPDF(
        this.kpis,
        this.ventasSemanales,
        this.productosMasVendidos,
        this.ventasPorVendedor
      );
      Swal.fire({
        icon: 'success',
        title: '¡Exportación Exitosa!',
        text: 'El archivo PDF ha sido descargado correctamente.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#667eea',
        background: 'rgba(255,255,255,0.95)',
        backdrop: 'rgba(0,0,0,0.4)'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al exportar',
        text: 'No se pudo generar el archivo PDF.',
        confirmButtonColor: '#667eea',
        background: 'rgba(255,255,255,0.95)',
        backdrop: 'rgba(0,0,0,0.4)'
      });
    }
  }
}
