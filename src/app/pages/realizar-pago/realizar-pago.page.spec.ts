import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RealizarPagoPage } from './realizar-pago.page';

describe('RealizarPagoPage', () => {
  let component: RealizarPagoPage;
  let fixture: ComponentFixture<RealizarPagoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RealizarPagoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
