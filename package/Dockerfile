FROM base/archlinux
# TODO: Change base image to a lighter one
# TODO: Make the server more secure and faster (switch to wsgi?)

MAINTAINER Evan Wilde <etcwilde@uvic.ca>
# May 05, 2017

# Copy requirements
COPY req.txt /tmp/req.txt

# Install necessary packages
RUN pacman -Syu --noconfirm && \
  pacman -S --noconfirm postgresql python3 python-pip gcc && \
  pip install -r /tmp/req.txt && rm /tmp/req.txt && \
  pacman -Rsn --noconfirm gcc && rm -r /var/lib/pacman/local/* /var/lib/pacman/sync/* /etc/pacman.d/*

# Copy application
COPY run_server.py /tmp/run_server.py
COPY linvis/ /tmp/linvis/


# Run the server
CMD ["/tmp/run_server.py"]
