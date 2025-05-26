import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { UsuariosService } from 'src/app/service/usuarios.service';

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

  constructor(
    private alertController: AlertController,
    private usuariosService: UsuariosService,
    private router: Router // <-- inyectamos Router
  ) {}

  async presentAlert(titulo: string, mensaje: string, redirectOnOk: boolean = false) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            if (redirectOnOk) {
              this.router.navigate(['/login']); // Redirige a login
            }
          }
        }
      ],
    });
    await alert.present();
  }

  onRecover() {
    this.usuariosService.solicitarRecuperacion(this.email).subscribe({
      next: () => {
        this.presentAlert('Correo enviado', 'Revisa tu bandeja de entrada.', true); // true para redirigir
      },
      error: () => {
        this.presentAlert('Error', 'No se pudo enviar el correo. Inténtalo más tarde.');
      }
    });
  }
}
