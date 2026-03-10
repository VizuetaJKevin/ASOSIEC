import { SpinnerService } from './components/misc/spinner/services/spinner.service';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'ASOSIEC';
  mostrarFooter = true;

  private service = inject(SpinnerService);
  private cdRef = inject(ChangeDetectorRef);
  private router = inject(Router);

  isLoading!: boolean;

  private rutasAdmin = ['/adm-', '/carrito', '/checkout', '/profile', '/historial-compras'];

  constructor() {
    this.service.activate.subscribe((reps: boolean) => {
      this.isLoading = reps;
      this.cdRef.detectChanges();
    });
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.mostrarFooter = !this.rutasAdmin.some(ruta =>
        event.urlAfterRedirects.startsWith(ruta)
      );
    });
  }
}
