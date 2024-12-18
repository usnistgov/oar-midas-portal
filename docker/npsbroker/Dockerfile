FROM python:3.8-bookworm

RUN apt-get update && apt-get install -y curl wget less sudo git zip unzip   \
                                         p7zip-full ca-certificates uuid-dev \
                                         build-essential python3-distutils   \
                                         libcap-dev libpcre3-dev \
                                         uwsgi uwsgi-src 
RUN uwsgi --build-plugin "/usr/src/uwsgi/plugins/python python" && \
    mv python_plugin.so /usr/lib/uwsgi/plugins/python_plugin.so && \
    chmod 644 /usr/lib/uwsgi/plugins/python_plugin.so
                                         
COPY cacerts/README.md cacerts/*.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV REQUESTS_CA_BUNDLE

RUN pip install -U flask flask-restful flask-cors pyopenssl 

RUN sed --in-place -e '/CREATE_MAIL_SPOOL/ s/=yes/=no/' /etc/default/useradd
ARG devuser=developer
ARG devuid=1000
RUN grep -qs :${devuid}: /etc/group || \
    groupadd --gid $devuid $devuser
RUN grep -Pqs ":${devuid}:\d+:" /etc/passwd || \
    useradd -m --comment "OAR Developer" --shell /bin/bash \
            --gid $devuid --uid $devuid $devuser
RUN echo $devuser "ALL=(ALL)" NOPASSWD:ALL > /etc/sudoers.d/90-developers

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod a+rx /usr/local/bin/entrypoint.sh

VOLUME /dev/oar-midas-portal
VOLUME /app/dist

RUN mkdir -p /dev/oar-midas-portal /app && chmod a+rwx /app
WORKDIR /dev/oar-midas-portal

ENV PYTHONPATH /dev/oar-midas-portal/python/dist/npsbroker/lib/python:/app/dist/npsbroker/lib/python

ARG devuser=developer
USER $devuser
EXPOSE 9092
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]