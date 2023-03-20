import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


/**
 * URLs to remote locations used as links in templates
 */
 export interface WebLocations {

    /**
     * the institutional home page (e.g. NIST)
     */
    orgHome: string,

    /**
     * the midas portal base URL.  
     */
    portalBase?: string,


    /**
     * search service
     */
    midasSearch?: string,

    /**
     * the URL to fetch taxonomy list
     */
    taxonomyService?: string,

    /**
     * other locations are allowed
     */
    [locName: string]: any;
}


/**
 * the aggregation of parameters needed to configure the Landing Page Service
 */
 export interface AppConfigInterface {

    /**
     * URLs used in links plugged into templates
     */
    locations: WebLocations;


    /**
     * Base URL for customization service to use
     */
     authAPI?: string;

    /**
     * Base URL for metadata service to use
     */
    metadataAPI?: string;

    /**
     * Base URL for metrics service to use
     */
    metricsAPI?: string;

    /**
     * the interface version to display (in the head bar)
     */
    appVersion?: string;

    /**
     * Google Analytics code
     */
    gaCode?: string;

    /**
     * other parameters are allowed
     */
    [propName: string]: any;
}

export class AppConfig implements AppConfigInterface{
 
    locations: WebLocations;
    metadataAPI: string;
    authAPI: string;
    appVersion: string;
    gaCode     : string;
    metricsAPI: string;

  
       /**
     * create an AppConfig directly from an AppConfigInterface
     * @param params   the input data
     */
        constructor(params: AppConfigInterface) {

            // for (var key in params)
            // this[key] = params[key];
            this.inferMissingValues();
        }

        /*
    * set some defaults for missing configuration values based on what has been
    * set.  
    */
    private inferMissingValues(): void {
        if (!this.locations.portalBase) {
        this.locations.portalBase = this.locations.orgHome;
        if (!this.locations.portalBase.endsWith('/'))
            this.locations.portalBase += '/';
        this.locations.portalBase += '/';
        }

        if(!this.locations.taxonomyService)
            this.locations.taxonomyService = this.locations.portalBase + "rmm/taxonomy";
       

        if (!this.metadataAPI) this.metadataAPI = "";
        if (!this.authAPI) this.authAPI = "https://mdsdev.nist.gov/sso/";
        if (!this.metricsAPI) this.metricsAPI = "";

        // Set default Google Analytic code to dev
        if (! this.gaCode) this.gaCode = "UA-115121490-8";

    }

    get<T>(param: string, defval?: T | null): T | null | undefined| string {
        let names: string[] = param.split(".");
        let val: any = this;
        for (var i = 0; i < names.length; i++) {
        if (typeof val != "object")
            return defval;
        val = val[names[i]];
        }
        return (val != undefined) ? val : defval;
    }

}