import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
  imports: [IonicModule, CommonModule,FormsModule],
  standalone: true
})
export class RegistrarsePage implements OnInit {
  usuario = {
    rut_usuario: '',
    nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    genero: '',
    correo: '',
    direccion: '',
    telefono: null,
    fecha_nacimiento: '',
    id_comuna: null
  };

  constructor(private router: Router) { }

  onSubmit() {
  
    console.log('Formulario enviado', this.usuario);

   
    this.router.navigate(['/login']);
  }

  ngOnInit() {
  }

}
