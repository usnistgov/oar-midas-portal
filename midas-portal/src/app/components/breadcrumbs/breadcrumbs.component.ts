import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { Breadcrumb } from "src/app/models/breadcrumb.model";
import { BreadcrumbService } from "src/app/services/BreadCrumbs/breadCrumb.service";

@Component({ 
  selector: 'app-breadcrumbs', 
  templateUrl: './breadcrumbs.component.html', 
  styleUrls: ['./breadcrumbs.component.css'], 
}) 
export class BreadcrumbComponent { 
  breadcrumbs$: Observable<Breadcrumb[]>; 
 
  constructor(private readonly breadcrumbService: BreadcrumbService) { 
    this.breadcrumbs$ = breadcrumbService.breadcrumbs$; 
  } 
} 
