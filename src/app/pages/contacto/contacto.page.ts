import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class ContactoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
