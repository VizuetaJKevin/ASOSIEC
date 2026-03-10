import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('jwt_token');

    // Si existe el token, agregarlo a los headers
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Manejar la petición y capturar errores
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        
        // Si el error es 401 (No autorizado), redirigir al login
        if (error.status === 401) {
          console.log('🚫 Token inválido o expirado - Redirigiendo al login');
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        }

        // Si el error es 403 (Prohibido), mostrar mensaje
        if (error.status === 403) {
          console.log('🚫 Acceso prohibido - No tienes permisos');
          // Aquí podrías mostrar un mensaje al usuario
        }

        return throwError(() => error);
      })
    );
  }
}
