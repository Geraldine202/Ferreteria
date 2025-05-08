import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class PerfilPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  mostrarSubcategorias = false;

  subcategorias = ['Herramientas Manuales', 'Materiales Básicos', 'Equipos de seguridad','Tornillos y Anclajes','Fijaciones y Adhesivos','Equipos de Medición'];
  
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
        return 'hardware-chip'; // no hay uno específico, este es representativo
      case 'Fijaciones y Adhesivos':
        return 'git-merge'; // algo que represente unión
      case 'Equipos de Medición':
        return 'speedometer';
      default:
        return 'pricetag';
    }
  }

  irACategoria(nombre: string) {
    // Por ejemplo, redirige a /categoria/herramientas-manuales
    const ruta = nombre.toLowerCase().replace(/\s+/g, '-'); // reemplaza espacios por guiones
    this.router.navigate(['/categoria', ruta]);
  } 

  cerrarSesion() {
    // Lógica para cerrar sesión, ejemplo:
    this.router.navigate(['/login']);
  }
}
