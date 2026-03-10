import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Genera un timestamp con formato: YYYY-MM-DD_HH-mm-ss
   * Ejemplo: 2024-06-15_14-30-45
   */
  private getTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  /**
   * Genera una fecha/hora legible para el encabezado del reporte
   */
  private getReadableDate(): string {
    const now = new Date();
    return now.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // =============================================
  // EXPORTAR EXCEL - AUDITORÍA
  // =============================================
  exportarAuditExcel(data: any[]): void {
    const timestamp = this.getTimestamp();
    const filename = `Auditoria_${timestamp}.xlsx`;

    const rows = data.map(log => ({
      'ID': log.id,
      'Fecha y Hora': new Date(log.fecha_evento).toLocaleString('es-ES'),
      'Usuario Email': log.usuario_email || 'N/A',
      'Usuario Nombre': log.usuario_nombre || 'N/A',
      'Rol': log.usuario_rol || 'N/A',
      'Operación': log.tipo_operacion,
      'Entidad': log.entidad,
      'Acción': log.accion,
      'Estado': log.exito ? 'Exitoso' : 'Fallido',
      'IP': log.ip_address || 'N/A',
      'Código Error': log.codigo_error || '',
      'Mensaje Error': log.mensaje_error || ''
    }));

    const wb = XLSX.utils.book_new();

    // Hoja de datos
    const ws = XLSX.utils.json_to_sheet(rows);

    // Ajustar anchos de columna
    ws['!cols'] = [
      { wch: 8 },  // ID
      { wch: 20 }, // Fecha
      { wch: 28 }, // Email
      { wch: 22 }, // Nombre
      { wch: 14 }, // Rol
      { wch: 12 }, // Operación
      { wch: 16 }, // Entidad
      { wch: 30 }, // Acción
      { wch: 10 }, // Estado
      { wch: 16 }, // IP
      { wch: 14 }, // Código Error
      { wch: 30 }  // Mensaje Error
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Auditoría');

    // Hoja de resumen
    const resumen = [
      ['Reporte de Auditoría del Sistema ASOSIEC'],
      ['Generado el:', this.getReadableDate()],
      ['Total de registros:', data.length],
      ['Exitosos:', data.filter(l => l.exito).length],
      ['Fallidos:', data.filter(l => !l.exito).length],
      ['Usuarios únicos:', new Set(data.map(l => l.usuario_email).filter(Boolean)).size]
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    wsResumen['!cols'] = [{ wch: 25 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    XLSX.writeFile(wb, filename);
  }

  // =============================================
  // EXPORTAR PDF - AUDITORÍA
  // =============================================
  exportarAuditPDF(data: any[], estadisticas: any[]): void {
    const timestamp = this.getTimestamp();
    const filename = `Auditoria_${timestamp}.pdf`;
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });

    // ── Header ──────────────────────────────────
    doc.setFillColor(172, 93, 62);
    doc.rect(0, 0, 297, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE AUDITORÍA DEL SISTEMA ASOSIEC', 148.5, 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${this.getReadableDate()}`, 148.5, 17, { align: 'center' });

    // ── Estadísticas ────────────────────────────
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Estadístico:', 14, 30);

    const exitosos = data.filter(l => l.exito).length;
    const fallidos = data.filter(l => !l.exito).length;
    const usuariosUnicos = new Set(data.map(l => l.usuario_email).filter(Boolean)).size;

    const statsData = [
      ['Total de Eventos', data.length.toString(),
       'Operaciones Exitosas', exitosos.toString(),
       'Operaciones Fallidas', fallidos.toString(),
       'Usuarios Únicos', usuariosUnicos.toString()]
    ];

    autoTable(doc, {
      startY: 33,
      head: [['Total Eventos', 'Cant.', 'Exitosas', 'Cant.', 'Fallidas', 'Cant.', 'Usuarios Únicos', 'Cant.']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [172, 93, 62], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 9, halign: 'center' },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto'
    });

    // ── Tabla principal ──────────────────────────
    const finalY = (doc as any).lastAutoTable?.finalY || 50;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Registros:', 14, finalY + 8);

    const tableData = data.map(log => [
      new Date(log.fecha_evento).toLocaleString('es-ES'),
      log.usuario_email || 'N/A',
      log.usuario_rol || 'N/A',
      log.tipo_operacion,
      log.entidad,
      log.accion?.substring(0, 40) || '',
      log.exito ? '✓' : '✗',
      log.ip_address || 'N/A'
    ]);

    autoTable(doc, {
      startY: finalY + 11,
      head: [['Fecha/Hora', 'Email Usuario', 'Rol', 'Operación', 'Entidad', 'Acción', 'Estado', 'IP']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [172, 93, 62], textColor: 255, fontSize: 7, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7 },
      alternateRowStyles: { fillColor: [240, 242, 255] },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 45 },
        2: { cellWidth: 20 },
        3: { cellWidth: 22 },
        4: { cellWidth: 20 },
        5: { cellWidth: 65 },
        6: { cellWidth: 14, halign: 'center' },
        7: { cellWidth: 28 }
      },
      margin: { left: 14, right: 14 },
      didDrawCell: (hookData: any) => {
        // Colorear la columna Estado
        if (hookData.section === 'body' && hookData.column.index === 6) {
          const text = hookData.cell.text[0];
          if (text === '✓') {
            doc.setTextColor(39, 174, 96);
          } else {
            doc.setTextColor(231, 76, 60);
          }
        }
      }
    });

    // ── Footer ───────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount} — ${filename}`,
        148.5,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      );
    }

    doc.save(filename);
  }

  // =============================================
  // EXPORTAR EXCEL - DASHBOARD
  // =============================================
  exportarDashboardExcel(
    kpis: any,
    ventasSemanales: any[],
    productosMasVendidos: any[],
    ventasPorVendedor: any[]
  ): void {
    const timestamp = this.getTimestamp();
    const filename = `Dashboard_${timestamp}.xlsx`;
    const wb = XLSX.utils.book_new();

    // Hoja 1 – KPIs
    const kpisData = [
      ['DASHBOARD ADMINISTRATIVO - REPORTE DE KPIs'],
      ['Generado:', this.getReadableDate()],
      [],
      ['INDICADOR', 'VALOR'],
      ['Ventas del Mes Actual ($)', kpis?.ventas_mes_actual || 0],
      ['Ventas del Mes Anterior ($)', kpis?.ventas_mes_anterior || 0],
      ['Crecimiento (%)', kpis?.crecimiento_porcentaje || 0],
      ['Órdenes Pendientes', kpis?.ordenes_pendientes || 0],
      ['Órdenes Completadas (mes)', kpis?.ordenes_completadas_mes || 0],
      ['Total de Órdenes', kpis?.total_ordenes || 0],
      ['Total de Productos', kpis?.total_productos || 0],
      ['Productos sin Stock', kpis?.productos_sin_stock || 0],
      ['Total de Clientes', kpis?.total_clientes || 0],
      ['Vendedores Activos', kpis?.vendedores_activos || 0],
      ['Solicitudes Pendientes', kpis?.solicitudes_pendientes || 0]
    ];
    const wsKpis = XLSX.utils.aoa_to_sheet(kpisData);
    wsKpis['!cols'] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsKpis, 'KPIs');

    // Hoja 2 – Ventas semanales
    const wsVentas = XLSX.utils.json_to_sheet(
      ventasSemanales.map(v => ({
        'Fecha': v.fecha_corta,
        'Día': v.dia_nombre,
        'Total Ventas ($)': v.total,
        'Cantidad Órdenes': v.cantidad_ordenes
      }))
    );
    wsVentas['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas Semanales');

    // Hoja 3 – Productos más vendidos
    const wsProductos = XLSX.utils.json_to_sheet(
      productosMasVendidos.map((p, i) => ({
        'Posición': i + 1,
        'Producto': p.nombre_producto,
        'Cantidad Vendida': p.cantidad_vendida,
        'Total Generado ($)': p.total_generado
      }))
    );
    wsProductos['!cols'] = [{ wch: 10 }, { wch: 35 }, { wch: 18 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos Top');

    // Hoja 4 – Ventas por vendedor
    const wsVendedores = XLSX.utils.json_to_sheet(
      ventasPorVendedor.map(v => ({
        'Vendedor': v.nombre_vendedor,
        'Total Ventas ($)': v.total_ventas,
        'Productos Vendidos': v.total_productos_vendidos,
        'Cantidad Órdenes': v.cantidad_ordenes
      }))
    );
    wsVendedores['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 20 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsVendedores, 'Ventas por Vendedor');

    XLSX.writeFile(wb, filename);
  }

  // =============================================
  // EXPORTAR PDF - DASHBOARD
  // =============================================
  exportarDashboardPDF(
    kpis: any,
    ventasSemanales: any[],
    productosMasVendidos: any[],
    ventasPorVendedor: any[]
  ): void {
    const timestamp = this.getTimestamp();
    const filename = `Dashboard_${timestamp}.pdf`;
    const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });

    // ── Header ──────────────────────────────────
    doc.setFillColor(172, 93, 62);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE DASHBOARD ADMINISTRATIVO ASOSIEC', 105, 11, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${this.getReadableDate()}`, 105, 19, { align: 'center' });

    // ── KPIs ────────────────────────────────────
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Indicadores Clave (KPIs)', 14, 33);

    autoTable(doc, {
      startY: 36,
      head: [['Indicador', 'Valor']],
      body: [
        ['Ventas Mes Actual', `$${(kpis?.ventas_mes_actual || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
        ['Ventas Mes Anterior', `$${(kpis?.ventas_mes_anterior || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
        ['Crecimiento', `${(kpis?.crecimiento_porcentaje || 0).toFixed(1)}%`],
        ['Órdenes Pendientes', kpis?.ordenes_pendientes || 0],
        ['Órdenes Completadas (mes)', kpis?.ordenes_completadas_mes || 0],
        ['Total Órdenes', kpis?.total_ordenes || 0],
        ['Total Productos', kpis?.total_productos || 0],
        ['Productos sin Stock', kpis?.productos_sin_stock || 0],
        ['Total Clientes', kpis?.total_clientes || 0],
        ['Vendedores Activos', kpis?.vendedores_activos || 0],
        ['Solicitudes Pendientes', kpis?.solicitudes_pendientes || 0],
      ],
      theme: 'grid',
      headStyles: { fillColor: [172, 93, 62], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 242, 255] },
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 40, halign: 'right' } },
      margin: { left: 14, right: 14 }
    });

    // ── Ventas Semanales ─────────────────────────
    let currentY = (doc as any).lastAutoTable?.finalY + 10 || 140;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Ventas Semanales', 14, currentY);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Fecha', 'Día', 'Total Ventas ($)', 'Órdenes']],
      body: ventasSemanales.map(v => [
        v.fecha_corta,
        v.dia_nombre,
        `$${v.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        v.cantidad_ordenes
      ]),
      theme: 'striped',
      headStyles: { fillColor: [172, 93, 62], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [240, 242, 255] },
      margin: { left: 14, right: 14 }
    });

    // ── Productos más vendidos ───────────────────
    currentY = (doc as any).lastAutoTable?.finalY + 10 || 200;

    // Nueva página si no hay espacio
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Productos Más Vendidos', 14, currentY);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['#', 'Producto', 'Cantidad', 'Total Generado ($)']],
      body: productosMasVendidos.map((p, i) => [
        i + 1,
        p.nombre_producto,
        p.cantidad_vendida,
        `$${p.total_generado.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [172, 93, 62], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [240, 242, 255] },
      margin: { left: 14, right: 14 }
    });

    // ── Ventas por Vendedor ──────────────────────
    currentY = (doc as any).lastAutoTable?.finalY + 10 || 240;

    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Ventas por Vendedor', 14, currentY);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Vendedor', 'Total Ventas ($)', 'Productos Vendidos', 'Órdenes']],
      body: ventasPorVendedor.map(v => [
        v.nombre_vendedor,
        `$${v.total_ventas.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        v.total_productos_vendidos,
        v.cantidad_ordenes
      ]),
      theme: 'striped',
      headStyles: { fillColor: [172, 93, 62], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [240, 242, 255] },
      margin: { left: 14, right: 14 }
    });

    // ── Footer ───────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount} — ${filename}`,
        105,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      );
    }

    doc.save(filename);
  }
}
