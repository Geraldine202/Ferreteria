import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class RecuperarPage {
  @ViewChild('recoverForm') recoverForm!: NgForm;
  email: string = '';

  constructor(private toastController: ToastController) {}

  async onRecover() {
    if (this.recoverForm?.valid) {
      // Simula envío
      console.log('Enviando instrucciones a:', this.email);

      // Limpia el formulario
      this.recoverForm.resetForm();
      this.email = '';

      // Muestra Toast
      const toast = await this.toastController.create({
        message: 'Instrucciones enviadas al correo electrónico.',
        duration: 3000,
        color: 'success',
        position: 'top',
        animated: true,
      });

      await toast.present();
    }
  }
}
