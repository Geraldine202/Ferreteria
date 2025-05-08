import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
  standalone: true
})
export class ContactoPage implements OnInit {
  nombre: string = '';
  correo: string = '';
  mensaje: string = '';

  constructor(private navController:NavController, private router:Router
    ,private alertController:AlertController
  ) { }

  async enviarMensaje() {
    if (this.nombre && this.correo && this.mensaje) {
      // Aquí puedes agregar la lógica para enviar el mensaje, por ejemplo, a través de un servicio HTTP.
      const alert = await this.alertController.create({
        header: 'Mensaje Enviado',
        message: '¡Gracias por contactarnos! Responderemos a la brevedad.',
        buttons: ['Aceptar']
      });

      await alert.present();

      // Limpiar los campos del formulario
      this.nombre = '';
      this.correo = '';
      this.mensaje = '';
    } else {
      const alert = await this.alertController.create({
        header: 'Campos incompletos',
        message: 'Por favor, completa todos los campos del formulario.',
        buttons: ['Aceptar']
      });

      await alert.present();
    }
  }

  ngOnInit() {
  }

  cerrarSesion() {
    // Aquí podrías limpiar datos, tokens, etc.
    console.log('Cerrando sesión...');
    this.router.navigate(['/login']); // Cambia '/login' según la ruta de tu página de login
  }

  irAHome() {
    this.navController.navigateRoot('/home'); // Asegúrate de que "/home" es la ruta correcta de tu página de inicio
  }

  mostrarSubcategorias = false;
  subcategorias = ['Herramientas Manuales', 'Materiales Básicos', 'Equipos de seguridad','Tornillos y Anclajes','Fijaciones y Adhesivos','Equipos de Medición'];
  
  seleccionarSubcategoria(nombre: string) {
    console.log('Seleccionaste:', nombre);
  }

  obtenerIcono(nombre: string): string {
    switch (nombre) {
      case 'Herramientas Manuales':
        return 'construct';
      case 'Materiales Básicos':
        return 'cube';
      case 'Equipos de seguridad':
        return 'shield-checkmark';
      case 'Tornillos y Anclajes':
        return 'hardware-chip'; // no hay uno específico, este es representativo
      case 'Fijaciones y Adhesivos':
        return 'git-merge'; // algo que represente unión
      case 'Equipos de Medición':
        return 'speedometer';
      default:
        return 'pricetag';
    }
  }

  irACategoria(nombre: string) {
    // Por ejemplo, redirige a /categoria/herramientas-manuales
    const ruta = nombre.toLowerCase().replace(/\s+/g, '-'); // reemplaza espacios por guiones
    this.router.navigate(['/categoria', ruta]);
  }

}
