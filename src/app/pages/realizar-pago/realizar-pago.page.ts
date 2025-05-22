import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-realizar-pago',
  templateUrl: './realizar-pago.page.html',
  styleUrls: ['./realizar-pago.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class RealizarPagoPage implements OnInit {
  pagoForm: FormGroup;
  totalCompra = 38990;
  boletaGenerada = false;
  datosBoleta: any = null;

  constructor(private fb: FormBuilder, private alertCtrl: AlertController) {
    this.pagoForm = this.fb.group({
      nombre: ['', Validators.required],
      rut: ['', Validators.required],
      tipoPago: ['', Validators.required],
      tipoEntrega: ['', Validators.required]
    });
  }

  ngOnInit() {}

  async confirmarPago() {
    if (this.pagoForm.valid) {
      this.datosBoleta = {
        ...this.pagoForm.value,
        total: this.totalCompra,
        fecha: new Date()
      };
      this.boletaGenerada = true;

      const alert = await this.alertCtrl.create({
        header: 'Pago Realizado',
        message: 'Tu boleta ha sido generada correctamente.',
        buttons: ['Aceptar']
      });
      await alert.present();

      console.log('Datos del pago:', this.datosBoleta);
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Por favor completa todos los campos requeridos.',
        buttons: ['Aceptar']
      });
      await alert.present();
    }
  }
}