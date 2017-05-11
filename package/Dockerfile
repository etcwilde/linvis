FROM base/archlinux
# TODO: Change base image to a lighter one
# TODO: Make the server more secure and faster (switch to wsgi?)

MAINTAINER Evan Wilde <etcwilde@uvic.ca>
# May 05, 2017

# Copy necessary files
COPY req.txt /tmp/req.txt
COPY run_server.py /tmp/run_server.py
COPY linvis/ /tmp/linvis/
COPY app.conf /tmp/linvis/

# Install necessary packages
RUN pacman -Syu --noconfirm && \
  pacman -S --noconfirm postgresql python3 python-pip gcc && \
  pip install -r /tmp/req.txt && rm /tmp/req.txt && \
  pacman -Rsn --noconfirm gcc && rm -r /var/lib/pacman/local/* /var/lib/pacman/sync/*

# Run the server
CMD ["/tmp/run_server.py"]
