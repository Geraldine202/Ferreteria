import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor() {}
  // Método para iniciar el contador
  imagenes: string[] = [
    'assets/images/relleno1.png',
    'assets/images/relleno1.png',
    'assets/images/relleno1.png',
  ];
 
  currentIndex: number = 0; // Índice de la imagen actual

  ngAfterViewInit() {
    // Establecer un intervalo para cambiar la imagen cada 3 segundos
    setInterval(() => {
      this.nextImage();
    }, 2000); // Cambiar imagen cada 3 segundos
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.imagenes.length; // Incrementar índice y volver al principio al llegar al final
  }

}
