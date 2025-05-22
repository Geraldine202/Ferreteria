import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenerarPedidoPage } from './generar-pedido.page';

describe('GenerarPedidoPage', () => {
  let component: GenerarPedidoPage;
  let fixture: ComponentFixture<GenerarPedidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerarPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
