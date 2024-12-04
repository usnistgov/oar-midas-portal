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

		print('npsURL: ' + self.npsURL)
		if self.npsURL == '':
			self.get_config_values()

		self.npsURL = 'https://tsapps-t.nist.gov/nps/npsapi/api/DataSet/ReviewsForUser'
		self.nsdSecret = 'Tc567FxCs90tOvy6cWZyPamkC7c8hjbQzO2IKwMt7eVmdSIaNuqp'
		self.npsTokenSecret = 'a521G90T3716n0x1'
		print('npsURL: ' + self.npsURL)


		claims = claims = {
			'iss': 'NIST_ASD',
			'iat': datetime.datetime.now(),
			'exp': datetime.datetime.now() + datetime.timedelta(days=10),
			"aud": "ASD_API",
			"scope": "dataset",
			"username": username
		}
		token = jwt.encode(claims, self.nsdSecret, algorithm='HS256')
		userid = username
		print(token)

		api_call_headers = {'Authorization': 'Bearer ' + token,
					  'Content-Type': 'application/json',
					  'Accept': 'application/json'}
		payload = {
			"nistId": 0,
			"userName": username
		}
		print(self.npsURL)
		api_call_response = requests.post(self.npsURL, json=payload, headers=api_call_headers)
		print(api_call_response)
		
		response = jsonify(api_call_response.text)

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
			print(os.environ)
			#configurl = os.getenv("CONFIG_URL")
			configurl = "http://localhost:8084/midas-nps/local"
			print("Read config *********** ")
			resp = requests.get(configurl)
			print("code: " + str(resp.status_code))
			if resp.status_code >= 400:
				print("Exception reading config data:"+configurl)
				# exit()
			ct = resp.headers.get('content-type','')
        	# print("format:"+ct)
			testconfig = resp.json()
        	# print("testconfig 1:::", testconfig)
			self.npsURL = testconfig['propertySources'][0]['source']['npsURL']
			self.npsTokenSecret = testconfig['propertySources'][0]['source']['nsdSecret']
			self.npsTokenURL = testconfig['propertySources'][0]['source']['npsTokenURL']

		except Exception as e:	
			print("Error reading config file")
			print(str(e))
			
# adding the defined resources along with their corresponding urls
api.add_resource(NPS, '/nps/<string:username>')


# driver function
if __name__ == '__main__':
	#app.run(debug = True, port=9092)
	app.run(debug = True, ssl_context='adhoc')

