import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AprobarPedidoPage } from './aprobar-pedido.page';

describe('AprobarPedidoPage', () => {
  let component: AprobarPedidoPage;
  let fixture: ComponentFixture<AprobarPedidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AprobarPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
