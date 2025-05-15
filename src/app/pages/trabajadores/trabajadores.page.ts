import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UsuariosService } from 'src/app/service/usuarios.service';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
  imports: [IonicModule, CommonModule],
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
      primer_apellido: [''],
      segundo_apellido: [''],
      genero: [''],
      tipo_usuario: [''],
      correo: [''],
      direccion: [''], // corregido
      telefono: [''],
      fecha_nacimiento: [''],
      id_sucursal: [''],
      id_comuna: ['']
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.obtenerUsuarios().subscribe({
    next: (data: any) => {
      this.usuarios = Array.isArray(data) ? data : [];
    },
      error: err => console.error('Error al obtener usuarios', err)
    });
  }

  onSubmit() {
    if (this.persona.invalid) return;

    const nuevoUsuario = this.persona.value;

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
      next: data => {
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
