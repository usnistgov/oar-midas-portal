import { Component } from '@angular/core';
import { DynamicDialogRef,DynamicDialogConfig } from 'primeng/dynamicdialog';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'oarng';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent {
    textContent: SafeHtml = '';
    infoURL: string ;
  constructor(private cfgsvc: ConfigurationService,public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,private http: HttpClient,private sanitizer: DomSanitizer) {
    this.config.dismissableMask = true;
    
  }

  ngOnInit() {
    this.infoURL = this.cfgsvc.getConfig()['infoURL'];
    this.loadTextContent(this.infoURL);
  }

  loadTextContent(url: string) {
    this.http.get(url, { responseType: 'text' }).subscribe(
      data => {
        this.textContent = this.sanitizer.bypassSecurityTrustHtml(data);
      },
      error => {
        console.error('Error loading text content', error);
      }
    );
  }

  close() {
    this.ref.close('Some data');
  }
}