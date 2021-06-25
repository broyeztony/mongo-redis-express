#!/bin/bash

# Login to the container repository like AWS ECR

# Build and Deploy Docker image
docker build . -t yubo:latest

# docker tag yubo:latest ...
# docker push ...