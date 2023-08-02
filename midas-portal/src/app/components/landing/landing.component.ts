import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CustomizationService } from '../auth-service/auth.service';
import { AuthService } from '../auth-service/auth.service';
import { faHouse, faUser, faDashboard, faCloud, faClipboardList,
faSearch, faFileCirclePlus, faPlus,faBook, faListCheck,faLink,faAddressBook
 ,faCircle, faPrint, faPersonCircleQuestion, faBuilding} from '@fortawesome/free-solid-svg-icons';
import { AppConfig } from 'src/app/config/app.config';
import { UserDetails } from '../auth-service/user.interface';
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
  private _custsvc: CustomizationService ;
  public username: string;
  events: string[] = [];
  opened: boolean;
  display = false;
  filterString: string;
  userLastName : string;
  userName: string;
  userEmail: string;
  userId: string;
  userOU: string;
  userDiv: string;
  public dap: any;
  authAPI: string;
  authRedirect: string;
  dapAPI: string;

  userDetails: UserDetails;

  public constructor(private authsvc: AuthenticationService,
                    private appConfig: AppConfig,
                    private http: HttpClient,public dialogService: DialogService
                    , public messageService: MessageService) { 
    
  }


  ngOnInit(): void {
    let promise = new Promise((resolve) => {
      //this.startEditing(true);
    
    console.log('******** authAPI: ' + this.authAPI);
      this.appConfig.getRemoteConfig().subscribe(config => {
        this.authAPI = config.authAPI;
        this.authRedirect = config.authRedirect;
        console.log('********** calll userinfor ');
      this.getUserInfo();
      });
    })
  }


  ngAfterViewInit() {
    setTimeout(() => {
        this.messageService.addAll([
            { severity: 'success', summary: 'NIST MIDAS Portal', detail: 'Connected as cnd7'}
        ]);
    })
}

  public getUserInfo() {
    console.log('authAPI: ' + this.authAPI);
    console.log('authRedirect: ' + this.authRedirect);

    //make the call to the auth service
    this.http.get(this.authAPI, { observe: 'response', headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }}).subscribe(response => {
      console.log('response code: ' + response.status);
      console.log('user details: ' + response.body);
      if(response.status != 200) {
        //redirect to authentication URL

        console.log("Redirecting to " + this.authRedirect + " to authenticate user");
        window.location.assign(this.authRedirect);        
      }
      else {

         console.log(" userDetails ::"+JSON.parse(JSON.stringify(response.body)))
         var testToken =  JSON.parse(JSON.stringify(response.body)).token;
         console.log(" TOKEN ::"+testToken)
         let userDetails = JSON.parse(JSON.stringify(response.body)).userDetails;
         console.log(" userDetails ::"+userDetails)
         
         this.userName = userDetails.userName;
         this.userLastName = userDetails.userLastName;
         this.userEmail = userDetails.userEmail;
         this.userId = userDetails.userId;
         this.userOU = userDetails.userOU;
         this.userDiv = userDetails.userDiv + " , "+ userDetails.userDivNum;
        console.log('username: ' + this.userName);
      }
      //this.userDetails = response.body;
      
    },
    httperr => {
      if (httperr.status == 401) {
        console.log("Redirecting to " + this.authRedirect + " to authenticate user");
        window.location.assign(this.authRedirect);  
     }
     else if (httperr.status < 100 && httperr.error) {
       
         let msg = "Service connection error"
         if (httperr['message'])
             msg += ": " + httperr.message
         if (httperr.error.message)
             msg += ": " + httperr.error.message
         if (httperr.status == 0 && httperr.statusText.includes('Unknown'))
             msg += " (possibly due to CORS restriction?)";
         alert(msg)
     }
     else  {
        
         // URL returned some other error status
         let msg = "Unexpected error during authorization";
         // TODO: can we get at body of message when an error occurs?
         // msg += (httperr.body['message']) ? httperr.body['message'] : httperr.statusText;
         msg += " (" + httperr.status.toString() + " " + httperr.statusText + ")"
         alert(msg);
     }
    }
    );
  }

  public fetchRecords(url:string){
    this.http.get(url)
    .pipe(map((responseData: any)  => {
      return responseData
    })). subscribe(records => {
      this.dap = records
    })
  }


  public logintest(){
    alert("Test");
    //this.authsvc.getUserInfo();
  }
    /**
     * return true if the user is currently authorized to to edit the resource metadata.
     * If false, can attempt to gain authorization via a call to authorizeEditing();
     */
     public isAuthorized(): boolean {
      return Boolean(this._custsvc);
  }


}

