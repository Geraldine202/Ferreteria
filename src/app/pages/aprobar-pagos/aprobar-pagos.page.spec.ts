import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AprobarPagosPage } from './aprobar-pagos.page';

describe('AprobarPagosPage', () => {
  let component: AprobarPagosPage;
  let fixture: ComponentFixture<AprobarPagosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AprobarPagosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
