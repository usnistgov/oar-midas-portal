import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdiListComponent } from './edi-list.component';

describe('EdiListComponent', () => {
  let component: EdiListComponent;
  let fixture: ComponentFixture<EdiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdiListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EdiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
