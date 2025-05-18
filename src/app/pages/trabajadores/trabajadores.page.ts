import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UsuariosService } from 'src/app/service/usuarios.service';

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

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService
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
    console.log(this.persona.value);
  }

  cargarUsuarios() {
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (data: any) => {
        console.log('Usuarios recibidos desde la API:', data);
        // Asegúrate que data sea un array
        this.usuarios = Array.isArray(data) ? data : [];
      },
      error: err => console.error('Error al obtener usuarios', err)
    });
  }

onSubmit() {
  if (this.persona.valid) {
    const data = this.persona.value;
    const usuarioEnviar = {
      ...data,
      tipo_usuario: Number(data.tipo_usuario),
      sucursal: Number(data.sucursal),
      comuna: Number(data.comuna),
      telefono: Number(data.telefono) // si teléfono es numérico en DB
    };

    this.usuariosService.crearUsuario(usuarioEnviar).subscribe(
      res => console.log('Usuario creado:', res),
      err => console.error('Error al crear usuario:', err)
    );
  }
}





buscar(usuario: any) {
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





  modificar() {
    if (this.persona.invalid) return;

    const usuarioModificado = this.persona.value;
    const rut = usuarioModificado.rut;

    this.usuariosService.actualizarUsuario(rut, usuarioModificado).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.limpiarFormulario();
        this.botonModificar = false;
      },
      error: err => console.error('Error al modificar usuario', err)
    });
  }

  eliminar(rut: string) {
    this.usuariosService.eliminarUsuario(rut).subscribe({
      next: () => this.cargarUsuarios(),
      error: err => console.error('Error al eliminar usuario', err)
    });
  }

  limpiarFormulario() {
    this.persona.reset();
    this.botonModificar = false;
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const nombreArchivo = file.name;
      const ruta = `assets/images/${nombreArchivo}`;
      this.persona.get('imagen')?.setValue(ruta);
    }
  }


}
