import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { faHouse, faUser, faDashboard, faCloud, faClipboardList,
faSearch, faFileCirclePlus, faPlus,faBook, faListCheck,faLink,faAddressBook
 ,faCircle, faPrint, faPersonCircleQuestion, faBuilding} from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { map } from 'rxjs/operators';
import { AuthenticationService } from 'oarng';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  providers:[DialogService,MessageService],
  styleUrls: [
    './landing.component.css'
  ]
})
export class LandingComponent implements OnInit {
  faAddressBook=faAddressBook;
  faLink = faLink;
  faCircle = faCircle;
  faBuilding = faBuilding;
  faPlus = faPlus;
  faHouse = faHouse;
  faUser = faUser;
  faDashboard =faDashboard;
  faCloud =faCloud;
  faClipboardList= faClipboardList;
  faSearch=faSearch;
  faFileCirclePlus=faFileCirclePlus;
  faBook=faBook;
  faListCheck=faListCheck;
  faPrint=faPrint;
  faPersonCircleQuestion=faPersonCircleQuestion;
  public username: string;
  events: string[] = [];
  opened: boolean;
  display = false;
  filterString: string;
  userLastName : string|undefined;
  userName: string|undefined;
  userEmail: string|undefined;
  userId: string|undefined;
  userOU: string|undefined;
  userDiv: string|undefined;
  authToken: string|null|undefined;
  public dap: any;
  dapAPI: string;

  public constructor(private authsvc: AuthenticationService,
                     private http: HttpClient, public dialogService: DialogService,
                     public messageService: MessageService) { 
    
  }


  ngOnInit(): void {
      this.getUserInfo();
  }


  ngAfterViewInit() {
    setTimeout(() => {
        if (this.userId)
            this.messageService.addAll([
                { severity: 'success', summary: 'NIST MIDAS Portal', detail: 'Connected as '+this.userId }
            ]);
        else
            this.messageService.addAll([
                { severity: 'warning', summary: 'Portal login failed', detail: 'Connected as anonymous' }
            ]);
    })

    let filter = document.getElementsByTagName("p-columnfilter");

    // regular for loop
    var Ar_filter = Array.prototype.slice.call(filter)
    for (let i of Ar_filter) {
      i.children[0].children[0].ariaLabel="Last Modified"
      
    }

    let paginator = document.getElementsByTagName("p-paginator");

    // regular for loop
    var Ar_paginator = Array.prototype.slice.call(paginator)
    for (let i of Ar_paginator) {
        i.children[0].children[1].ariaLabel="First page"
        i.children[0].children[2].ariaLabel="Previous page"
        i.children[0].children[4].ariaLabel="Next page"
        i.children[0].children[5].ariaLabel="Last page"

    }
  }

  public getUserInfo() {
      return this.authsvc.getCredentials().subscribe(
          creds => {
              if (! creds || ! creds.userId)
                  throw new Error("Missing identity information in credentials");
              console.log("Logged in as "+creds.userId);
              this.userId = creds.userId;
              this.userName = creds.userAttributes.userName;
              this.userLastName = creds.userAttributes.userLastName;
              this.userEmail = creds.userAttributes.userEmail;
              this.userOU = creds.userAttributes.userOU;
              this.authToken = creds.token;
          },
          error => {
              alert("Unable to determine your identity");
          }
      )
  }

  public fetchRecords(url:string){
    this.http.get(url)
    .pipe(map((responseData: any)  => {
      return responseData
    })). subscribe(records => {
      this.dap = records
    })
  }
}

