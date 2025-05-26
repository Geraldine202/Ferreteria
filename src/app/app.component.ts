import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AlertController, MenuController } from '@ionic/angular';
import { UsuariosService } from './service/usuarios.service';

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
  noMenuPages = ['/login', '/recuperar', '/registrarse','/contrasenia','/cambio-contrasenia-forzado'];

  constructor(private router: Router, private menuCtrl: MenuController ,private alertCtrl: AlertController,private usuariosService: UsuariosService ) {
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: NavigationEnd) => {
    // Buscar si la ruta comienza con alguna de las rutas definidas
    this.isLoginPage = this.noMenuPages.some(page => event.urlAfterRedirects.startsWith(page));

    // Activa o desactiva el menú según corresponda
    this.menuCtrl.enable(!this.isLoginPage);
  });}
ngOnInit() {
}
   private checkViewportSize() {
    this.isMobileView = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      this.isMobileView = window.innerWidth < 768;
    });
  }

  private setupRouterEvents() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isLoginPage = this.noMenuPages.includes(event.urlAfterRedirects);
      this.menuCtrl.enable(!this.isLoginPage);
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
async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que deseas salir?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salir',
          handler: () => {
            this.usuariosService.logout();
            this.menuCtrl.close('main-menu');
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    
    await alert.present();
  }
}
