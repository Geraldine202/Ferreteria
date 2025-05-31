import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CategoriaPage } from './pages/categoria/categoria.page';
import { authGuard } from './guards/auth.guard'; 

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),

  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then(m => m.PerfilPageModule),
    canActivate: [authGuard] 
  },
  {
    path: 'carrito',
    loadChildren: () => import('./pages/carrito/carrito.module').then(m => m.CarritoPageModule),
    canActivate: [authGuard] 
  },
  {
    path: 'contacto',
    loadChildren: () => import('./pages/contacto/contacto.module').then(m => m.ContactoPageModule),
    canActivate: [authGuard] 
  },
  {
    path: 'categoria/:nombre',
    component: CategoriaPage,
    loadChildren: () => import('./pages/categoria/categoria.module').then(m => m.CategoriaPageModule),
    canActivate: [authGuard] 
  },
  {
    path: 'trabajadores',
    loadChildren: () => import('./pages/trabajadores/trabajadores.module').then(m => m.TrabajadoresPageModule),
    canActivate: [authGuard] 
  },
  {
    path: 'inventario',
    loadChildren: () => import('./pages/inventario/inventario.module').then(m => m.InventarioPageModule),
    canActivate: [authGuard] 
  },
  {
    path: 'registrarse',
    loadComponent: () => import('./pages/registrarse/registrarse.page').then(m => m.RegistrarsePage),
  
  },
  {
    path: 'recuperar',
    loadComponent: () => import('./pages/recuperar/recuperar.page').then(m => m.RecuperarPage),
   
  },
  {
    path: 'generar-pedido',
    loadChildren: () => import('./pages/generar-pedido/generar-pedido.module').then(m => m.GenerarPedidoPageModule),
    canActivate: [authGuard] 
  },
  {
    path: 'aprobar-pagos',
    loadChildren: () => import('./pages/aprobar-pagos/aprobar-pagos.module').then(m => m.AprobarPagosPageModule),
    canActivate: [authGuard] 
  },
  {
    path: 'aprobar-pedido',
    loadChildren: () => import('./pages/aprobar-pedido/aprobar-pedido.module').then(m => m.AprobarPedidoPageModule),
    canActivate: [authGuard] 
  },
  {
    path: 'realizar-pago',
    loadChildren: () => import('./pages/realizar-pago/realizar-pago.module').then(m => m.RealizarPagoPageModule),
    canActivate: [authGuard] 
  },
  {
    path: 'informes',
    loadChildren: () => import('./pages/informes/informes.module').then(m => m.InformesPageModule),
    canActivate: [authGuard] 
  },
  {
    path: 'contrasenia',
    loadChildren: () => import('./pages/contrasenia/contrasenia.module').then( m => m.ContraseniaPageModule)
  },
  {
    path: 'cambio-contrasenia-forzado',
    loadChildren: () => import('./pages/cambio-contrasenia-forzado/cambio-contrasenia-forzado.module').then( m => m.CambioContraseniaForzadoPageModule)
  },
  {
    path: '**',
    redirectTo: 'login'
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }