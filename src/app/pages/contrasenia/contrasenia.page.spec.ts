import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContraseniaPage } from './contrasenia.page';

describe('ContraseniaPage', () => {
  let component: ContraseniaPage;
  let fixture: ComponentFixture<ContraseniaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ContraseniaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
