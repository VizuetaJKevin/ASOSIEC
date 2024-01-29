import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "src/environments/environment";
import { userCredential, userCredentialResponse } from '../interfaces/userCredential.interface';
import { Estado } from "../interfaces/estado.interface";
import { Rol } from "../interfaces/rol.interface";
import { Usuario } from "../interfaces/usuario.interface";

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private baseUrl: string = environment.api;
    private http = inject(HttpClient);
    private headers: HttpHeaders = new HttpHeaders();
    private setHeaders() {
        let token = localStorage.getItem('token')!;
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        })
        this.headers = headers;
    }
   public usuario:userCredentialResponse=JSON.parse(localStorage.getItem('user')!)==undefined?{id:0,nombre:'',rolid:0,statusok:false}:JSON.parse(localStorage.getItem('user')!);
    // Usuario
   Login(credenciales:userCredential):Observable<boolean>{
    this.setHeaders();
    return this.http.post<userCredentialResponse>(`${ this.baseUrl }login`,credenciales,{ headers:this.headers, responseType:'json' })
    .pipe(map((resp)=>{
        if (resp.statusok===true) {
            const user:userCredentialResponse=resp;
            localStorage.setItem('user',JSON.stringify(user));
            this.usuario=JSON.parse(localStorage.getItem('user')!);
        }
        return resp.statusok
    }))
   }

   Logout(){
    localStorage.clear();
    this.usuario={id:0,nombre:'',apellido:'',email:'',rolid:0,statusok:false};
   }



    VerifcaMail(mail:string):Observable<boolean>{
        this.setHeaders();
        return  this.http.get<boolean>(`${ this.baseUrl }Verificarmail/${mail}`,{ headers:this.headers, responseType:'json' })
    }
    Recuperarpsw(mail:string,psw:string):Observable<boolean>{
        this.setHeaders();
        return  this.http.put<boolean>(`${ this.baseUrl }recuperarpsw/${mail}/${psw}`,{ headers:this.headers, responseType:'json' })
    }
    // Usuario
    ConsultarUsuarios():Observable<Usuario[]>{
        this.setHeaders();
        return  this.http.get<Usuario[]>(`${ this.baseUrl }ConsultarUsuarios`,{ headers:this.headers, responseType:'json' })
    }
    RegistrarUsuario(Usuario:Usuario):Observable<boolean>{
        this.setHeaders();
        return  this.http.post<boolean>(`${ this.baseUrl }Resgitar_usuario`,Usuario,{ headers:this.headers, responseType:'json' })
    }
    ActualizarUsuario(Usuario:Usuario):Observable<boolean>{
        this.setHeaders();
        return  this.http.put<boolean>(`${ this.baseUrl }Actualizar_usuario`,Usuario,{ headers:this.headers, responseType:'json' })
    }
    EliminarUsuario(id:number):Observable<boolean>{
        this.setHeaders();
        return  this.http.delete<boolean>(`${ this.baseUrl }Eliminar_usuario/${id}`,{ headers:this.headers, responseType:'json' })
    }

    // Estado
    ConsultarEstados():Observable<Estado[]>{
        this.setHeaders();
        return  this.http.get<Estado[]>(`${ this.baseUrl }ConsultarEstados`,{ headers:this.headers, responseType:'json' })
    }
    RegistrarEstado(Estado:Estado):Observable<boolean>{
        this.setHeaders();
        return  this.http.post<boolean>(`${ this.baseUrl }Resgitar_estado`,Estado,{ headers:this.headers, responseType:'json' })
    }
    ActualizarEstado(Estado:Estado):Observable<boolean>{
        this.setHeaders();
        return  this.http.put<boolean>(`${ this.baseUrl }Actualizar_estado`,Estado,{ headers:this.headers, responseType:'json' })
    }
    EliminarEstado(id:number):Observable<boolean>{
        this.setHeaders();
        return  this.http.delete<boolean>(`${ this.baseUrl }Eliminar_estado/${id}`,{ headers:this.headers, responseType:'json' })
    }

     // Rol
    ConsultarRoles():Observable<Rol[]>{
        this.setHeaders();
        return this.http.get<Rol[]>(`${ this.baseUrl }ConsultarRoles`,{ headers:this.headers, responseType:'json' })
    }
    RegistrarRol(Rol:Rol):Observable<boolean>{
        this.setHeaders();
        return  this.http.post<boolean>(`${ this.baseUrl }Resgitar_rol`,Rol,{ headers:this.headers, responseType:'json' })
    }
    ActualizarRol(Rol:Usuario):Observable<boolean>{
        this.setHeaders();
        return  this.http.put<boolean>(`${ this.baseUrl }Actualizar_rol`,Rol,{ headers:this.headers, responseType:'json' })
    }
    EliminarRol(id:number):Observable<boolean>{
        this.setHeaders();
        return  this.http.delete<boolean>(`${ this.baseUrl }Eliminar_rol/${id}`,{ headers:this.headers, responseType:'json' })
    }
}
