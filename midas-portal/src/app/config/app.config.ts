import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import * as rxjs from 'rxjs';
import * as rxjsop from 'rxjs/operators';

import { environment } from 'src/environments/environment';



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

@Injectable({
    providedIn: 'root'
})
export class AppConfig implements AppConfigInterface{
 
    locations: WebLocations;
    metadataAPI: string;
    authAPI: string;
    authRedirect: string;
    NPSAPI: string;
    appVersion: string;
    gaCode     : string;
    metricsAPI: string;
    dmpAPI: string;
    dapAPI: string;
    groupAPI: string;
    dmpUI: string;
    dapUI: string;
    nextcloudUI: string;
    npsUI: string;

 
  
       /**
     * create an AppConfig directly from an AppConfigInterface
     * @param params   the input data
     */
        constructor(private http: HttpClient) {

            this.getRemoteConfig().subscribe(data => {
                if (data.authAPI) this.authAPI = data.authAPI;
                if (data.authRedirect) this.authRedirect = data.authRedirect;
                if (data.NPSAPI) this.NPSAPI = data.NPSAPI;
                if (data.dmpAPI) this.dmpAPI = data.dmpAPI;
                if (data.dapAPI) this.dapAPI = data.dapAPI;
                if (data.dmpUI) this.dmpUI = data.dmpUI;
                if (data.dapUI) this.dapUI = data.dapUI;
                if (data.npsUI) this.npsUI = data.npsUI;
                if (data.nextcloudUI) this.nextcloudUI = data.nextcloudUI;
                //set defaults for any missing values
                this.inferMissingValues();
            });
        }

        /*
    * set some defaults for missing configuration values based on what has been
    * set.  
    */
    private inferMissingValues(): void {
        //if (!this.locations.portalBase) {
        //this.locations.portalBase = this.locations.orgHome;
        //if (!this.locations.portalBase.endsWith('/'))
        //    this.locations.portalBase += '/';
        //this.locations.portalBase += '/';
        //}

        //if(!this.locations.taxonomyService)
        //    this.locations.taxonomyService = this.locations.portalBase + "rmm/taxonomy";
       

        //if (!this.metadataAPI) this.metadataAPI = "";
        if (!this.authAPI) this.authAPI = "https://mdsdev.nist.gov/sso/auth/_logininfo";
        if (!this.authRedirect) this.authRedirect = "https://mdsdev.nist.gov/sso/saml/login?redirectTo=https://inet.nist.gov";
        if (!this.NPSAPI) this.NPSAPI = "https://tsapps-t.nist.gov/nps/npsapi/api/DataSet/ReviewsForUser";
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

    getRemoteConfig(srcurl?: string): Observable<any> {

        if(!srcurl) srcurl = environment.config_url;

        return this.http.get(srcurl);

        /*return this.http.get(srcurl).pipe(
            rxjsop.map<AppConfigInterface, AppConfigInterface>((resp:AppConfigInterface) => {
                var cfg: AppConfigInterface = withDefaults(resp as AppConfigInterface);
                return cfg;
            }),
            rxjsop.catchError(err => {
                console.error("Failed to download configuration: " + JSON.stringify(err));
                return rxjs.throwError(err);
            })
        );*/
    }

}

export function withDefaults(config: AppConfigInterface): AppConfigInterface {

    let out: AppConfigInterface = JSON.parse(JSON.stringify(config));

    //define application defaults here

    return out;
        
}

export interface userObject{


    userId: string,
    userName: string,
    userLastName: string,
    userEmail: string,
    userGroup: string,
    userDiv: string,
    userDivNum: string,
    userOU: string

}