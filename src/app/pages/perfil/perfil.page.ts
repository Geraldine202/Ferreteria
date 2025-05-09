import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class PerfilPage implements OnInit {

  mostrarSubcategorias = false;

  subcategorias = [
    'Herramientas Manuales',
    'Materiales Básicos',
    'Equipos de seguridad',
    'Tornillos y Anclajes',
    'Fijaciones y Adhesivos',
    'Equipos de Medición'
  ];

  constructor(private router: Router, private navController: NavController) {}

  ngOnInit() {}

  irAHome() {
    this.navController.navigateRoot('/home');
  }

  seleccionarSubcategoria(nombre: string) {
    console.log('Seleccionaste:', nombre);
  }

  obtenerIcono(nombre: string): string {
    switch (nombre) {
      case 'Herramientas Manuales':
        return 'construct';
      case 'Materiales Básicos':
        return 'cube';
      case 'Equipos de seguridad':
        return 'shield-checkmark';
      case 'Tornillos y Anclajes':
        return 'hardware-chip';
      case 'Fijaciones y Adhesivos':
        return 'git-merge';
      case 'Equipos de Medición':
        return 'speedometer';
      default:
        return 'pricetag';
    }
  }

  irACategoria(nombre: string) {
    const ruta = nombre.toLowerCase().replace(/\s+/g, '-');
    this.router.navigate(['/categoria', ruta]);
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
