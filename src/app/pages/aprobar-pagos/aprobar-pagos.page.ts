import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-aprobar-pagos',
  templateUrl: './aprobar-pagos.page.html',
  styleUrls: ['./aprobar-pagos.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class AprobarPagosPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
