import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class RegistrarsePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
