import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { catchError, switchMap, of } from 'rxjs';
import { UsuariosService } from 'src/app/service/usuarios.service';

// Validador personalizado: edad mínima
export function edadMinimaValidator(minEdad: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fecha = control.value ? new Date(control.value) : null;
    if (!fecha) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const m = hoy.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad >= minEdad ? null : { edadMinima: { requiredAge: minEdad, actualAge: edad } };
  };
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class PerfilPage implements OnInit {
  usuario: any = null;
  sucursalInfo: any = null;
  isLoading = true;
  errorMessage: string | null = null;
  editando = false;
  form: FormGroup;
  imagenPreview: string | ArrayBuffer | null = null;
  imagenArchivo: File | null = null;
  comunas: any[] = [];
  cambiarContrasenia = false;
  mostrarNuevaContrasenia = false;
  mostrarConfirmarContrasenia = false;

  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      primer_apellido: ['', Validators.required],
      segundo_apellido: [''],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      direccion: [''],
      fecha_nacimiento: ['', edadMinimaValidator(18)],
      id_sucursal: [''],
      comuna: [''],
      nuevaContrasenia: [''],
      confirmarContrasenia: ['']
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit() {
    this.cargarComuna().then(() => this.cargarUsuario());
  }

  // Validador de coincidencia de contraseñas
  passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const nueva = group.get('nuevaContrasenia')?.value;
    const confirmar = group.get('confirmarContrasenia')?.value;
    if ((nueva || confirmar) && nueva !== confirmar) {
      return { passwordMismatch: true };
    }
    return null;
  };

  async mostrarError(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async mostrarLoading(mensaje: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  async cargarComuna(): Promise<void> {
    const loading = await this.mostrarLoading('Cargando comunas...');
    return new Promise((resolve, reject) => {
      this.usuariosService.obtenerComuna().subscribe({
        next: (data: any) => {
          this.comunas = Array.isArray(data) ? data : [];
          loading.dismiss();
          resolve();
        },
        error: async err => {
          console.error('Error al obtener comunas', err);
          loading.dismiss();
          await this.mostrarError('Error', 'Error al cargar comunas');
          reject(err);
        }
      });
    });
  }

  cargarUsuario() {
    this.isLoading = true;
    this.errorMessage = null;

    this.usuariosService.getUsuarioActual().pipe(
      switchMap(usuario => {
        this.usuario = usuario;
        this.form.patchValue({
          nombre: usuario.nombre,
          primer_apellido: usuario.primer_apellido,
          segundo_apellido: usuario.segundo_apellido,
          correo: usuario.correo,
          telefono: usuario.telefono,
          direccion: usuario.direccion,
          fecha_nacimiento: usuario.fecha_nacimiento ? new Date(usuario.fecha_nacimiento).toISOString().substring(0, 10) : '',
          id_sucursal: usuario.id_sucursal,
          comuna: usuario.id_comuna
        });
        this.imagenPreview = usuario.imagen
          ? (usuario.imagen.startsWith('http') ? usuario.imagen : `http://localhost:3000/uploads/${usuario.imagen}`)
          : 'assets/images/perfil.jpg';

        if (!usuario?.id_sucursal) return of(null);

        return this.usuariosService.getSucursalConComuna(usuario.id_sucursal).pipe(
          catchError(err => {
            console.error('Error obteniendo sucursal:', err);
            return of({ nombre_sucursal: usuario.sucursal, nombre_comuna: usuario.comuna });
          })
        );
      })
    ).subscribe({
      next: (sucursalData) => {
        this.sucursalInfo = sucursalData;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.errorMessage = 'Error al cargar los datos del perfil';
        this.isLoading = false;
        this.mostrarError('Error', 'No se pudieron cargar todos los datos del perfil');
      }
    });
  }

  getSucursalDisplay(): string {
    if (!this.usuario?.id_sucursal) return 'Sucursal no asignada';
    if (this.sucursalInfo) {
      const nombreComuna = this.sucursalInfo.nombre_comuna || this.sucursalInfo.comuna?.nombre_comuna || 'Comuna no especificada';
      return `${this.sucursalInfo.nombre_sucursal || 'Sucursal'} (${nombreComuna})`;
    }
    if (this.usuario.sucursal || this.usuario.nombre_sucursal) {
      const nombreSucursal = this.usuario.sucursal || this.usuario.nombre_sucursal;
      const nombreComuna = this.usuario.comuna || this.usuario.nombre_comuna;
      return nombreSucursal + (nombreComuna ? ` (${nombreComuna})` : '');
    }
    return 'Información de sucursal no disponible';
  }

  editarPerfil() {
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
    this.cambiarContrasenia = false;
    this.form.reset();
    this.cargarUsuario();
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.imagenArchivo = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagenPreview = reader.result;
      reader.readAsDataURL(this.imagenArchivo);
    }
  }

  toggleCambiarContrasenia() {
    this.cambiarContrasenia = !this.cambiarContrasenia;
    if (!this.cambiarContrasenia) {
      this.form.patchValue({ nuevaContrasenia: '', confirmarContrasenia: '' });
      this.form.updateValueAndValidity();
    }
  }

  async guardarCambios() {
    if (this.form.invalid) {
      this.marcarCamposComoTocados();
      this.presentToast('Por favor, completa correctamente el formulario.');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando cambios...' });
    await loading.present();

    try {
      if (this.imagenArchivo) {
        const res = await this.usuariosService.subirImagen(this.imagenArchivo).toPromise();
        this.usuario.imagen = res.imagen || this.usuario.imagen;
        this.imagenPreview = res.imagen || this.imagenPreview;
      }

      const datosParaActualizar: any = {
        nombre: this.form.value.nombre,
        primer_apellido: this.form.value.primer_apellido,
        segundo_apellido: this.form.value.segundo_apellido,
        correo: this.form.value.correo,
        telefono: this.form.value.telefono,
        direccion: this.form.value.direccion,
        fecha_nacimiento: this.form.value.fecha_nacimiento,
        id_sucursal: this.form.value.id_sucursal,
        id_comuna: this.form.value.comuna,
        imagen: this.usuario.imagen
      };

      if (this.cambiarContrasenia && this.form.value.nuevaContrasenia.trim() !== '') {
        datosParaActualizar.contrasenia = this.form.value.nuevaContrasenia;
      }

      await this.usuariosService.patchUsuario(this.usuario.rut, datosParaActualizar).toPromise();

      this.presentToast('Perfil actualizado correctamente');
      this.editando = false;
      this.cambiarContrasenia = false;
      this.form.get('nuevaContrasenia')?.reset();
      this.form.get('confirmarContrasenia')?.reset();

      setTimeout(() => {
        this.cargarUsuario();
      }, 500);

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      this.presentToast('Error al actualizar el perfil');
    } finally {
      loading.dismiss();
    }
  }

  marcarCamposComoTocados() {
    Object.values(this.form.controls).forEach(control => control.markAsTouched());
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  recargarDatos(event: any) {
    this.cargarUsuario();
    event.target.complete();
  }
}
