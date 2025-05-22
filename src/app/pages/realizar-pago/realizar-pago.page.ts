import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-realizar-pago',
  templateUrl: './realizar-pago.page.html',
  styleUrls: ['./realizar-pago.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class RealizarPagoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
