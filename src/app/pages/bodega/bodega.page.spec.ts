import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BodegaPage } from './bodega.page';

describe('BodegaPage', () => {
  let component: BodegaPage;
  let fixture: ComponentFixture<BodegaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BodegaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
