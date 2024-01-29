import { Component, OnInit, inject } from "@angular/core";
import { ApiService } from "src/app/Services/Api.service";
import { LoginService } from "src/app/Services/login.service";
import { Router } from "@angular/router";

@Component({
    selector:'shared-procesando',
    templateUrl:"./procesando.component.html",
    styleUrls:['./procesando.component.css']
})
export class ProcesandoComponent implements OnInit{

    private apiser=inject(ApiService);
    private _sso=inject(LoginService);
    private _router=inject(Router);

    ngOnInit(): void {
        if (this._sso.usuario.rolid===2 && localStorage.getItem('tokenOrden')!=null) {
            this.apiser.consultarOrdenToken(localStorage.getItem('tokenOrden')!).subscribe({
                next:(resp)=>{
                    this.apiser.Actualizar_ItemUserId(resp.usuarioId,resp.id).subscribe({
                        next:(actu)=>{
                            this.apiser.items();
                            localStorage.removeItem('tokenOrden');
                            this._router.navigateByUrl("success");
                        }
                    })

                }
            })
        }
    }

}
