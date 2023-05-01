import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordsComponent } from './records.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { SharedModule } from 'primeng/api';
import dapData from 'src/assets/json/dap.json'

describe('RecordsComponent', () => {
  let component: RecordsComponent;
  let fixture: ComponentFixture<RecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[SharedModule],
      declarations: [ RecordsComponent ],
      providers:[HttpClient,HttpHandler]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.records=dapData;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Data received', () => {
    console.log("pre",component.pre);
    console.log("after",component.after);
    console.log("data",component.data)
    expect(component).toBeTruthy();
  });

/*
  it('should display data test',()=>{
    fixture.detectChanges();
    const titleElementList = fixture.debugElement.queryAll(By.css('[data-role="test"]'))
    const titleList = titleElementList.map(element=> element.nativeElement.textContent);
    console.log(titleList.toLocaleString());
    expect(titleList.toLocaleString()).toEqual("Test")
  });

  it('should display data Name',()=>{
    fixture.detectChanges();
    const titleElementList = fixture.debugElement.queryAll(By.css('h2'))
    const titleList = titleElementList.map(element=> element.nativeElement.textContent);
    console.log(titleList);
    expect(titleList.toLocaleString()).toEqual("Test")
  });
*/
});
