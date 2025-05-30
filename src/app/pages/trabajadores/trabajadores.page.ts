import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { UsuariosService } from 'src/app/service/usuarios.service';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})

export class TrabajadoresPage implements OnInit {

  persona: FormGroup;
  usuarios: any[] = [];
  botonModificar = false;
  comunas: any[] = [];
  sucursales: any[] = [];
  selectedFile: File | null = null;
  comunasMap: Map<number, string> = new Map();

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.persona = this.fb.group({
      rut: ['', [Validators.required, this.rutChilenoValidator]],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      primer_apellido: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      segundo_apellido: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      contrasenia: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      ]],
      imagen: [''],
      genero: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      fecha_nacimiento: ['', [Validators.required, mayorDeEdadValidator(18)]],  // <-- validación personalizada aquí
      tipo_usuario: [null, Validators.required],
      sucursal: [null, Validators.required],
      comuna: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarComuna();
    this.cargarSucursales();
  }

  // Validador personalizado para RUT chileno
  rutChilenoValidator(control: AbstractControl): ValidationErrors | null {
    const rut = control.value;
    if (!rut) return null;

    const rutLimpio = rut.replace(/\./g, '').replace('-', '').toUpperCase();
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);

    if (!/^\d+$/.test(cuerpo)) return { rutInvalido: true };

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvEsperado = 11 - (suma % 11);
    let dvReal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

    return dvReal === dv ? null : { rutInvalido: true };
  }


  // Validador personalizado para validar mayor de edad
  mayorDeEdadValidator(minEdad: number = 18): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null; // No valida si no hay valor

      const fechaNacimiento = new Date(control.value);
      const hoy = new Date();

      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
      }

      return edad >= minEdad ? null : { menorEdad: true };
    };
  }

  getNombreComuna(idComuna: number): string {
    return this.comunasMap.get(idComuna) || 'Comuna desconocida';
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.persona.get(controlName);
    return control && control.errors ? control.errors[errorName] && control.touched : false;
  }

  async cargarUsuarios() {
    const loading = await this.mostrarLoading('Cargando usuarios...');
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (data: any) => {
        this.usuarios = Array.isArray(data) ? data : [];
        loading.dismiss();
      },
      error: async () => {
        loading.dismiss();
        await this.mostrarError('Error al cargar usuarios');
      }
    });
  }

  async cargarComuna() {
    const loading = await this.mostrarLoading('Cargando comunas...');
    this.usuariosService.obtenerComuna().subscribe({
      next: (data: any) => {
        this.comunas = Array.isArray(data) ? data : [];
        loading.dismiss();
      },
      error: async () => {
        loading.dismiss();
        await this.mostrarError('Error al cargar comunas');
      }
    });
  }

  async cargarSucursales() {
    const loading = await this.mostrarLoading('Cargando sucursales...');
    this.usuariosService.obtenerSucursal().subscribe({
      next: (data: any) => {
        this.sucursales = Array.isArray(data) ? data : [];
        loading.dismiss();
      },
      error: async () => {
        loading.dismiss();
        await this.mostrarError('Error al cargar sucursales');
      }
    });
  }

  async onSubmit() {
    if (this.persona.invalid) {
      this.persona.markAllAsTouched();
      await this.mostrarError('Por favor complete todos los campos correctamente.');
      return;
    }

    const loading = await this.mostrarLoading('Registrando usuario...');
    try {
      if (this.selectedFile) {
        const imagenResponse = await this.usuariosService.subirImagen(this.selectedFile).toPromise();
        this.persona.patchValue({ imagen: imagenResponse.imagen });
      }

      const data = this.persona.value;
      const usuarioEnviar = {
        ...data,
        tipo_usuario: Number(data.tipo_usuario),
        sucursal: Number(data.sucursal),
        comuna: Number(data.comuna),
        telefono: Number(data.telefono)
      };

      await this.usuariosService.crearUsuario(usuarioEnviar).toPromise();
      this.cargarUsuarios();
      this.limpiarFormulario();
      await this.mostrarExito('Usuario registrado exitosamente');
    } catch {
      await this.mostrarError('Error al registrar el usuario');
    } finally {
      loading.dismiss();
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  async buscar(usuario: any) {
    this.usuariosService.buscarUsuario(usuario.rut).subscribe((data: any) => {
      const fechaNacimientoISO = data.fecha_nacimiento?.substring(0, 10) || '';

      this.persona.patchValue({
        rut: data.rut,
        nombre: data.nombre,
        primer_apellido: data.primer_apellido,
        segundo_apellido: data.segundo_apellido,
        contrasenia: data.contrasenia,
        imagen: data.imagen,
        genero: data.genero,
        correo: data.correo,
        direccion: data.direccion,
        telefono: data.telefono,
        fecha_nacimiento: fechaNacimientoISO,
        tipo_usuario: data.tipo_usuario,
        sucursal: data.sucursal,
        comuna: data.comuna
      });

      this.botonModificar = true;
    });
  }

  mostrarParaModificar(usuario: any) {
    this.buscar(usuario);
  }

  async modificar() {
    if (this.persona.invalid) {
      this.persona.markAllAsTouched();
      await this.mostrarError('Por favor complete todos los campos correctamente.');
      return;
    }

    const loading = await this.mostrarLoading('Actualizando usuario...');
    try {
      if (this.selectedFile) {
        const imagenResponse = await this.usuariosService.subirImagen(this.selectedFile).toPromise();
        this.persona.patchValue({ imagen: imagenResponse.imagen });
      }

      const usuarioModificado = {
        ...this.persona.value,
        tipo_usuario: Number(this.persona.value.tipo_usuario),
        sucursal: Number(this.persona.value.sucursal),
        comuna: Number(this.persona.value.comuna),
        telefono: Number(this.persona.value.telefono)
      };

      const rut = this.persona.value.rut;
      await this.usuariosService.actualizarUsuario(rut, usuarioModificado).toPromise();

      this.cargarUsuarios();
      this.limpiarFormulario();
      this.botonModificar = false;

      await this.mostrarExito('Usuario actualizado correctamente');
    } catch {
      await this.mostrarError('Error al actualizar el usuario');
    } finally {
      loading.dismiss();
    }
  }

  async eliminar(rut: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.mostrarLoading('Eliminando usuario...');
            try {
              await this.usuariosService.eliminarUsuario(rut).toPromise();
              this.cargarUsuarios();
              await this.mostrarExito('Usuario eliminado correctamente');
            } catch {
              await this.mostrarError('Error al eliminar el usuario');
            } finally {
              loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  limpiarFormulario() {
    this.persona.reset();
    this.botonModificar = false;
    this.selectedFile = null;
  }

  handleImageError(event: any) {
    event.target.src = 'assets/images/perfil.png';
  }

  private async mostrarLoading(mensaje: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: mensaje,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  private async mostrarExito(mensaje: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  private async mostrarError(mensaje: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  tieneError(campo: string, error: string): boolean {
    const control = this.persona.get(campo);
    return control && control.errors ? !!control.errors[error] && control.touched : false;
  }
}

// Función validadora externa para mejor claridad, si quieres puedes moverla fuera de la clase también.
export function mayorDeEdadValidator(minEdad: number = 18): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const fechaNacimiento = new Date(control.value);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    return edad >= minEdad ? null : { menorEdad: true };
  };
}
