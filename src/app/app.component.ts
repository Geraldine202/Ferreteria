import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AlertController, MenuController } from '@ionic/angular';
import { UsuariosService } from './service/usuarios.service';
import { CarritoService } from './service/carrito.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  contadorCarrito = 0;
  private carritoSub!: Subscription;
  isMenuOpen = false; 
  isLoginPage = false; 
  isMobileView = false;
  mostrarCarrito = false;
  usuarioActual: any = null;
  usuarioLogueado: any = null;
  tipoUsuario: string = '';
  rutasConCarrito = ['/home','/categoria/herramientas-manuales','/categoria/materiales-basicos','/categoria/equipos-de-seguridad','/categoria/equipos-de-seguridad','/categoria/tornillos-y-anclajes','/categoria/fijaciones-y-adhesivos','/categoria/equipos-de-medicion'];
  // Lista de rutas donde el menú no debe mostrarse
  noMenuPages = ['/login', '/recuperar', '/registrarse','/contrasenia','/cambio-contrasenia-forzado'];
  totalCarrito: number = 0;
  constructor(private router: Router, private menuCtrl: MenuController ,private alertCtrl: AlertController,private usuariosService: UsuariosService,private carritoService: CarritoService ) {
  
    this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: NavigationEnd) => {
    // Buscar si la ruta comienza con alguna de las rutas definidas
    this.isLoginPage = this.noMenuPages.some(page => event.urlAfterRedirects.startsWith(page));

    // Activa o desactiva el menú según corresponda
    this.menuCtrl.enable(!this.isLoginPage);
  });}
ngOnInit() {
  this.usuarioLogueado = this.usuariosService.obtenerUsuarioActual();
  console.log('Usuario logueado en AppComponent:', this.usuarioLogueado);
 this.usuariosService.usuario$.subscribe(usuario => {
    this.usuarioActual = usuario;
    this.usuarioLogueado = !!usuario;
  });
// Suscribirse a los cambios del carrito
  this.cargarUsuarioActual();
    this.carritoSub = this.carritoService.contador$.subscribe(
      cantidad => this.contadorCarrito = cantidad
    );
    this.usuarioLogueado = this.usuariosService.estaAutenticado();

    // Opcional: suscribirse a cambios en tiempo real
    this.usuariosService.isLoggedIn.subscribe(status => {
      this.usuarioLogueado = status;
    });
    // Cargar el estado inicial
    this.actualizarContador();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.mostrarCarrito = this.rutasConCarrito.includes(event.urlAfterRedirects);
      });
  
}

ngOnDestroy() {
    if (this.carritoSub) {
      this.carritoSub.unsubscribe();
    }
  }
cargarUsuarioActual() {
  this.usuarioActual = this.usuariosService.obtenerUsuarioActual();
  if (this.usuarioActual) {
    this.tipoUsuario = this.usuarioActual.tipoUsuario || ''; // Cambia por la propiedad correcta
    console.log('Usuario actual:', this.usuarioActual);
    console.log('Tipo de usuario:', this.tipoUsuario);
  } else {
    this.tipoUsuario = '';
  }
}
  actualizarContador() {
    const carrito = this.carritoService.obtenerCarrito();
    this.contadorCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
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
      case 'Materiales Basicos':
        return 'cube';
      case 'Equipos de seguridad':
        return 'shield-checkmark';
      case 'Tornillos y Anclajes':
        return 'hardware-chip'; // no hay uno específico, este es representativo
      case 'Fijaciones y Adhesivos':
        return 'git-merge'; // algo que represente unión
      case 'Equipos de Medicion':
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

   subcategorias = ['Herramientas Manuales', 'Materiales Basicos', 'Equipos de seguridad','Tornillos y Anclajes','Fijaciones y Adhesivos','Equipos de Medicion'];
  
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
            this.carritoService.limpiarCarrito();
            this.router.navigate(['/login']);
            
          }
        }
      ]
    });
    
    await alert.present();
  }
}
