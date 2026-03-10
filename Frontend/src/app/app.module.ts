//Angular
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyHttpInterceptor } from './components/misc/spinner/services/Interceptor.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ConfigService } from './services/config.service';
import { PasswordStrengthComponent } from './shared/password-strength/password-strength.component';
import { UploadService } from './services/upload.service';
import { PerfilService } from './services/perfil.service';



//Material Angular
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxSpinnerModule } from "ngx-spinner";
import { MatChip } from '@angular/material/chips';
//CHARTS
import { provideCharts, withDefaultRegisterables, BaseChartDirective } from 'ng2-charts';

//Componentes
import { AppComponent } from './app.component';
import { HomeComponent } from './components/public/home/home.component';
import { CarritoComponent } from './components/client/carrito/carrito.component';
import { FooterComponent } from './components/misc/footer/footer.component';
import { NavbarComponent } from './components/misc/navbar/navbar.component';
import { SpinnerComponent } from './components/misc/spinner/spinner.component';
import { ContactComponent } from './components/public/contact/contact.component';
import { HistorialComprasComponent } from './components/client/historial-compras/historial-compras.component';
import { ProductosComponent } from './components/client/productos/productos.component';
import { RecuperarComponent } from './components/auth/recuperar/recuperar.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegistroComponent } from './components/auth/registro/registro.component';
import { ProfileComponent } from './components/auth/profile/profile.component';
import { AdminEstadosComponent } from './components/admin/admin-estados/admin-estados.component';
import { AdminProductosComponent } from './components/admin/admin-productos/admin-productos.component';
import { AdminRolesComponent } from './components/admin/admin-roles/admin-roles.component';
import { AdminUsuariosComponent } from './components/admin/admin-usuarios/admin-usuarios.component';
import { CheckoutComponent } from './components/client/checkout/checkout.component';
import { AdminComprobantesComponent } from './components/admin/admin-comprobantes/admin-comprobantes.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminConfiguracionComponent } from './components/admin/admin-configuracion/admin-configuracion.component';
import { CountTipoPipe } from './components/admin/admin-configuracion/count-tipo.pipe';
import { CommonModule } from '@angular/common';
import { EstadosService } from './services/estados.service';
import { CatalogoProductosComponent } from './components/client/productos/catalogo-productos/catalogo-productos.component';
import { AdminAuditComponent } from './components/admin/admin-audit/admin-audit.component';
import { AdminDevolucionesComponent } from './components/admin/admin-devoluciones/admin-devoluciones.component';

//Productos
import { GuardsCheckEnd } from '@angular/router';

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
    HistorialComprasComponent,
    RecuperarComponent,
    RegistroComponent,
    ProfileComponent,
    AdminEstadosComponent,
    AdminProductosComponent,
    AdminRolesComponent,
    AdminUsuariosComponent,
    AdminAuditComponent,
    CheckoutComponent,
    AdminComprobantesComponent,
    AdminConfiguracionComponent,
    CatalogoProductosComponent,
    AdminDevolucionesComponent,
    PasswordStrengthComponent,

  ],
  exports: [
    SpinnerComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BaseChartDirective,
    AdminDashboardComponent,
    CommonModule,
    CountTipoPipe,
    MatChip,

    // Material Modules
    MatTableModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    MatExpansionModule,
    MatMenuModule,
    MatOptionModule,
    MatTabsModule,
    MatPaginatorModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    NgxSpinnerModule,



  ],
  providers: [

    { provide: HTTP_INTERCEPTORS, useClass: MyHttpInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    ConfigService,
    UploadService,
    PerfilService,

    EstadosService,
    provideHttpClient(withInterceptorsFromDi()),
    provideCharts(withDefaultRegisterables()),
  ]
})
export class AppModule { }
