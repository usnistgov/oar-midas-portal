/**
 * Classes used to support the configuration infrastructure.  
 * 
 * Configuration parameters used by the application are defined in the form of
 * interfaces.  The AppConfig is an implementation of the app-level configuration
 * interface, LPSConfig, that can be injected into Components.  
 */
 import { Injectable } from '@angular/core';
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
/**
 * URLs to remote locations used as links in templates
 */
 export interface WebLocations {

    /**
     * the institutional home page (e.g. NIST)
     */
    orgHome: string,

    /**
     * the MIDAS portal base URL.  
     */
    portalBase?: string,

    /**
     * the home page for the MIDAS
     */
    portalHome?: string,

    /**
     * the MIDAS search page (i.e. the SDP search page)
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
