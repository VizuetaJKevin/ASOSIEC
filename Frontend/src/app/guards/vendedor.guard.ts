import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class VendedorGuard implements CanActivate {

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    // Verificar si el usuario es Vendedor o Admin
    if (this.loginService.esVendedor() || this.loginService.esAdmin()) {
      return true;
    }

    // Si no es vendedor ni admin, redirigir al home
    console.log('🚫 Acceso denegado - Se requiere rol de Vendedor');
    this.router.navigate(['/home']);
    return false;
  }
}
