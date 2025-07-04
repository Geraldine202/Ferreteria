import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule, LoadingController } from '@ionic/angular';
import { UsuariosService } from 'src/app/service/usuarios.service';

@Component({
  selector: 'app-cambio-contrasenia-forzado',
  templateUrl: './cambio-contrasenia-forzado.page.html',
  styleUrls: ['./cambio-contrasenia-forzado.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true
})
export class CambioContraseniaForzadoPage {

  nuevaContrasenia: string = '';
  confirmarContrasenia: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  nombreUsuario: string = '';
  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  this.nombreUsuario = usuario?.nombre || usuario?.nombres || 'Usuario';}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  esContraseniaSegura(contra: string): boolean {
    const tieneLongitudMinima = contra.length >= 8;
    const tieneMayuscula = /[A-Z]/.test(contra);
    const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(contra);
    return tieneLongitudMinima && tieneMayuscula && tieneEspecial;
  }
  

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {

        // Validar campos vacíos
  if (!this.nuevaContrasenia || !this.confirmarContrasenia) {
      this.mostrarAlerta('Error', 'Debes completar ambos campos');
      return;
  }

    // Validar longitud y complejidad
  if (!this.esContraseniaSegura(this.nuevaContrasenia)) {
    this.mostrarAlerta(
        'Error',
        'La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un carácter especial'
      );
      return;
  }
  if (this.nuevaContrasenia !== this.confirmarContrasenia) {
    this.mostrarAlerta('Error', 'Las contraseñas no coinciden');
    return;
  }
    // Validar que no sea igual a la anterior (si tienes la contraseña temporal)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    // Ejemplo si guardas la contraseña temporal (ajusta según cómo la manejes)
    if (this.nuevaContrasenia === usuario?.contrasenia) {
      this.mostrarAlerta('Error', 'La nueva contraseña no puede ser igual a la anterior');
      return;
    }
  const rut = usuario?.rut_usuario || usuario?.rut;

  this.usuariosService.cambiarContraseniaPatch(rut, this.nuevaContrasenia).subscribe({
    next: () => {
      this.mostrarAlerta('Éxito', 'Contraseña actualizada correctamente');
      this.router.navigate(['/home']);
    },
    error: (error) => {
      this.mostrarAlerta('Error', error.error?.mensaje || 'Error al cambiar la contraseña');
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
}
