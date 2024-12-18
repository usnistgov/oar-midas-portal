#! /bin/bash
#
port=9092
script=/dev/oar-midas-portal/python/nps_server/nps_broker.py
[ -f "$script" ] || script=/app/dist/npsbroker/bin/nps_broker.py

echo
echo Access the NPS Broker service at http://localhost:$port/
echo

echo '++' uwsgi --plugin python --http-socket :$port --wsgi-file $script 
uwsgi --plugin python --http-socket :$port --wsgi-file $script

