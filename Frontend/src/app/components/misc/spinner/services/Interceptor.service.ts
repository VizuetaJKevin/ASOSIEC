import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable, inject } from '@angular/core';
import { Observable, finalize } from "rxjs";
import { SpinnerService } from "./spinner.service";

@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {

  private _se=inject(SpinnerService);
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._se.activate.emit(true);
    return next.handle(request).pipe(
      finalize(() => {
        this._se.activate.emit(false);
      })
    );
  }

}
