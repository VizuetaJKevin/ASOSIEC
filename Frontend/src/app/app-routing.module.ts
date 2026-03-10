import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/public/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ProductosComponent } from './components/client/productos/productos.component';
import { AboutComponent } from './components/public/about/about.component';
import { ContactComponent } from './components/public/contact/contact.component';
import { CheckoutComponent } from './components/client/checkout/checkout.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { VendedorGuard } from './guards/vendedor.guard';

//Productos
import { CatalogoProductosComponent } from './components/client/productos/catalogo-productos/catalogo-productos.component';

import { CarritoComponent } from './components/client/carrito/carrito.component';
import { HistorialComprasComponent } from './components/client/historial-compras/historial-compras.component';
import { RecuperarComponent } from './components/auth/recuperar/recuperar.component';
import { RegistroComponent } from './components/auth/registro/registro.component';
import { ProfileComponent } from './components/auth/profile/profile.component';
import { AdminEstadosComponent } from './components/admin/admin-estados/admin-estados.component';
import { AdminProductosComponent } from './components/admin/admin-productos/admin-productos.component';
import { AdminRolesComponent } from './components/admin/admin-roles/admin-roles.component';
import { AdminUsuariosComponent } from './components/admin/admin-usuarios/admin-usuarios.component';
import { AdminComprobantesComponent } from './components/admin/admin-comprobantes/admin-comprobantes.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminConfiguracionComponent } from './components/admin/admin-configuracion/admin-configuracion.component';
import { AdminAuditComponent } from './components/admin/admin-audit/admin-audit.component';
import { AdminDevolucionesComponent } from './components/admin/admin-devoluciones/admin-devoluciones.component';

const routes: Routes = [
  //Auth
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, },

  { path: 'recuperar', component: RecuperarComponent },
  { path: 'registro', component: RegistroComponent },

  // ========================================
  // RUTAS DE ADMINISTRACIÓN
  // ========================================

  // ✅ SOLO ADMINISTRADORES
  { path: 'adm-estados', component: AdminEstadosComponent, canActivate: [AdminGuard] },
  { path: 'adm-roles', component: AdminRolesComponent, canActivate: [AdminGuard] },
  { path: 'adm-usuarios', component: AdminUsuariosComponent, canActivate: [AdminGuard] },
  { path: 'adm-comprobantes', component: AdminComprobantesComponent, canActivate: [AdminGuard] },
  { path: 'adm-configuracion', component: AdminConfiguracionComponent, canActivate: [AdminGuard] },
  { path: 'adm-dashboard', component: AdminDashboardComponent, canActivate: [VendedorGuard] },
  { path: 'adm-productos', component: AdminProductosComponent, canActivate: [VendedorGuard] },
  { path: 'adm-audit', component: AdminAuditComponent, canActivate: [AdminGuard] },
  { path: 'adm-devoluciones', component: AdminDevolucionesComponent, canActivate: [AdminGuard] },

  //Productos
  { path: 'productos', component: ProductosComponent },

  {
    path: 'productos/:categoria',
    component: CatalogoProductosComponent
  },

  //Carrito
  { path: 'carrito', component: CarritoComponent, canActivate: [AuthGuard],
    children: [
      { path: 'checkout', component: CheckoutComponent},
    ],
  },
  { path: 'historial-compras', component: HistorialComprasComponent },

  //Public
  { path: 'about', component: AboutComponent},
  { path: 'contact', component: ContactComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
