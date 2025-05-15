import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  isMenuOpen = false; 
  isLoginPage = false; 
  isMobileView = false;
  // Lista de rutas donde el menú no debe mostrarse
  noMenuPages = ['/login', '/recuperar', '/registrarse'];

  constructor(private router: Router, private menuCtrl: MenuController) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Verifica si la ruta actual está en la lista de páginas sin menú
      this.isLoginPage = this.noMenuPages.includes(event.urlAfterRedirects);
      
      // Si estamos en una de esas páginas, cerramos el menú (si está abierto)
      if (this.isLoginPage) {
        this.menuCtrl.enable(false); // Desactiva el menú en esas páginas
      } else {
        this.menuCtrl.enable(true);  // Habilita el menú en otras páginas
      }
    });
  }

  toggleMenu() {
    if (this.isMobileView) {
      this.isMenuOpen = !this.isMenuOpen; // Solo en vista móvil alterna el estado
    }
  }

  esPantallaPequena(): boolean {
    return window.innerWidth < 768;
  }

  cerrarMenuSiEsNecesario() {
    if (this.esPantallaPequena()) {
      this.menuCtrl.close('main-menu');
    }
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

  mostrarSubcategorias = false;

  subcategorias = ['Herramientas Manuales', 'Materiales Básicos', 'Equipos de seguridad','Tornillos y Anclajes','Fijaciones y Adhesivos','Equipos de Medición'];
  
  seleccionarSubcategoria(nombre: string) {
    console.log('Seleccionaste:', nombre);
  }
}
