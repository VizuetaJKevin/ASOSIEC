import { Component, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css'],
    standalone: false
})
export class ContactComponent implements AfterViewInit {
  @ViewChild('contactForm') contactForm!: NgForm;

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

  onSubmit() {
    if (this.contactForm.valid) {
      // Muestra loading
      Swal.fire({
        title: 'Enviando mensaje...',
        text: 'Por favor espera un momento',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Simula envío (en producción aquí iría la llamada al backend)
      setTimeout(() => {
        // Muestra el SweetAlert de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Mensaje enviado!',
          text: 'Gracias por contactarnos. Te responderemos pronto.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#2c5530',
          timer: 3000,
          timerProgressBar: true
        });

        // Resetea el formulario después de mostrar el SweetAlert
        this.contactForm.resetForm();
      }, 1500);
    } else {
      // Muestra error si el formulario no es válido
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444'
      });
    }
  }
}
