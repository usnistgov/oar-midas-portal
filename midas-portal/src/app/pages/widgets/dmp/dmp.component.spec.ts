import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmpComponent } from './dmp.component';

describe('DmpComponent', () => {
  let component: DmpComponent;
  let fixture: ComponentFixture<DmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DmpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
