# Dockerfile for creating a drydock container
# VERSION        0.0.1
# DOCKER-VERSION 0.5.0

FROM ubuntu:12.04

MAINTAINER Jean-Sébastien Tremblay "jeansebtr@xpensia.com"

# Basic environment
EXPOSE 3000
ENV PORT 3000
ENV HOME /app
ENV PATH /node/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin


# system dependencies
RUN apt-get update && apt-get -y install build-essential python git

# node js dependency
ADD http://nodejs.org/dist/v0.10.15/node-v0.10.15-linux-x64.tar.gz /node.tar.gz
RUN tar -zxf /node.tar.gz && rm /node.tar.gz && mv /node-v0.10.15-linux-x64 /node

# add non-root user
RUN useradd -d /app -u 1000 -U app

# install app files
ADD . /app
RUN chown -R app:app /app

# install app dependencies
RUN cd /app && SAVE_PATH=$PATH su app -m -c 'PATH=$SAVE_PATH HOME=/app npm install'
