import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CategoriaPage } from './pages/categoria/categoria.page';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'carrito',
    loadChildren: () => import('./pages/carrito/carrito.module').then( m => m.CarritoPageModule)
  },
  {
    path: 'contacto',
    loadChildren: () => import('./pages/contacto/contacto.module').then( m => m.ContactoPageModule)
  },
  {
    path: 'categoria/:nombre', component: CategoriaPage,
    loadChildren: () => import('./pages/categoria/categoria.module').then( m => m.CategoriaPageModule)
  },
  {
    path: 'trabajadores',
    loadChildren: () => import('./pages/trabajadores/trabajadores.module').then( m => m.TrabajadoresPageModule)
  },
  {
    path: 'inventario',
    loadChildren: () => import('./pages/inventario/inventario.module').then( m => m.InventarioPageModule)
  },
  {
    path: 'registrarse',
    loadComponent: () => import('./pages/registrarse/registrarse.page').then( m => m.RegistrarsePage)
  },
  {
    path: 'recuperar',
    loadComponent: () => import('./pages/recuperar/recuperar.page').then( m => m.RecuperarPage)
  },
  {
    path: 'generar-pedido',
    loadChildren: () => import('./pages/generar-pedido/generar-pedido.module').then( m => m.GenerarPedidoPageModule)
  },
  {
    path: 'aprobar-pagos',
    loadChildren: () => import('./pages/aprobar-pagos/aprobar-pagos.module').then( m => m.AprobarPagosPageModule)
  },
  {
    path: 'aprobar-pedido',
    loadChildren: () => import('./pages/aprobar-pedido/aprobar-pedido.module').then( m => m.AprobarPedidoPageModule)
  },
  {
    path: 'realizar-pago',
    loadChildren: () => import('./pages/realizar-pago/realizar-pago.module').then( m => m.RealizarPagoPageModule)
  },
  {
    path: 'informes',
    loadChildren: () => import('./pages/informes/informes.module').then( m => m.InformesPageModule)
  },








];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
