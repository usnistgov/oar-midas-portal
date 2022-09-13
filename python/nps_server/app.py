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
from flask import Flask, jsonify, request
from flask_restful import Resource, Api

# creating the flask app
app = Flask(__name__)
# creating an API object
api = Api(app)


# resource to get NPS records for user
class NPS(Resource):

	def get(self, num):
		token = self.get_auth_token()
		doId = num
		api_url = 'https://tsapps-t.nist.gov/nps/npsapi' + '/api/DataSet/Reviewers?dataSetID=' + str(doId)
		print('api_url: ' + api_url)

		api_call_headers = {'Authorization': 'Bearer ' + token}
		api_call_response = requests.get(api_url, headers=api_call_headers)

		print(api_call_response.text)
	
	def get_auth_token(self):

		url = 'https://tsapps-t.nist.gov/nps/npsidp/connect/token'
		client_id = 'MIDAS'
		client_secret = 'a521G90T3716n0x1'

		response = requests.post(
			url, 
			data={'grant_type': 'client_credentials'},
			auth=(client_id, client_secret),
		)

		return response.json()["access_token"]



# adding the defined resources along with their corresponding urls
api.add_resource(NPS, '/user/<int:num>')


# driver function
if __name__ == '__main__':
	app.run(debug = True, ssl_context='adhoc')

