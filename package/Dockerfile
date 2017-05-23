FROM alpine:3.5
# TODO: Make the server more secure and faster (switch to wsgi?)
LABEL maintainer Evan Wilde <etcwilde@uvic.ca>
# May 05, 2017

# Copy requirements
COPY req.txt /tmp/req.txt

# Install packages and dependencies
RUN apk add --no-cache python3 uwsgi-python3 py3-psycopg2 && \
  pip3 install -r /tmp/req.txt && rm -r /root/.cache/pip/*

# Copy Application
COPY linvis.ini /tmp/linvis.ini
COPY linvis/ /tmp/linvis

WORKDIR /tmp

EXPOSE 5000

CMD ["uwsgi", "linvis.ini"]
