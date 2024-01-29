import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/public/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ProductosComponent } from './components/client/productos/productos.component';
import { AboutComponent } from './components/public/about/about.component';
import { ContactComponent } from './components/public/contact/contact.component';
import { ElectrodomesticosComponent } from './components/client/productos/electrodomesticos/electrodomesticos.component';
import { TecnologiaComponent } from './components/client/productos/tecnologia/tecnologia.component';
import { CarritoComponent } from './components/client/carrito/carrito.component';
import { CheckOutComponent } from './components/client/carrito/check-out/check-out.component';
import { InventoryComponent } from './components/client/inventory/inventory.component';
import { FailComponent } from './components/shared/fail/fail.component';
import { ProcesandoComponent } from './components/shared/procesando/procesando.component';
import { SuccessComponent } from './components/shared/success/success.component';
import { RecuperarComponent } from './components/auth/recuperar/recuperar.component';
import { RegistroComponent } from './components/auth/registro/registro.component';
import { ProfileComponent } from './components/auth/profile/profile.component';
import { AdmEstadosComponent } from './components/admin/adm-estados/adm-estados.component';
import { AdmProductosComponent } from './components/admin/adm-productos/adm-productos.component';
import { AdmRolesComponent } from './components/admin/adm-roles/adm-roles.component';
import { AdmUsuariosComponent } from './components/admin/adm-usuarios/adm-usuarios.component';

const routes: Routes = [
  //Auth
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'recuperar', component: RecuperarComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'adm-estados', component: AdmEstadosComponent },
  { path: 'adm-productos', component: AdmProductosComponent },
  { path: 'adm-roles', component: AdmRolesComponent },
  { path: 'adm-usuarios', component: AdmUsuariosComponent },

  //Producto
  { path: 'productos', component: ProductosComponent,
  children: [
    { path: 'electrodomesticos', component: ElectrodomesticosComponent },
    { path: 'tecnologia', component: TecnologiaComponent },
  ],
  },
  { path: 'carrito', component: CarritoComponent,
    children: [
    { path: 'check-out', component: CheckOutComponent},
  ],},
  { path: 'inventory', component: InventoryComponent },
  { path: 'fail', component: FailComponent },
  { path: 'procesando', component: ProcesandoComponent },
  { path: 'success', component: SuccessComponent },

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
