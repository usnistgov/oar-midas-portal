import { Component, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  title_line01: string = "MIDAS";
  title_line02: string = "DATA PUBLISHING";
  userBlockStatus: string = 'collapsed';

  @Input() appVersion: string = "1.0";
  @Input() titleLn1: string = "MIDAS";
  @Input() titleLn2: string = "DATA PUBLISHING";


  constructor() {
  }
  

  @HostListener('document:click', ['$event'])
  clickout() {
      this.userBlockStatus = 'collapsed';
  }

  ngOnInit(): void {
      this.title_line01 = this.titleLn1.toUpperCase();
      this.title_line02 = this.titleLn2.toUpperCase();
  }

  toggleUserBlock() {
      if(this.userBlockStatus == 'collapsed'){
          this.userBlockStatus = 'expanded';
      }else{
          this.userBlockStatus = 'collapsed';
      }
  }

  goHome() {
      
  }
}