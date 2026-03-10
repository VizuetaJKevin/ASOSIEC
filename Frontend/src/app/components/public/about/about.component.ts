import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css'],
    standalone: true,
    imports: [MatIconModule]
})
export class AboutComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() {
    // Inicialización del componente
  }

  ngAfterViewInit() {
    // Activar animaciones después de que la vista se haya inicializado
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  private checkScroll() {
    const scrollElements = document.querySelectorAll('.scroll-reveal');

    scrollElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;
      const windowHeight = window.innerHeight;

      // Elemento es visible si está dentro del viewport
      const isVisible = elementTop < windowHeight * 0.85 && elementBottom > 0;

      if (isVisible) {
        element.classList.add('visible');
      }
    });
  }

  // Smooth scroll al hacer clic en "Descubre nuestra historia"
  scrollToContent() {
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      statsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
