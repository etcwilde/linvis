FROM alpine:3.5
# TODO: Make the server more secure and faster (switch to wsgi?)
LABEL maintainer Evan Wilde <etcwilde@uvic.ca>
# May 05, 2017

# Add the www-data user
RUN adduser -D -H www-data

# Copy requirements
COPY req.txt /tmp/req.txt

# Install packages and dependencies
RUN apk add --no-cache python3 uwsgi-python3 py3-psycopg2 su-exec \
  && pip3 install -r /tmp/req.txt && rm -r /root/.cache/pip/*

# Copy Application
COPY linvis.ini /app/linvis.ini
COPY linvis/ /app/linvis
RUN chown -R www-data:www-data /app/linvis && chown www-data:www-data /app/linvis.ini

EXPOSE 5000
WORKDIR /app
CMD ["su-exec", "www-data", "uwsgi", "linvis.ini"]
