import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ApiService } from 'src/app/Services/Api.service';
import { LoginService } from 'src/app/Services/login.service';
import { Router } from '@angular/router';
import { userCredentialResponse } from 'src/app/interfaces/userCredential.interface';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  public totalItems:number=0;
    private service=inject(ApiService);
    private Login_Service=inject(LoginService);
    private cdRef=inject(ChangeDetectorRef);
    private _router=inject(Router);
    carritoService: any;
    constructor(){}

    get user():userCredentialResponse{
        return this.Login_Service.usuario;
    }
    get itemsTotal():number{
        return this.service.totalItems;
    }
    ngOnInit(): void {
        if (this.user.id!=0) {
            this.service.items();
        }
    }
    Logout(){
        this.Login_Service.Logout();
        this.service.items();
        this._router.navigateByUrl("login");
    }

}
