import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  // NgModel
  email: string = "";
  password: string = "";
  
  constructor(private router: Router, private alertController: AlertController) { }

  ngOnInit() {}

  ionViewWillEnter() {
    // Limpiar los campos cuando la vista esté a punto de cargarse
    this.email = "";
    this.password = "";
  }

  login() {
    // Aquí puedes agregar la lógica de validación
    if (this.email && this.password) {
      this.router.navigate(['/home']); // Cambié a '/home'
    } else {
      // Mostrar algún mensaje de error si los campos están vacíos
      console.log('Por favor ingresa un correo y contraseña');
    }
  }
}
