#!/bin/bash

gcloud compute target-https-proxies update doughnut-app-service-map-target-proxy-2 \
--global \
--ssl-certificates=star-odd-e-com \
--global-ssl-certificates \
