import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetOptionsComponent } from './widget-options.component';

describe('WidgetOptionsComponent', () => {
  let component: WidgetOptionsComponent;
  let fixture: ComponentFixture<WidgetOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WidgetOptionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WidgetOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
