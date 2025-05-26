import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuariosService } from 'src/app/service/usuarios.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async login() {
    if (this.loginForm.invalid) {
      this.mostrarAlerta('Error', 'Por favor completa todos los campos correctamente');
      return;
    }

    const { email, password } = this.loginForm.value;

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
    });
    await loading.present();

    this.usuariosService.login(email, password).subscribe({
      next: async (response) => {
        await loading.dismiss();
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        this.router.navigate(['/home']);
        this.loginForm.reset();
        if (response.usuario.cambioClaveObligatorio || response.usuario.cambio_clave_obligatorio === 'S') {
            this.router.navigate(['/cambio-contrasenia-forzado']);
          } else {
            this.router.navigate(['/home']);
          }
          this.loginForm.reset();
    },
      error: async (error) => {
        await loading.dismiss();
        this.mostrarAlerta('Error', error.error?.message || 'Error al iniciar sesión');
      }
    });
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  goToRecuperar() {
    this.router.navigate(['/recuperar']);
  }

  goToRegistrarse() {
    this.router.navigate(['/registrarse']);
  }
}