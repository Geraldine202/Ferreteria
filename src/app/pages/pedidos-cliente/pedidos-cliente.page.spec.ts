import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PedidosClientePage } from './pedidos-cliente.page';

describe('PedidosClientePage', () => {
  let component: PedidosClientePage;
  let fixture: ComponentFixture<PedidosClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
