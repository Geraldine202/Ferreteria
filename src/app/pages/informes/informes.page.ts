import { Component } from '@angular/core';
import * as XLSX from 'xlsx'; // Librería para Excel
import { saveAs } from 'file-saver'; // Librería para guardar archivos
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-informes',
  templateUrl: './informes.page.html',
  styleUrls: ['./informes.page.scss'],
  standalone: true,
  imports: [IonicModule] // Importa IonicModule porque usas componentes Ionic en el HTML
})
export class InformesPage {

  pagos = [
    { id: 1, vendedor: 'Juan Pérez', monto: 25000, estado: 'aprobado' },
    { id: 2, vendedor: 'Ana Soto', monto: 18000, estado: 'pendiente' },
  ];

  pedidos = [
    { id: 1, cliente: 'Carlos Díaz', producto: 'Camisa', cantidad: 3, estado: 'aprobado' },
    { id: 2, cliente: 'Laura Ruiz', producto: 'Zapatos', cantidad: 1, estado: 'pendiente' },
  ];

  inventario = [
    { id: 1, producto: 'Camisa', stock: 120 },
    { id: 2, producto: 'Zapatos', stock: 50 },
  ];

  exportarPagosExcel() {
    this.exportarExcel(this.pagos, 'Informe_Pagos');
  }

  exportarPedidosExcel() {
    this.exportarExcel(this.pedidos, 'Informe_Pedidos');
  }

  exportarInventarioExcel() {
    this.exportarExcel(this.inventario, 'Informe_Inventario');
  }

  private exportarExcel(data: any[], nombreArchivo: string) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'Datos': worksheet }, SheetNames: ['Datos'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.guardarArchivo(excelBuffer, nombreArchivo);
  }

  private guardarArchivo(buffer: any, nombreArchivo: string) {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, `${nombreArchivo}_${new Date().getTime()}.xlsx`);
  }
}