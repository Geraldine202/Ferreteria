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
      segundo_apellido: [''],
      genero: ['', Validators.required],
      tipo_usuario: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      id_sucursal: ['', Validators.required],
      id_comuna: ['', Validators.required]
    });

  }

  ngOnInit() {
    this.cargarUsuarios();
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
  if (this.persona.invalid) return;

  const nuevoUsuario = this.persona.value;
  console.log('Datos a enviar:', nuevoUsuario);

  for (const [clave, valor] of Object.entries(nuevoUsuario)) {
    console.log(`${clave}: ${valor} (tipo: ${typeof valor})`);
  }

  this.usuariosService.crearUsuario(nuevoUsuario).subscribe({
    next: () => {
      this.cargarUsuarios();
      this.limpiarFormulario();
    },
    error: err => console.error('Error al registrar usuario', err)
  });
}



  buscar(usuario: any) {
    this.usuariosService.buscarUsuario(usuario.rut).subscribe({
      next: (data: any) => {
        this.persona.patchValue(data);
        this.botonModificar = true;
      },
      error: err => console.error('Error al buscar usuario', err)
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
}
