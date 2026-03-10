import { Component, OnInit, inject, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/Api.service';
import { LoginService } from 'src/app/services/login.service';
import { PerfilService } from 'src/app/services/perfil.service';
import { UploadService } from 'src/app/services/upload.service';
import { userCredentialResponse } from 'src/app/interfaces/userCredential.interface';
import { carrito } from 'src/app/interfaces/carrito';
import Swal from 'sweetalert2';
import moment from 'moment';

declare var bootstrap: any;

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css'],
    standalone: false
})
export class CheckoutComponent implements OnInit {

  private _Api_service = inject(ApiService);
  private Login_Service = inject(LoginService);
  private _perfilService = inject(PerfilService);
  private _fb = inject(FormBuilder);
  private _uploadService = inject(UploadService);

  @Input() productosCarrito: carrito[] = [];
  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;

  envio: number = 3;
  pasoActual: number = 1;
  tokenOrden: string = '';
  ordenIdGenerada: number = 0;
  datosBancarios: any[] = [];
  isLoading: boolean = false;

  // Manejo de comprobantes
  comprobanteSeleccionado: File | null = null;
  previsualizacionComprobante: string | null = null;
  subiendoComprobante: boolean = false;

  formulario: FormGroup = this._fb.group({
    id: [0, [Validators.required]],
    estadoOrdenId: [2, [Validators.required]],
    usuarioId: [this.user.id, [Validators.required]],
    companiaId: [1, [Validators.required]],
    nombre: [this.user.nombre, [Validators.required]],
    apellido: [this.user.apellido, [Validators.required]],
    email: [this.user.email, [Validators.required, Validators.email]],
    costo_envio: [this.envio, [Validators.required]],
    total: [0, [Validators.required]],
    token_orden: [''],
    direccion_1: ['', [Validators.required]],
    direccion_2: [''],
    fecha: [''],
  });

  formularioComprobante: FormGroup = this._fb.group({
    ordenId: [0, [Validators.required]],
    url_comprobante: [''],
    numero_referencia: ['', [Validators.required]],
    direccion_entrega: ['', [Validators.required]],
    telefono_contacto: ['', [Validators.required]],
    observaciones: ['']
  });

  get user(): userCredentialResponse {
    return this.Login_Service.usuario;
  }

  get total(): number {
    return this.productosCarrito.reduce((sum, item) => {
      const precio = Number(item.precio) || Number(item.precio_ahora) || 0;
      const cantidad = item.Entidad_Item?.cantidad || 0;
      return sum + (precio * cantidad);
    }, 0);
  }

  ngOnInit(): void {
    this.cargarDatosBancarios();
    this.autocompletarDatosUsuario();
  }

  /** Abre el selector de archivo desde el botón de la zona de upload */
  triggerFileInput(): void {
    if (this.fileInputRef && !this.subiendoComprobante) {
      this.fileInputRef.nativeElement.click();
    }
  }

  autocompletarDatosUsuario(): void {
    if (this.user.id !== 0) {
      this._perfilService.obtenerPerfil(this.user.id).subscribe({
        next: (perfil) => {
          if (perfil.direccion) {
            this.formulario.patchValue({ direccion_1: perfil.direccion });
          }
          if (perfil.telefono) {
            this.formularioComprobante.patchValue({ telefono_contacto: perfil.telefono });
          }
          if (perfil.direccion && perfil.telefono) {
            Swal.fire({
              icon: 'info',
              title: 'Datos autocompletados',
              text: 'Hemos completado tu dirección y teléfono desde tu perfil',
              confirmButtonColor: '#BF9B6F',
              timer: 3000,
              toast: true,
              position: 'top-end',
              showConfirmButton: false
            });
          }
        },
        error: (err) => console.error('❌ Error al cargar datos del perfil:', err)
      });
    }
  }

  cargarDatosBancarios() {
    this.isLoading = true;
    this._Api_service.ConsultarDatosBancariosActivos().subscribe({
      next: (resp) => {
        this.datosBancarios = resp;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar datos bancarios:', err);
        this.isLoading = false;
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los datos bancarios' });
      }
    });
  }

  abrir(productos: carrito[]) {
    this.productosCarrito = productos;
    this.pasoActual = 1;
    this.comprobanteSeleccionado = null;
    this.previsualizacionComprobante = null;
    this.autocompletarDatosUsuario();
    const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    modal.show();
  }

  siguientePaso() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      Swal.fire({ icon: 'error', title: 'Datos incompletos', text: 'Por favor completa todos los campos requeridos.' });
      return;
    }

    this.isLoading = true;
    moment.locale('es');
    const fecha = moment().format('YYYY-MM-DDTHH:mm:ss');
    this.formulario.get('fecha')?.setValue(fecha);

    this.tokenOrden = this.generateToken(this.formulario.value.email);
    this.formulario.get('token_orden')?.setValue(this.tokenOrden);

    const totalConEnvio = this.total + this.envio;
    this.formulario.get('total')?.setValue(totalConEnvio);
    this.formulario.get('estadoOrdenId')?.setValue(2);

    this._Api_service.RegistrarOrden(this.formulario.value).subscribe({
      next: (resp) => {
        this._Api_service.consultarOrdenToken(this.tokenOrden).subscribe({
          next: (orden) => {
            this.ordenIdGenerada = orden.id;
            this.formularioComprobante.get('ordenId')?.setValue(this.ordenIdGenerada);
            const dir1 = this.formulario.value.direccion_1 || '';
            const dir2 = this.formulario.value.direccion_2 || '';
            this.formularioComprobante.get('direccion_entrega')?.setValue(dir2 ? `${dir1}, ${dir2}` : dir1);
            this.pasoActual = 2;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('❌ Error consultando orden:', err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo obtener la orden creada' });
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error registrando orden:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar la orden' });
        this.isLoading = false;
      }
    });
  }

  pasoAnterior() {
    if (this.pasoActual > 1) this.pasoActual--;
  }

  onComprobanteSeleccionado(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const validation = this._uploadService.validateImageFile(file);
    if (!validation.valid) {
      Swal.fire({ icon: 'error', title: 'Archivo no válido', text: validation.error });
      event.target.value = '';
      return;
    }

    this.comprobanteSeleccionado = file;
    const reader = new FileReader();
    reader.onload = (e: any) => { this.previsualizacionComprobante = e.target.result; };
    reader.readAsDataURL(file);
  }

  limpiarComprobante() {
    this.comprobanteSeleccionado = null;
    this.previsualizacionComprobante = null;
    if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
  }

  async finalizarCompra() {
    if (this.formularioComprobante.invalid) {
      this.formularioComprobante.markAllAsTouched();
      Swal.fire({ icon: 'error', title: 'Datos incompletos', text: 'Por favor completa todos los campos del comprobante.' });
      return;
    }
    if (!this.comprobanteSeleccionado) {
      Swal.fire({ icon: 'error', title: 'Comprobante requerido', text: 'Por favor selecciona una imagen del comprobante de pago.' });
      return;
    }

    this.isLoading = true;
    this.subiendoComprobante = true;

    try {
      const uploadResponse = await this._uploadService.uploadComprobante(this.comprobanteSeleccionado).toPromise();

      if (!uploadResponse || !uploadResponse.success || !uploadResponse.url) {
        throw new Error('No se pudo obtener la URL del comprobante');
      }

      const comprobanteData = {
        ordenId: this.formularioComprobante.value.ordenId,
        url_comprobante: uploadResponse.url,
        numero_referencia: this.formularioComprobante.value.numero_referencia,
        direccion_entrega: this.formularioComprobante.value.direccion_entrega,
        telefono_contacto: this.formularioComprobante.value.telefono_contacto,
        observaciones: this.formularioComprobante.value.observaciones || ''
      };

      this._Api_service.RegistrarComprobante(comprobanteData).subscribe({
        next: (resp) => {
          this._Api_service.Actualizar_ItemUserId(this.user.id, this.ordenIdGenerada).subscribe({
            next: () => {
              this.pasoActual = 3;
              this.isLoading = false;
              this.subiendoComprobante = false;
            },
            error: (err) => {
              console.error('❌ Error actualizando items:', err);
              this.isLoading = false;
              this.subiendoComprobante = false;
              this.pasoActual = 3;
            }
          });
        },
        error: (err) => {
          console.error('❌ Error registrando comprobante:', err);
          this.isLoading = false;
          this.subiendoComprobante = false;
          Swal.fire({
            icon: 'error', title: 'Error al Finalizar Compra',
            html: '<p>No se pudo registrar el comprobante.</p><p>Por favor, intenta nuevamente o contacta con soporte.</p>',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    } catch (error: any) {
      console.error('❌ Error al subir comprobante:', error);
      this.isLoading = false;
      this.subiendoComprobante = false;
      Swal.fire({
        icon: 'error', title: 'Error al Subir Comprobante',
        text: error.message || 'No se pudo subir el comprobante. Intenta nuevamente.',
        confirmButtonColor: '#dc3545'
      });
    }
  }

  cerrarYVolverInicio() {
    const modalElement = document.getElementById('checkoutModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
    window.location.href = '/';
  }

  private generateToken(email: string): string {
    const chars = '0123456789';
    const randomValues = new Uint32Array(15);
    window.crypto.getRandomValues(randomValues);
    let transactionId = '';
    for (let i = 0; i < randomValues.length; i++) {
      transactionId += chars.charAt(randomValues[i] % chars.length);
    }
    return transactionId;
  }
}
