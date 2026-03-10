import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { EstadoUsuario } from "src/app/interfaces/estado-usuario.interface";
import { Rol } from "src/app/interfaces/rol.interface";
import { Usuario } from "src/app/interfaces/usuario.interface";
import { LoginService } from "src/app/services/login.service";
import { EstadosService } from "src/app/services/estados.service";
import { UploadService } from "src/app/services/upload.service";
import { PerfilService } from "src/app/services/perfil.service";
import Swal from "sweetalert2";


@Component({
    selector: 'app-admin-usuarios',
    templateUrl: './admin-usuarios.component.html',
    styleUrls: ['./admin-usuarios.component.css'],
    standalone: false
})
export class AdminUsuariosComponent implements OnInit {

  private _Sso = inject(LoginService);
  private _fb = inject(FormBuilder);
  private _estadosService = inject(EstadosService);
  private _uploadService = inject(UploadService);
  private _perfilService = inject(PerfilService);


  public ListaEstadosUsuario: EstadoUsuario[] = [];
  public ListaRoles: Rol[] = [];
  public ListaUsuarios: Usuario[] = [];
  public UsuariosPendientes: Usuario[] = [];
  public cargandoPendientes: boolean = false;
  public cargando: boolean = false;

  // ===== CONTROL DE MODALES =====
  public mostrarModalEditar: boolean = false;
  public mostrarModalAgregar: boolean = false;
  public formularioEdicion: FormGroup;
  public cargandoImagen: boolean = false;

  // ===== BÚSQUEDA POR TAB =====
  public searchTermPendientes: string = '';
  public searchTermAdmins: string = '';
  public searchTermVendedores: string = '';
  public searchTermClientes: string = '';

  // ===== PAGINACIÓN PARA TODAS LAS SECCIONES =====
  public opcionesPaginacion: number[] = [5, 10, 25, 50];

  // Paginación Administradores
  public paginaActualAdmins: number = 0;
  public adminsPorPagina: number = 10;

  // Paginación Vendedores
  public paginaActualVendedores: number = 0;
  public vendedoresPorPagina: number = 10;

  // Paginación Clientes
  public paginaActualClientes: number = 0;
  public clientesPorPagina: number = 10;

formulario: FormGroup = this._fb.group({
  estadoUsuarioId: [1],
  rolId: [2],
  nombre: ['', [Validators.required]],
  apellido: [''],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required]],
  maxintentos: [4],
  intentosfallidos: [0],
  telefono: [''],
  fotoPerfil: [''],
  twitter: [''],
  instagram: [''],
  facebook: ['']
  });

  constructor() {
    this.formularioEdicion = this._fb.group({
  id: [0],
  estadoUsuarioId: [1, Validators.required],
  rolId: [2, Validators.required],
  nombre: ['', Validators.required],
  apellido: [''],
  email: ['', [Validators.required, Validators.email]],
  password: ['', Validators.required],
  maxintentos: [4],
  intentosfallidos: [0],
  telefono: [''],
  fotoPerfil: [''],
  twitter: [''],
  instagram: [''],
  facebook: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarVendedoresPendientes();
  }

  // ========================================
  // PROPIEDADES COMPUTADAS PARA STATS
  // ========================================
  get totalUsuarios(): number {
    return this.ListaUsuarios.length;
  }

  get totalAdministradores(): number {
    return this.ListaUsuarios.filter(u => u.rolId === 1).length;
  }

  get totalVendedores(): number {
    // ✅ CORREGIDO: Vendedor = rolId 3
    return this.ListaUsuarios.filter(u => u.rolId === 3).length;
  }

  get totalClientes(): number {
    // ✅ CORREGIDO: Cliente = rolId 2
    return this.ListaUsuarios.filter(u => u.rolId === 2).length;
  }

  get totalPendientes(): number {
    return this.UsuariosPendientes.length;
  }

  // ========================================
  // FILTROS POR ROL
  // ========================================
  get usuariosFiltradosPendientes(): Usuario[] {
    return this.UsuariosPendientes.filter(u =>
      this.filtrarPorNombre(u, this.searchTermPendientes)
    );
  }

  get administradores(): Usuario[] {
    return this.ListaUsuarios
      .filter(u => u.rolId === 1)
      .filter(u => this.filtrarPorNombre(u, this.searchTermAdmins));
  }

  get administradoresPaginados(): Usuario[] {
    const inicio = this.paginaActualAdmins * this.adminsPorPagina;
    const fin = inicio + this.adminsPorPagina;
    return this.administradores.slice(inicio, fin);
  }

  get totalPaginasAdmins(): number {
    return Math.ceil(this.administradores.length / this.adminsPorPagina);
  }

  get infoPaginacionAdmins(): string {
    const total = this.administradores.length;
    if (total === 0) return 'No hay registros';
    const inicio = this.paginaActualAdmins * this.adminsPorPagina + 1;
    const fin = Math.min((this.paginaActualAdmins + 1) * this.adminsPorPagina, total);
    return `Mostrando ${inicio} - ${fin} de ${total} administradores`;
  }

  get vendedores(): Usuario[] {
    // ✅ CORREGIDO: Vendedor = rolId 3
    return this.ListaUsuarios
      .filter(u => u.rolId === 3)
      .filter(u => this.filtrarPorNombre(u, this.searchTermVendedores));
  }

  get vendedoresPaginados(): Usuario[] {
    const inicio = this.paginaActualVendedores * this.vendedoresPorPagina;
    const fin = inicio + this.vendedoresPorPagina;
    return this.vendedores.slice(inicio, fin);
  }

  get totalPaginasVendedores(): number {
    return Math.ceil(this.vendedores.length / this.vendedoresPorPagina);
  }

  get infoPaginacionVendedores(): string {
    const total = this.vendedores.length;
    if (total === 0) return 'No hay registros';
    const inicio = this.paginaActualVendedores * this.vendedoresPorPagina + 1;
    const fin = Math.min((this.paginaActualVendedores + 1) * this.vendedoresPorPagina, total);
    return `Mostrando ${inicio} - ${fin} de ${total} vendedores`;
  }

  get clientes(): Usuario[] {
    // ✅ CORREGIDO: Cliente = rolId 2
    const filtered = this.ListaUsuarios
      .filter(u => u.rolId === 2)
      .filter(u => this.filtrarPorNombre(u, this.searchTermClientes));

    return filtered;
  }

  get clientesPaginados(): Usuario[] {
    const inicio = this.paginaActualClientes * this.clientesPorPagina;
    const fin = inicio + this.clientesPorPagina;
    return this.clientes.slice(inicio, fin);
  }

  get totalPaginasClientes(): number {
    return Math.ceil(this.clientes.length / this.clientesPorPagina);
  }

  get infoPaginacion(): string {
    const total = this.clientes.length;
    if (total === 0) return 'No hay registros';
    const inicio = this.paginaActualClientes * this.clientesPorPagina + 1;
    const fin = Math.min((this.paginaActualClientes + 1) * this.clientesPorPagina, total);
    return `Mostrando ${inicio} - ${fin} de ${total} clientes`;
  }

  // ========================================
  // MÉTODO DE BÚSQUEDA
  // ========================================
  private filtrarPorNombre(usuario: Usuario, searchTerm: string): boolean {
    if (!searchTerm.trim()) {
      return true;
    }
    const term = searchTerm.toLowerCase();
    const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
    const email = usuario.email.toLowerCase();

    return nombreCompleto.includes(term) || email.includes(term);
  }

  // ========================================
  // PAGINACIÓN - ADMINISTRADORES
  // ========================================
  irAPaginaAdmins(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginasAdmins) {
      this.paginaActualAdmins = pagina;
    }
  }

  cambiarAdminsPorPagina(cantidad: number): void {
    this.adminsPorPagina = cantidad;
    this.paginaActualAdmins = 0;
  }

  obtenerPaginasVisiblesAdmins(): number[] {
    const total = this.totalPaginasAdmins;
    const actual = this.paginaActualAdmins;
    const visibles: number[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) {
        visibles.push(i);
      }
    } else {
      visibles.push(0);
      if (actual > 3) {
        visibles.push(-1);
      }
      const inicio = Math.max(1, actual - 1);
      const fin = Math.min(total - 2, actual + 1);
      for (let i = inicio; i <= fin; i++) {
        visibles.push(i);
      }
      if (actual < total - 4) {
        visibles.push(-1);
      }
      visibles.push(total - 1);
    }
    return visibles;
  }

  // ========================================
  // PAGINACIÓN - VENDEDORES
  // ========================================
  irAPaginaVendedores(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginasVendedores) {
      this.paginaActualVendedores = pagina;
    }
  }

  cambiarVendedoresPorPagina(cantidad: number): void {
    this.vendedoresPorPagina = cantidad;
    this.paginaActualVendedores = 0;
  }

  obtenerPaginasVisiblesVendedores(): number[] {
    const total = this.totalPaginasVendedores;
    const actual = this.paginaActualVendedores;
    const visibles: number[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) {
        visibles.push(i);
      }
    } else {
      visibles.push(0);
      if (actual > 3) {
        visibles.push(-1);
      }
      const inicio = Math.max(1, actual - 1);
      const fin = Math.min(total - 2, actual + 1);
      for (let i = inicio; i <= fin; i++) {
        visibles.push(i);
      }
      if (actual < total - 4) {
        visibles.push(-1);
      }
      visibles.push(total - 1);
    }
    return visibles;
  }

  // ========================================
  // PAGINACIÓN - CLIENTES
  // ========================================
  irAPaginaClientes(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginasClientes) {
      this.paginaActualClientes = pagina;
    }
  }

  cambiarClientesPorPagina(cantidad: number): void {
    this.clientesPorPagina = cantidad;
    this.paginaActualClientes = 0; // Resetear a primera página
  }

  obtenerPaginasVisiblesClientes(): number[] {
    const total = this.totalPaginasClientes;
    const actual = this.paginaActualClientes;
    const visibles: number[] = [];

    if (total <= 7) {
      // Mostrar todas las páginas si son 7 o menos
      for (let i = 0; i < total; i++) {
        visibles.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      visibles.push(0); // Primera página siempre

      if (actual > 3) {
        visibles.push(-1); // Elipsis
      }

      const inicio = Math.max(1, actual - 1);
      const fin = Math.min(total - 2, actual + 1);

      for (let i = inicio; i <= fin; i++) {
        visibles.push(i);
      }

      if (actual < total - 4) {
        visibles.push(-1); // Elipsis
      }

      visibles.push(total - 1); // Última página siempre
    }

    return visibles;
  }

  // ========================================
  // CARGAR DATOS
  // ========================================
  cargarDatos() {
    this.cargando = true;
    this._Sso.ConsultarUsuarios().subscribe({
      next: (resp) => {
        this.ListaUsuarios = resp;
        console.log('📊 Usuarios cargados:', resp);
        console.log('   - Admins (rolId=1):', resp.filter(u => u.rolId === 1).length);
        console.log('   - Clientes (rolId=2):', resp.filter(u => u.rolId === 2).length);
        console.log('   - Vendedores (rolId=3):', resp.filter(u => u.rolId === 3).length);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.cargando = false;
      }
    });

    this._estadosService.ConsultarEstadosUsuario().subscribe(resp => {
      this.ListaEstadosUsuario = resp.filter(e => e.activo === true);
    });

    this._Sso.ConsultarRoles().subscribe(resp => {
      this.ListaRoles = resp;
      console.log('📋 Roles disponibles:', resp);
    });
  }

  cargarVendedoresPendientes() {
    this.cargandoPendientes = true;
    this._Sso.ConsultarUsuariosPendientes().subscribe({
      next: (resp) => {
        this.UsuariosPendientes = resp;
        console.log('⏳ Vendedores pendientes:', resp.length);
        this.cargandoPendientes = false;
      },
      error: (err) => {
        console.error('Error al cargar pendientes:', err);
        this.cargandoPendientes = false;
      }
    });
  }

  // ========================================
  // APROBAR/RECHAZAR VENDEDOR
  // ========================================
  aprobarVendedor(usuario: Usuario) {
    Swal.fire({
      title: '¿Aprobar este vendedor?',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p><strong>Nombre:</strong> ${usuario.nombre} ${usuario.apellido}</p>
          <p><strong>Email:</strong> ${usuario.email}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      confirmButtonText: '✅ Aprobar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const adminId = this._Sso.usuario.id;

        this._Sso.AprobarUsuario(usuario.id, adminId).subscribe({
          next: (resp) => {
            Swal.fire({
              icon: 'success',
              title: '¡Vendedor Aprobado!',
              html: `
                <p>El usuario <strong>${usuario.nombre}</strong> ha sido aprobado.</p>
                <p>Se le ha enviado un email de confirmación.</p>
              `,
              confirmButtonColor: '#667eea'
            });

            this.cargarVendedoresPendientes();
            this.cargarDatos();
          },
          error: (err) => {
            console.error('Error al aprobar:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo aprobar el vendedor. Intenta nuevamente.',
              confirmButtonColor: '#667eea'
            });
          }
        });
      }
    });
  }

  rechazarVendedor(usuario: Usuario) {
    Swal.fire({
      title: '¿Rechazar este vendedor?',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p><strong>Nombre:</strong> ${usuario.nombre} ${usuario.apellido}</p>
          <p><strong>Email:</strong> ${usuario.email}</p>
        </div>
        <textarea
          id="motivoRechazo"
          class="swal2-input"
          placeholder="Motivo del rechazo (opcional)"
          style="width: 85%; height: 100px; margin-top: 15px;">
        </textarea>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#667eea',
      confirmButtonText: '❌ Rechazar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const textarea = document.getElementById('motivoRechazo') as HTMLTextAreaElement;
        return textarea ? textarea.value : '';
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const adminId = this._Sso.usuario.id;
        const motivo = result.value || '';

        this._Sso.RechazarUsuario(usuario.id, adminId, motivo).subscribe({
          next: (resp) => {
            Swal.fire({
              icon: 'info',
              title: 'Vendedor Rechazado',
              text: 'Se le ha notificado al usuario por email.',
              confirmButtonColor: '#667eea'
            });

            this.cargarVendedoresPendientes();
            this.cargarDatos();
          },
          error: (err) => {
            console.error('Error al rechazar:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo rechazar el vendedor. Intenta nuevamente.',
              confirmButtonColor: '#667eea'
            });
          }
        });
      }
    });
  }

  // ========================================
  // MODAL AGREGAR
  // ========================================
  abrirModalAgregar() {
    this.formulario.reset({
      estadoUsuarioId: 1,
      rolId: 2,  // ✅ Por defecto Cliente = 2
      maxintentos: 4,
      intentosfallidos: 0
    });
    this.mostrarModalAgregar = true;
  }

  // ========================================
  // REGISTRAR USUARIO
  // ========================================
  registrar() {
    if (this.formulario.invalid) {
      Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const usuarioData = {
      ...this.formulario.value,
      estadoUsuarioId: 1,
      rolId: Number(this.formulario.value.rolId),
      maxintentos: Number(this.formulario.value.maxintentos),
      intentosfallidos: Number(this.formulario.value.intentosfallidos)
    };

    console.log('📤 Registrando usuario:', usuarioData);

    this._Sso.RegistrarUsuario(usuarioData).subscribe({
      next: (resp) => {
        Swal.fire('¡Registrado!', resp.mensaje || 'Usuario creado correctamente', 'success');
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (err) => {
        console.error('❌ Error al registrar:', err);
        Swal.fire('Error', 'No se pudo crear el usuario', 'error');
      }
    });
  }

  // ========================================
  // MODAL EDITAR
  // ========================================
abrirModalEditar(usuario: Usuario) {
  this.formularioEdicion.patchValue({
    id: usuario.id,
    estadoUsuarioId: usuario.estadoUsuarioId,
    rolId: usuario.rolId,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    password: usuario.password,
    maxintentos: usuario.maxintentos || 4,
    intentosfallidos: usuario.intentosfallidos || 0,
    telefono: usuario.telefono || '',
    fotoPerfil: usuario.fotoPerfil || '',
    twitter: usuario.twitter || '',
    instagram: usuario.instagram || '',
    facebook: usuario.facebook || ''
    });

    console.log('✏️ Editando usuario:', usuario);

    this.mostrarModalEditar = true;
  }

  // ========================================
  // CERRAR MODAL
  // ========================================
  cerrarModal() {
    this.mostrarModalEditar = false;
    this.mostrarModalAgregar = false;
    this.formulario.reset({
      estadoUsuarioId: 1,
      rolId: 2,
      maxintentos: 4,
      intentosfallidos: 0
    });
    this.formularioEdicion.reset();
  }

  // ========================================
  // ACTUALIZAR USUARIO
  // ========================================
  actualizarUsuario() {
    if (this.formularioEdicion.invalid) {
      Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const usuarioActualizado = {
      ...this.formularioEdicion.value,
      rolId: Number(this.formularioEdicion.value.rolId),
      estadoUsuarioId: Number(this.formularioEdicion.value.estadoUsuarioId),
      maxintentos: Number(this.formularioEdicion.value.maxintentos),
      intentosfallidos: Number(this.formularioEdicion.value.intentosfallidos)
    };

    console.log('📝 Actualizando usuario:', usuarioActualizado);

    this._Sso.ActualizarUsuario(usuarioActualizado).subscribe({
      next: (resp) => {
        Swal.fire({
          title: '¡Actualizado!',
          text: 'El usuario ha sido actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#667eea'
        });
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (err) => {
        console.error('❌ Error al actualizar:', err);
        Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
      }
    });
  }

  // ========================================
  // ELIMINAR USUARIO
  // ========================================
  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._Sso.EliminarUsuario(id).subscribe({
          next: (resp) => {
            Swal.fire('Eliminado!', '', 'success');
            this.cargarDatos();
          }
        });
      }
    });
  }

  // ========================================
  // HELPERS
  // ========================================
  obtenerNombreRol(rolId: number): string {
    const rol = this.ListaRoles.find(role => role.id === rolId);
    return rol ? rol.descripcion : 'Desconocido';
  }

  obtenerNombreEstado(estadoUsuarioId: number): string {
    const estado = this.ListaEstadosUsuario.find(est => est.id === estadoUsuarioId);
    return estado ? estado.descripcion : 'Desconocido';
  }

  editar(usuario: Usuario) {
    this.abrirModalEditar(usuario);
  }

  // ========================================
  // SUBIDA DE FOTO DE PERFIL
  // ========================================
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar archivo
      const validation = this._uploadService.validateImageFile(file);
      if (!validation.valid) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo inválido',
          text: validation.error,
          confirmButtonColor: '#667eea'
        });
        return;
      }
      this.subirFoto(file);
    }
  }

  subirFoto(file: File): void {
    this.cargandoImagen = true;

    // ✅ Usar el método específico para fotos de perfil (asosiec/perfil en Cloudinary)
    this._uploadService.uploadProfileImage(file).subscribe({
      next: (resp: any) => {
        if (resp.success && resp.url) {
          const fotoUrl = resp.url;
          this.formularioEdicion.patchValue({ fotoPerfil: fotoUrl });

          Swal.fire({
            icon: 'success',
            title: 'Foto actualizada',
            text: 'La foto de perfil ha sido cargada correctamente',
            confirmButtonColor: '#667eea',
            timer: 2000
          });
          this.cargandoImagen = false;
        } else {
          this.cargandoImagen = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo subir la imagen',
            confirmButtonColor: '#667eea'
          });
        }
      },
      error: (err) => {
        console.error('❌ Error al subir foto:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo subir la foto de perfil',
          confirmButtonColor: '#667eea'
        });
        this.cargandoImagen = false;
      }
    });
  }

  get fotoPerfilActual(): string {
    return this.formularioEdicion.value.fotoPerfil || '/assets/Images/auth/avatar.png';
  }
}
