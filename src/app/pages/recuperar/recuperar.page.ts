import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  standalone: true
})
export class RecuperarPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
