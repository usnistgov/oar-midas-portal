import config.configParams
import json

cp = config.configParams.ConfigParams()
def get_nps_credentials():
    """read environment.json file and get values for NPS client id and secret"""
    try:
        configfile = '../../midas-portal/src/assets/environment.json'
        print('Read config *********')
        with open(configfile) as f:
            d = json.load(f)
            print('CLIENT: ' + d["NPSClientID"])
            print('SECRET: ' + d["NPSClientSecret"])
            cp.client_id = d["NPSClientID"]
            cp.client_secret = d["NPSClientSecret"]

    except:
        cp.client_id = 'ERROR'
        cp.client_secret = 'ERROR'
        print('Error reading config file')
    
    return cp