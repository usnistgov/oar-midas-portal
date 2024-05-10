from ctypes import create_string_buffer
import requests #Needed for making HTTP requests
import time #Needed to generate the OAuth timestamp
import urllib.parse #Needed to URLencode the parameter string
from base64 import b64encode  #Needed for create_signature function
import hmac  #Needed for create_signature function
import hashlib #Needed for create_signature functionx
import binascii#Needed for create_signature function
# using flask_restful
from base64 import b64encode, encode
import binascii
from flask import Flask, jsonify, request, json
from flask_restful import Resource, Api
from flask_cors import CORS
import datetime 
import jwt
import os
from dateutil.relativedelta import relativedelta
import numpy as np

# creating the flask app
app = Flask(__name__)
CORS(app)
# creating an API object
api = Api(app)


# resource to get NPS records for user
class NPS(Resource):

	npsURL = ''
	npsTokenURL = ''
	npsTokenSecret = ''

	def __init__(self) -> None:
		self.get_config_values()

	def get(self, username):
		token = self.get_auth_token()
		userid = username

		api_call_headers = {'Authorization': 'Bearer ' + token}
		payload = {
			"nistId": 0,
			"userName": username
		}
		api_call_response = requests.post(self.npsURL, json=payload, headers=api_call_headers)

		print(api_call_response.text)

		response = app.response_class(
     	   	response=api_call_response.text,
        	status=200,
        	mimetype='application/json'
    	)
		#response = jsonify(api_call_response.text)
		response.headers.add('Access-Control-Allow-Origin', '*')

		return response
	
	def get_auth_token(self):

		client_id = 'MIDAS'

		response = requests.post(
			self.npsTokenURL, 
			data={'grant_type': 'client_credentials'},
			auth=(client_id, self.npsTokenSecret),
		)

		return response.json()["access_token"]
	
	def get_config_values(self):
		"""read config values from env file and get API information"""
		try: 
			configurl = os.getenv("CONFIG_URL")
			# print("Read config *********** ")
			resp = requests.get(configurl)
			if resp.status_code >= 400:
				print("Exception reading config data:"+configurl)
				# exit()
			ct = resp.headers.get('content-type','')
        	# print("format:"+ct)
			testconfig = resp.json()
        	# print("testconfig 1:::", testconfig)
			self.npsURL = testconfig['propertySources'][0]['source']['npsURL']
			print('nps URL: ' + self.npsURL)
			self.npsTokenSecret = testconfig['propertySources'][0]['source']['npsTokenSecret']
			print('nps Token Secret: ' + self.npsTokenSecret)
			self.npsTokenURL = testconfig['propertySources'][0]['source']['npsTokenURL']
			print('nps Token URL: ' + self.npsTokenURL)

		except:	
			# nothing for now
			pass
			

#adding temporary class to generate JWT token
class NSD(Resource): 	

	nsdSecret = ''

	def __init__(self) -> None:
		self.get_config_values()
	
	def get_config_values(self):
		"""read config values from env file and get API information"""
		try: 
			configurl = os.getenv("CONFIG_URL")
			# print("Read config *********** ")
			resp = requests.get(configurl)
			if resp.status_code >= 400:
				print("Exception reading config data:"+configurl)
				# exit()
			ct = resp.headers.get('content-type','')
        	# print("format:"+ct)
			testconfig = resp.json()
        	# print("testconfig 1:::", testconfig)
			nsdSecret = testconfig['propertySources'][0]['source']['nsdSecret']

		except:	
			# nothing for now
			pass
	
	def get(self):
		claims = claims = {
			'iss': 'NIST_ASD',
			'iat': datetime.datetime.now(),
			'exp': datetime.datetime.now() + datetime.timedelta(days=10),
			"aud": "ASD_API"
		}
		token = jwt.encode(claims, self.nsdSecret, algorithm='HS256')
		response = app.response_class(
     	   	response=token,
        	status=200,
        	mimetype='application/json'
    	)
		response.headers.add('Access-Control-Allow-Origin', '*')

		return response


api.add_resource(NSD, '/nsdtoken')

# adding the defined resources along with their corresponding urls
api.add_resource(NPS, '/nps/<string:username>')


# driver function
if __name__ == '__main__':
	#app.run(debug = True, port=9092)
	app.run(debug = True, ssl_context='adhoc')

