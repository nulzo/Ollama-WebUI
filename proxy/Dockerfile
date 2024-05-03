FROM nginx

ARG SERVER_NAME
ARG CERT_COUNTRY
ARG CERT_STATE
ARG CERT_LOC
ARG CERT_ORG
ARG CERT_ORGUNIT

# Replace the default config with our config template
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /nginx.conf.template

# Set the server name in the environment to be used by envsubst
ENV SERVER_NAME=${SERVER_NAME}

# Nginx config does not support env vars by default, use envsubst to replace template vars with their actual values
RUN envsubst '\$SERVER_NAME' < /nginx.conf.template > /etc/nginx/conf.d/nginx.conf