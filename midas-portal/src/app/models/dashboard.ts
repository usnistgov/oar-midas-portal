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
    owner: string;
    primaryContact: string;
    modifiedDate: Date;
}

export interface Dmp {
    id: string;
    name: string;
    owner: string;
    primaryContact: string;
    modifiedDate: Date;
    type?: string | undefined;
    status?: string | undefined;
    hasPublication?: boolean;
    organizationUnit?: string;
    keywords?: string[];
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