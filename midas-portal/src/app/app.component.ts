import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'midas-portal';

  constructor(private cdr: ChangeDetectorRef, private http: HttpClient){

  }
  
  ngOnInit(): void {
      //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
      //Add 'implements OnInit' to the class.

      console.log("App started:", this.title);
    alert("Test");
    this.http.get("https://p932439.nist.gov/sso/auth/_logininfo/", 
    { headers: { 'X-Requested-With':'XMLHttpRequest' }}).subscribe( (data) => {alert ("Test 2")} )
      
  }

  ngAfterViewInit(): void {
      //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
      //Add 'implements AfterViewInit' to the class.
      this.cdr.detectChanges();
  }
}

