import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { UsuariosService } from '../service/usuarios.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const usuariosService = inject(UsuariosService);

  const token = localStorage.getItem('token');

  if (!token) {
    localStorage.removeItem('token');
    return router.createUrlTree(['/login']);
  }

  return usuariosService.validarToken(token).pipe(
    map(response => {
      if (response.valid) {
        return true;
      } else {
        localStorage.removeItem('token');
        return router.createUrlTree(['/login']);
      }
    }),
    catchError(() => {
      localStorage.removeItem('token');
      return of(router.createUrlTree(['/login']));
    })
  );
};
