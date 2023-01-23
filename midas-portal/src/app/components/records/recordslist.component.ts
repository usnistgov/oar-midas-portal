import {Component} from '@angular/core';
import {DynamicDialogRef} from 'primeng/dynamicdialog';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';

@Component({
    template: `
         <p-table [value]="testvalues" [paginator]="true" [rows]="5" [responsive]="true">
            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="name">Name <p-sortIcon field="vin"></p-sortIcon></th>
                    <th pSortableColumn="price">Brand <p-sortIcon field="price"></p-sortIcon></th>
                    <th pSortableColumn="inventoryStatus">Status <p-sortIcon field="inventoryStatus"></p-sortIcon></th>
                    <th style="width:4em"></th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body">
                <tr>
                    <td></td>
                    <td></td>
                    <td><span [class]="'product-badge status-'"></span></td>
                    <td>
                        <button type="button" pButton icon="pi pi-search" (click)="alert('test')"></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `
})
export class RecordsList {

    constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) { }
    
    alert( testit: string){
        console.log(testit);

    }
    testvalues: string[] = [
        "Bamboo Watch", 
        "Black Watch", 
        "Blue Band", 
        "Blue T-Shirt", 
        "Bracelet", 
        "Brown Purse", 
        "Chakra Bracelet",
        "Galaxy Earrings",
        "Game Controller",
        "Gaming Set",
        "Gold Phone Case"]
}