import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map, catchError, of } from "rxjs";
import { environment } from "src/environments/environment";
import { userCredential, userCredentialResponse } from '../interfaces/userCredential.interface';
import { Rol } from "../interfaces/rol.interface";
import { Usuario } from "../interfaces/usuario.interface";

// ============================================
// INTERFACES DE RESPUESTA
// ============================================
export interface LoginResponse {
    statusok: boolean;
    token?: string;
    usuario?: {
        id: number;
        nombre: string;
        apellido: string;
        email: string;
        rolid: number;
    };
    mensaje?: string;
    codigoError?: string;
}
// ============================================
// INTERFACES DE VENDEDOR (CORREGIDAS)
// ============================================
export interface Vendedor {
    id: number;
    usuarioId: number;
    estadoUsuarioId: number; // ✅ CORREGIDO: era estadoId
    nombre_comercial: string;
    descripcion: string;
    telefono: string;
    fecha_registro?: Date;
}

export interface VendedorCompleto extends Vendedor {
    nombre_usuario: string;
    apellido_usuario: string;
    email_usuario: string;
}

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private baseUrl: string = environment.api.baseUrl;
    private http = inject(HttpClient);
    private headers: HttpHeaders = new HttpHeaders();

    private setHeaders() {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        })
        this.headers = headers;
    }

    public usuario: userCredentialResponse = JSON.parse(localStorage.getItem('user')!) || {
        id: 0,
        nombre: '',
        apellido: '',
        email: '',
        rolid: 0,
        statusok: false
    };

    // ============================================
    // LOGIN Y AUTENTICACIÓN (✅ ACTUALIZADO)
    // ============================================
    Login(credenciales: userCredential): Observable<LoginResponse> {
        this.setHeaders();
        return this.http.post<LoginResponse>(`${this.baseUrl}login`, credenciales, {
            headers: this.headers,
            responseType: 'json'
        }).pipe(
            map((resp) => {
                if (resp.statusok === true) {
                    // ✅ Guardar el token JWT
                    if (resp.token) {
                        localStorage.setItem('jwt_token', resp.token);
                        console.log('🔑 Token JWT guardado');
                    }

                    // ✅ Guardar información del usuario
                    if (resp.usuario) {
                        const userData = {
                            id: resp.usuario.id,
                            nombre: resp.usuario.nombre,
                            apellido: resp.usuario.apellido,
                            email: resp.usuario.email,
                            rolid: resp.usuario.rolid,
                            statusok: true
                        };

                        localStorage.setItem('user', JSON.stringify(userData));
                        this.usuario = userData;

                        console.log('✅ Login exitoso:', userData.email);
                    }
                }
                // ✅ Retornar la respuesta completa (no solo boolean)
                return resp;
            }),
            catchError((error) => {
                console.error('❌ Error en login service:', error);
                // Retornar respuesta de error estructurada
                return of({
                    statusok: false,
                    mensaje: error.error?.mensaje || 'Error de conexión',
                    codigoError: error.error?.codigoError || 'ERROR_CONEXION'
                });
            })
        );
    }

    Logout() {
        console.log('👋 Cerrando sesión...');
        localStorage.removeItem('jwt_token');  // ✅ Eliminar token
        localStorage.removeItem('user');       // ✅ Eliminar usuario
        localStorage.clear();

        this.usuario = {
            id: 0,
            nombre: '',
            apellido: '',
            email: '',
            rolid: 0,
            statusok: false
        };
    }

    VerifcaMail(mail: string): Observable<boolean> {
        this.setHeaders();
        return this.http.get<boolean>(`${this.baseUrl}Verificarmail/${mail}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    Recuperarpsw(mail: string, psw: string): Observable<boolean> {
        this.setHeaders();
        return this.http.put<boolean>(`${this.baseUrl}recuperarpsw/${mail}/${psw}`, {}, {
            headers: this.headers,
            responseType: 'json'
        });
    }

     // PASO 1: Solicitar envío de código de 6 dígitos
  EnviarCodigoRecuperacion(email: string): Observable<any> {
    this.setHeaders();
    return this.http.post<any>(
      `${this.baseUrl}EnviarCodigoRecuperacion`,
      { email },
      { headers: this.headers }
    );
  }

  // PASO 2: Verificar que el código sea correcto
  VerificarCodigoRecuperacion(email: string, codigo: string): Observable<any> {
    this.setHeaders();
    return this.http.post<any>(
      `${this.baseUrl}VerificarCodigoRecuperacion`,
      { email, codigo },
      { headers: this.headers }
    );
  }

  // PASO 3: Cambiar contraseña una vez verificado el código
  CambiarPasswordConCodigo(email: string, codigo: string, nuevaPassword: string): Observable<any> {
    this.setHeaders();
    return this.http.post<any>(
      `${this.baseUrl}CambiarPasswordConCodigo`,
      { email, codigo, nuevaPassword },
      { headers: this.headers }
    );
  }
    // ============================================
    // GESTIÓN DE USUARIOS
    // ============================================
    ConsultarUsuarios(): Observable<Usuario[]> {
        this.setHeaders();
        return this.http.get<Usuario[]>(`${this.baseUrl}ConsultarUsuarios`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    RegistrarUsuario(Usuario: Usuario): Observable<any> {
        this.setHeaders();
        return this.http.post<any>(`${this.baseUrl}Registrar_usuario`, Usuario, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ActualizarUsuario(Usuario: Usuario): Observable<boolean> {
        this.setHeaders();
        return this.http.put<boolean>(`${this.baseUrl}Actualizar_usuario`, Usuario, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    EliminarUsuario(id: number): Observable<boolean> {
        this.setHeaders();
        return this.http.delete<boolean>(`${this.baseUrl}Eliminar_usuario/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    // ============================================
    // VENDEDORES - APROBACIÓN Y RECHAZO
    // ============================================
    ConsultarUsuariosPendientes(): Observable<Usuario[]> {
        this.setHeaders();
        return this.http.get<Usuario[]>(`${this.baseUrl}ConsultarUsuariosPendientes`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    AprobarUsuario(usuarioId: number, adminId: number): Observable<any> {
        this.setHeaders();
        const body = {
            UsuarioId: usuarioId,
            AdminId: adminId
        };
        return this.http.post<any>(`${this.baseUrl}AprobarUsuario`, body, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    RechazarUsuario(usuarioId: number, adminId: number, motivo: string = ''): Observable<any> {
        this.setHeaders();
        const body = {
            UsuarioId: usuarioId,
            AdminId: adminId,
            MotivoRechazo: motivo
        };
        return this.http.post<any>(`${this.baseUrl}RechazarUsuario`, body, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    // ============================================
    // GESTIÓN DE VENDEDORES
    // ============================================
    ConsultarVendedores(): Observable<VendedorCompleto[]> {
        this.setHeaders();
        return this.http.get<VendedorCompleto[]>(`${this.baseUrl}ConsultarVendedores`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ConsultarVendedor(id: number): Observable<VendedorCompleto> {
        this.setHeaders();
        return this.http.get<VendedorCompleto>(`${this.baseUrl}ConsultarVendedor/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ConsultarVendedorPorUsuario(usuarioId: number): Observable<Vendedor> {
        this.setHeaders();
        return this.http.get<Vendedor>(`${this.baseUrl}ConsultarVendedorPorUsuario/${usuarioId}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    RegistrarVendedor(vendedor: Vendedor): Observable<any> {
        this.setHeaders();
        return this.http.post<any>(`${this.baseUrl}RegistrarVendedor`, vendedor, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ActualizarVendedor(vendedor: Vendedor): Observable<any> {
        this.setHeaders();
        return this.http.put<any>(`${this.baseUrl}ActualizarVendedor`, vendedor, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    EliminarVendedor(id: number): Observable<any> {
        this.setHeaders();
        return this.http.delete<any>(`${this.baseUrl}EliminarVendedor/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    // ============================================
    // ROLES
    // ============================================
    ConsultarRoles(): Observable<Rol[]> {
        this.setHeaders();
        return this.http.get<Rol[]>(`${this.baseUrl}ConsultarRoles`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    RegistrarRol(Rol: Rol): Observable<boolean> {
        this.setHeaders();
        return this.http.post<boolean>(`${this.baseUrl}Registrar_rol`, Rol, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    ActualizarRol(Rol: Usuario): Observable<boolean> {
        this.setHeaders();
        return this.http.put<boolean>(`${this.baseUrl}Actualizar_rol`, Rol, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    EliminarRol(id: number): Observable<boolean> {
        this.setHeaders();
        return this.http.delete<boolean>(`${this.baseUrl}Eliminar_rol/${id}`, {
            headers: this.headers,
            responseType: 'json'
        });
    }

    // ============================================
    // HELPERS - VALIDACIÓN DE ROLES
    // ============================================
    esAdmin(): boolean {
        return this.usuario.rolid === 1;
    }

    esVendedor(): boolean {
        return this.usuario.rolid === 3;
    }

    esCliente(): boolean {
        return this.usuario.rolid === 2;
    }

    estaLogueado(): boolean {
        // Verificar que existe el token Y el usuario
        const token = localStorage.getItem('jwt_token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            return false;
        }

        return this.usuario.statusok && this.usuario.id > 0;
    }
}
