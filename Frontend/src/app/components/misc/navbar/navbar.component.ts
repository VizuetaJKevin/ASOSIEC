import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/Api.service';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { userCredentialResponse } from 'src/app/interfaces/userCredential.interface';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    standalone: false
})
export class NavbarComponent implements OnInit {

    public totalItems: number = 0;
    public comprobantesPendientes: number = 0;
    private service = inject(ApiService);
    private Login_Service = inject(LoginService);
    private cdRef = inject(ChangeDetectorRef);
    private _router = inject(Router);

    constructor() {}

    get user(): userCredentialResponse {
        return this.Login_Service.usuario;
    }

    get itemsTotal(): number {
        return this.service.totalItems;
    }

    ngOnInit(): void {
        if (this.user.id != 0) {
            this.service.items();
            // ✅ NUEVO: Cargar comprobantes pendientes si es admin
            if (this.user.rolid === 1) {
                this.cargarComprobantesPendientes();
            }
        }
    }

    /**
     * ✅ NUEVO: Cargar cantidad de comprobantes pendientes
     */
    cargarComprobantesPendientes() {
        this.service.ConsultarOrdenesConComprobantes().subscribe({
            next: (resp: any[]) => {
                // Filtrar solo los pendientes (no verificados y no rechazados)
                this.comprobantesPendientes = resp.filter(item => {
                    const orden = item.Orden || item.orden;
                    const comprobante = item.Comprobante || item.comprobante;
                    return orden?.estadoOrdenId !== 9 && !comprobante?.verificado;
                }).length;
                this.cdRef.detectChanges();
            },
            error: (err) => {
                console.error('Error al cargar comprobantes pendientes:', err);
                this.comprobantesPendientes = 0;
            }
        });
    }

    Logout() {
        this.Login_Service.Logout();
        this.service.items();
        this._router.navigateByUrl("login");
    }
}
