import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class InventarioPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
