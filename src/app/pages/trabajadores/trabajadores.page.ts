import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UsuariosService } from 'src/app/service/usuarios.service';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
  imports: [IonicModule, CommonModule,ReactiveFormsModule],
  standalone: true
})
export class TrabajadoresPage implements OnInit {

  persona: FormGroup;
  usuarios: any[] = [];
  botonModificar: boolean = false;
  comunas: any[] = []; 
  sucursales: any[] = []; 

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService, private loadingController: LoadingController, private toastController: ToastController,private alertController: AlertController
  ) {
    this.persona = this.fb.group({
      rut: ['', Validators.required],
      nombre: ['', Validators.required],
      primer_apellido: ['', Validators.required],
      segundo_apellido: ['', Validators.required],
      contrasenia: ['', Validators.required],
      imagen: [''],
      genero: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      tipo_usuario: [null, Validators.required],
      sucursal: [null, Validators.required],
      comuna: [null, Validators.required]
    });

    

  }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarComuna();
    this.cargarSucursales()
    console.log(this.persona.value);
  }

  async cargarUsuarios() {
    const loading = await this.mostrarLoading('Cargando usuarios...');
    try {
      this.usuariosService.obtenerUsuarios().subscribe({
        next: (data: any) => {
          this.usuarios = Array.isArray(data) ? data : [];
          loading.dismiss();
        },
        error: async err => {
          console.error('Error al obtener usuarios', err);
          loading.dismiss();
          await this.mostrarError('Error al cargar usuarios');
        }
      });
    } catch (error) {
      loading.dismiss();
      await this.mostrarError('Error al cargar usuarios');
    }
  }
async cargarComuna() {
  const loading = await this.mostrarLoading('Cargando comunas...');
  try {
    this.usuariosService.obtenerComuna().subscribe({
      next: (data: any) => {
        this.comunas = Array.isArray(data) ? data : []; // Asigna a this.comunas
        console.log('Comunas cargadas:', this.comunas); // Para depuración
        loading.dismiss();
      },
      error: async err => {
        console.error('Error al obtener comunas', err);
        loading.dismiss();
        await this.mostrarError('Error al cargar comunas');
      }
    });
  } catch (error) {
    loading.dismiss();
    await this.mostrarError('Error al cargar comunas');
  }
}
getNombreComuna(idComuna: number): string {
  if (!this.comunas || !idComuna) return 'Sin comuna';
  const comuna = this.comunas.find(c => c.id_comuna === idComuna);
  return comuna ? comuna.nombre_comuna : 'Comuna no encontrada';
}
async cargarSucursales() {
  const loading = await this.mostrarLoading('Cargando sucursales...');
  try {
    this.usuariosService.obtenerSucursal().subscribe({
      next: (data: any) => {
        this.sucursales = Array.isArray(data) ? data : []; // Asigna a this.comunas
        console.log('Sucursales cargadas:', this.sucursales); // Para depuración
        loading.dismiss();
      },
      error: async err => {
        console.error('Error al obtener Sucursales', err);
        loading.dismiss();
        await this.mostrarError('Error al cargar Sucursales');
      }
    });
  } catch (error) {
    loading.dismiss();
    await this.mostrarError('Error al cargar Sucursales');
  }
}


  async onSubmit() {
    if (this.persona.invalid) {
      await this.mostrarError('Por favor complete todos los campos requeridos');
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
    } catch (error) {
      console.error('Error al crear usuario:', error);
      await this.mostrarError('Error al registrar el usuario');
    } finally {
      loading.dismiss();
    }
  }
selectedFile: File | null = null;

onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    console.log('Archivo seleccionado:', this.selectedFile);
  }
}

subirImagen() {
  if (!this.selectedFile) {
    alert('Por favor, selecciona una imagen primero');
    return;
  }

  this.usuariosService.subirImagen(this.selectedFile).subscribe({
    next: (response) => {
      console.log('Respuesta al subir imagen:', response);
      if (response.imagen) {
        this.persona.patchValue({ imagen: response.imagen });
        console.log('Campo imagen actualizado en el formulario:', this.persona.value.imagen);
      } else {
        console.warn('La respuesta no contiene la propiedad imagen');
      }
    },
    error: (error) => {
      console.error('Error al subir imagen:', error);
    }
  });
}

  async buscar(usuario: any) {

    this.usuariosService.buscarUsuario(usuario.rut).subscribe((data: any) => {
      let fechaNacimientoISO = '';

      if (data.fecha_nacimiento) {
        // Extraer solo yyyy-mm-dd para el input date
        fechaNacimientoISO = data.fecha_nacimiento.substring(0, 10);
      }

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





async modificar() {
    if (this.persona.invalid) {
      await this.mostrarError('Por favor complete todos los campos requeridos');
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
  } catch (error) {
    console.error('Error al modificar usuario:', error);
    this.mostrarError('Error al actualizar el usuario');
  } finally {
    loading.dismiss();
  }
}


async eliminar(rut: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.mostrarLoading('Eliminando usuario...');
            try {
              await this.usuariosService.eliminarUsuario(rut).toPromise();
              this.cargarUsuarios();
              await this.mostrarExito('Usuario eliminado correctamente');
            } catch (error) {
              console.error('Error al eliminar usuario', error);
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
  handleImageError(event: any, usuario: any) {
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
}

