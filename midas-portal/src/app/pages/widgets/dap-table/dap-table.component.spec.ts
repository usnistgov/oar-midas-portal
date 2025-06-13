import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DapTableComponent } from './dap-table.component';

describe('DapTableComponent', () => {
  let component: DapTableComponent;
  let fixture: ComponentFixture<DapTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DapTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DapTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
