import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/service/usuarios.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class RegistrarsePage implements OnInit {
  registroForm: FormGroup;
  comunas: any[] = [];
  sucursales: any[] = [];
  imagenFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private usuariosService: UsuariosService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      rut_usuario: ['', [Validators.required, rutValido()]],
      nombre: ['', [Validators.required]],
      primer_apellido: ['', [Validators.required]],
      segundo_apellido: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      fecha_nacimiento: ['', [Validators.required, mayorDe15Anios()]], // <-- aquí el validador de edad
      comuna: [null, [Validators.required]],
      tipo_usuario: [4], // fijo
      sucursal: [null, [Validators.required]],
      imagen: [''],
      contrasenia: ['', [Validators.required, passwordSegura()]], // <-- validador de seguridad de contraseña
      confirmar_contrasenia: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {
    this.cargarComuna();
    this.cargarSucursales();
  }

  passwordsMatch(group: AbstractControl) {
    const pass = group.get('contrasenia')?.value;
    const confirm = group.get('confirmar_contrasenia')?.value;
    if (!pass || !confirm) return null;
    return pass === confirm ? null : { noMatch: true };
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.imagenFile = event.target.files[0];
    } else {
      this.imagenFile = null;
    }
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

  getNombreComuna(idComuna: number): string {
    if (!this.comunas || !idComuna) return 'Sin comuna';
    const comuna = this.comunas.find(c => c.id_comuna === idComuna);
    return comuna ? comuna.nombre_comuna : 'Comuna no encontrada';
  }

  async onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      await this.mostrarError('Por favor, completa correctamente el formulario');
      return;
    }

    const loading = await this.mostrarLoading('Registrando usuario...');

    try {
      const formValue = { ...this.registroForm.value };
      delete formValue.confirmar_contrasenia;

      const usuarioData = {
        rut: formValue.rut_usuario,
        nombre: formValue.nombre,
        primer_apellido: formValue.primer_apellido,
        segundo_apellido: formValue.segundo_apellido,
        contrasenia: formValue.contrasenia,
        imagen: '',
        genero: formValue.genero,
        correo: formValue.correo,
        direccion: formValue.direccion,
        telefono: Number(formValue.telefono),
        fecha_nacimiento: formValue.fecha_nacimiento,
        tipo_usuario: formValue.tipo_usuario,
        sucursal: formValue.sucursal,
        comuna: formValue.comuna
      };

      if (this.imagenFile) {
        const respuestaImagen: any = await this.usuariosService.subirImagen(this.imagenFile).toPromise();
        usuarioData.imagen = respuestaImagen.imagen || '';
      }

      await this.usuariosService.crearUsuario(usuarioData).toPromise();

      loading.dismiss();
      await this.mostrarToast('Usuario creado con éxito', 'success');
      this.router.navigate(['/login']);
    } catch (error) {
      loading.dismiss();
      await this.mostrarError('Error al crear usuario');
    }
  }

  private async mostrarError(mensaje: string): Promise<void> {
    await this.mostrarToast(mensaje, 'danger');
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  private async mostrarLoading(mensaje: string) {
    const loading = await this.loadingController.create({
      message: mensaje,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }
}

// ✅ Validador personalizado para RUT chileno
function rutValido(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rut = control.value;
    if (!rut) return null;

    const valor = rut.replace(/\./g, '').toUpperCase();

    if (!/^\d{7,8}-[0-9K]$/.test(valor)) {
      return { rutInvalido: 'Formato inválido' };
    }

    const [cuerpo, dv] = valor.split('-');
    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const resultado = 11 - (suma % 11);
    let dvEsperado = '';
    if (resultado === 11) dvEsperado = '0';
    else if (resultado === 10) dvEsperado = 'K';
    else dvEsperado = resultado.toString();

    return dv === dvEsperado ? null : { rutInvalido: 'Dígito verificador incorrecto' };
  };
}

// ✅ Validador para contraseña segura
function passwordSegura(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const pass = control.value;
    if (!pass) return null;

    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{}|\\;:'",.<>\/?]).{8,}$/;

    return regex.test(pass) ? null : { passwordInsegura: true };
  };
}

// ✅ Validador para edad mínima de 15 años
function mayorDe15Anios(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fecha = control.value;
    if (!fecha) return null;

    const fechaNacimiento = new Date(fecha);
    const hoy = new Date();
    const edadMinima = new Date(hoy.getFullYear() - 15, hoy.getMonth(), hoy.getDate());

    return fechaNacimiento <= edadMinima ? null : { menorDe15: true };
  };
}
