import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  @ViewChild('contactForm') contactForm!: NgForm;

  onSubmit() {
    // Muestra el SweetAlert de éxito
    Swal.fire({
      icon: 'success',
      title: 'Mensaje enviado con éxito',
      showConfirmButton: false,
      timer: 1500
    });

    // Resetea el formulario después de mostrar el SweetAlert
    setTimeout(() => {
      this.contactForm.resetForm();
    }, 1500);
  }
}
