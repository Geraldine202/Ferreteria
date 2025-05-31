import { Component } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ProductosService } from 'src/app/service/productos.service';
import { UsuariosService } from 'src/app/service/usuarios.service';
import { ToastController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-informes',
  templateUrl: './informes.page.html',
  styleUrls: ['./informes.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class InformesPage {
  logoBase64: string = '';
  isLoading = false;

  constructor(
    private productosService: ProductosService,
    private usuariosService: UsuariosService,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    await this.convertirImagenABase64('assets/images/logo.png');
  }

  private async convertirImagenABase64(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          this.logoBase64 = canvas.toDataURL('image/png').split(',')[1];
          resolve();
        } else {
          reject(new Error('No se pudo obtener el contexto del canvas'));
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async exportarPagosExcel() {
    this.isLoading = true;
    try {
      const pagos: any = await this.usuariosService.obtenerTodosLosPagos().toPromise();
      console.log('Pagos recibidos:', pagos);
      if (!pagos || pagos.length === 0) {
        await this.mostrarError('No hay datos de pagos para exportar');
        return;
      }

      const datosFormateados = pagos.map((pago: any) => ({
        'ID Pago': pago.id_pago,
        'Monto Total': `$${pago.monto_total?.toLocaleString() || '0'}`,
        'Fecha Pago': pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-CL') : 'N/A',
        'Tipo Pago': pago.id_tipo_pago|| 'N/A',
        'RUT Usuario': pago.rut_usuario || 'N/A',
        'Estado': pago.id_pedido|| 'N/A'
      }));

      await this.generarReporteExcel(datosFormateados, 'Informe_Pagos', 'Reporte de Pagos');
      await this.mostrarExito('Informe de pagos generado con éxito');

    } catch (error) {
      console.error('Error al generar informe de pagos:', error);
      await this.mostrarError('Error al generar informe de pagos');
    } finally {
      this.isLoading = false;
    }
  }

  async exportarPedidosExcel() {
    this.isLoading = true;
    try {
      const pedidos: any = await this.usuariosService.obtenerTodosLosPedidos().toPromise();
        console.log('Pedidos recibidos:', pedidos);
      if (!pedidos || pedidos.length === 0) {
        await this.mostrarError('No hay datos de pedidos para exportar');
        return;
      }

      const datosFormateados = pedidos.map((pedido: any) => ({
        'ID Pedido': pedido.id_pedido,
        'Descripción': pedido.descripcion || 'N/A',
        'Total': `$${pedido.total_a_pagar?.toLocaleString() || '0'}`,
        'Fecha': pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toLocaleDateString('es-CL') : 'N/A',
        'Estado': pedido.id_estado_pedido || 'N/A',
        'Estado Pago': pedido.id_estado_pago || 'N/A',
        'Entrega': pedido.id_entrega || 'N/A',
        'Cliente': pedido.rut_usuario || 'N/A'
      }));

      await this.generarReporteExcel(datosFormateados, 'Informe_Pedidos', 'Reporte de Pedidos');
      await this.mostrarExito('Informe de pedidos generado con éxito');

    } catch (error) {
      console.error('Error al generar informe de pedidos:', error);
      await this.mostrarError('Error al generar informe de pedidos');
    } finally {
      this.isLoading = false;
    }
  }

  async exportarInventarioExcel() {
    this.isLoading = true;
    try {
      const producto: any = await firstValueFrom(this.usuariosService.obtenerTodosLosProductos());

      console.log('Inventario recibidos:', producto);
      if (!producto || producto.length === 0) {
        await this.mostrarError('No hay datos de inventario para exportar');
        return;
      }

      const datosFormateados = producto.map((item: any) => ({
        'ID Producto': item.id_producto,
        'Producto': item.nombre || 'N/A',
        'Descripcion': item.descripcion || 'N/A',
        'Precio': `$${item.precio?.toLocaleString() || '0'}`,
        'Stock': item.stock || 0,
        'Marca': item.id_marca || 'N/A',
        'Inventario': item.id_inventario || 'N/A',
        'Categoria': item.id_categoria || 'N/A'
      }));

      await this.generarReporteExcel(datosFormateados, 'Informe_Inventario', 'Reporte de Inventario');
      await this.mostrarExito('Informe de inventario generado con éxito');

    } catch (error) {
      console.error('Error al generar informe de inventario:', error);
      await this.mostrarError('Error al generar informe de inventario');
    } finally {
      this.isLoading = false;
    }
  }

private async generarReporteExcel(data: any[], nombreArchivo: string, titulo: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte');

  // Agregar logo
  if (this.logoBase64) {
    const imageId = workbook.addImage({
      base64: 'data:image/png;base64,' + this.logoBase64,
      extension: 'png',
    });

    // Ajustar posición del logo (puedes modificar filas y columnas)
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 120, height: 120 }
    });
  }

  // Dejar espacio para el logo
  worksheet.addRow([]);
  worksheet.addRow([]);

  // Título del reporte en fila 4 o después del logo
  const tituloRow = worksheet.addRow([titulo]);
  tituloRow.font = { size: 16, bold: true };
  tituloRow.alignment = { vertical: 'middle', horizontal: 'center' };
  tituloRow.height = 30;

  // Fusionar celdas del título según cantidad de columnas
  const totalColumnas = Object.keys(data[0]).length;
  worksheet.mergeCells(tituloRow.number, 1, tituloRow.number, totalColumnas);

  // Fecha de generación
  const fechaRow = worksheet.addRow([`Generado el: ${new Date().toLocaleDateString()}`]);
  fechaRow.font = { italic: true };
  fechaRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells(fechaRow.number, 1, fechaRow.number, totalColumnas);

  worksheet.addRow([]);

  // Encabezados
  const encabezados = Object.keys(data[0]);
  const headerRow = worksheet.addRow(encabezados);

  // Estilo para encabezados
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }  // Azul corporativo
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' },
      bold: true
    };
    cell.alignment = { horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Datos
  data.forEach((item, index) => {
    const row = worksheet.addRow(Object.values(item));
    row.alignment = { vertical: 'middle', horizontal: 'left' };

    // Alternar colores de fila para legibilidad
    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE9E9E9' }
        };
      });
    }
  });

worksheet.columns.forEach((column) => {
  if (!column) return; // si es undefined o null, saltar

  let maxLength = 10;

  // aquí forzamos el tipo para que TS no se queje:
  (column as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
    const cellValue = cell.value ? cell.value.toString() : '';
    if (cellValue.length > maxLength) {
      maxLength = cellValue.length;
    }
  });

  column.width = Math.min(maxLength + 5, 40);
});



  // Generar archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
}


  private async mostrarExito(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  private async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
}