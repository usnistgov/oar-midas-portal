import pdb
import argparse
import sys
import os
import traceback


class ConfigParams(object):
    def __init__(self):
        self._client_id = None
        self._client_secret = None

    @property
    def client_id(self):
        return self._client_id
    
    @client_id.setter
    def client_id(self, value):
        self._client_id = value

    @client_id.deleter
    def client_id(self):
        del self._client_id

    @property
    def client_secret(self):
        return self._client_secret
    
    @client_secret.setter
    def client_secret(self, value):
        self._client_secret = value

    @client_secret.deleter
    def client_secret(self):
        del self._client_secret