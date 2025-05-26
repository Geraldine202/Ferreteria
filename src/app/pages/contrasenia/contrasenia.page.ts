import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { UsuariosService } from 'src/app/service/usuarios.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contrasenia',
  templateUrl: './contrasenia.page.html',
  styleUrls: ['./contrasenia.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true
})
export class ContraseniaPage implements OnInit {
  email: string;
  token: string;

  nuevaContrasenia: string = '';
  confirmarContrasenia: string = '';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private usuariosService: UsuariosService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async presentAlert(message: string, redirectToLogin: boolean = false) {
    const alert = await this.alertController.create({
      header: 'Aviso',
      message,
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            if (redirectToLogin) {
              this.router.navigate(['/login']);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  onSubmit() {
    if (!this.token) {
      this.presentAlert('Token no válido');
      return;
    }

    if (this.nuevaContrasenia !== this.confirmarContrasenia) {
      this.presentAlert('Las contraseñas no coinciden.');
      return;
    }

    this.usuariosService.cambiarContrasenia(this.token, this.nuevaContrasenia).subscribe({
      next: () => {
        this.presentAlert('Contraseña actualizada con éxito.', true);
      },
      error: () => {
        this.presentAlert('Error al cambiar la contraseña.');
      }
    });
  }
}
