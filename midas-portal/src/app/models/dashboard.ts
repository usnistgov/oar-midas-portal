import { Type } from "@angular/core";

export interface Widget {
    id: number;
    label: string;
    longLabel?: string;
    content: Type<unknown>;
    rows?: number;
    columns?: number;
    backgroundColor?: string;
    textColor?: string;
}

export interface Dap {
    id: string;
    name: string;
    title?: string;
    owner: string;
    primaryContact: string;
    modifiedDate: Date;
    createdDate?: Date;
    status?: string;
    location: string;
    type?: string;
    organizationUnit?: string;
    orgNames?: string[];
    keywords?: string[];
    dataCategories?: string[];
    authors?: string[];
    theme?: string[];
}

export interface Dmp {
    id: string;
    name: string;
    title?: string;
    owner: string;
    primaryContact: string;
    modifiedDate: Date;
    createdDate?: Date;
    startDate?: string;
    type?: string;
    status?: string;
    hasPublication?: boolean;
    organizationUnit?: string;
    orgNames?: string[];
    keywords?: string[];
    fundingType?: string;
    fundingNumber?: string;
    dataCategories?: string[];
}

export interface File {
    id: string;
    name: string;
    usage: String;
    fileCount: number;
    modifiedDate: Date;
    location: string;
}

export interface Review {
    id: string;
    title: string;
    submitterName: string;
    currentReviewer: string;
    currentReviewStep: string;
}