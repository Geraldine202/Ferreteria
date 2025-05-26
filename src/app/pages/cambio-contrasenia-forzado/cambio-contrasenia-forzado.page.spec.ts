import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CambioContraseniaForzadoPage } from './cambio-contrasenia-forzado.page';

describe('CambioContraseniaForzadoPage', () => {
  let component: CambioContraseniaForzadoPage;
  let fixture: ComponentFixture<CambioContraseniaForzadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CambioContraseniaForzadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
