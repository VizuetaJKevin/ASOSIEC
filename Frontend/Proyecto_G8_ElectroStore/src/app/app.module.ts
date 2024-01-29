//Angular
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyHttpInterceptor } from './components/misc/spinner/services/Interceptor.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FilterByNamePipe } from './components/client/productos/filterbyname.pipe';

//Material
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatOptionModule } from '@angular/material/core';
import {MatTabsModule} from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';

//Componentes
import { AppComponent } from './app.component';
import { HomeComponent } from './components/public/home/home.component';
import { CarritoComponent } from './components/client/carrito/carrito.component';
import { CheckOutComponent } from './components/client/carrito/check-out/check-out.component';
import { FooterComponent } from './components/misc/footer/footer.component';
import { NavbarComponent } from './components/misc/navbar/navbar.component';
import { SpinnerComponent } from './components/misc/spinner/spinner.component';
import { ContactComponent } from './components/public/contact/contact.component';
import { ElectrodomesticosComponent } from './components/client/productos/electrodomesticos/electrodomesticos.component';
import { TecnologiaComponent } from './components/client/productos/tecnologia/tecnologia.component';
import { InventoryComponent } from './components/client/inventory/inventory.component';
import { ProductosComponent } from './components/client/productos/productos.component';
import { FailComponent } from './components/shared/fail/fail.component';
import { ProcesandoComponent } from './components/shared/procesando/procesando.component';
import { SuccessComponent } from './components/shared/success/success.component';
import { RecuperarComponent } from './components/auth/recuperar/recuperar.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegistroComponent } from './components/auth/registro/registro.component';
import { ProfileComponent } from './components/auth/profile/profile.component';
import { AdmEstadosComponent } from './components/admin/adm-estados/adm-estados.component';
import { AdmProductosComponent } from './components/admin/adm-productos/adm-productos.component';
import { AdmRolesComponent } from './components/admin/adm-roles/adm-roles.component';
import { AdmUsuariosComponent } from './components/admin/adm-usuarios/adm-usuarios.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProductosComponent,
    CarritoComponent,
    FooterComponent,
    NavbarComponent,
    SpinnerComponent,
    LoginComponent,
    ContactComponent,
    ElectrodomesticosComponent,
    TecnologiaComponent,
    InventoryComponent,
    CheckOutComponent,
    FailComponent,
    ProcesandoComponent,
    SuccessComponent,
    RecuperarComponent,
    RegistroComponent,
    ProfileComponent,
    AdmEstadosComponent,
    AdmProductosComponent,
    AdmRolesComponent,
    AdmUsuariosComponent,
    FilterByNamePipe

  ],
  imports: [
    BrowserModule,
    MatTableModule,
    FormsModule,
    MatFormFieldModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    HttpClientModule,
    MatExpansionModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatTabsModule,
    MatPaginatorModule

  ],
  exports:[
    SpinnerComponent,
  ],

  providers: [ {provide: HTTP_INTERCEPTORS,useClass: MyHttpInterceptor,multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
