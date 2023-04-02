#!/usr/bin/env bash

# DOCKER
# Make sure docker is installed
if ! command -v docker &> /dev/null
then
	echo "docker could not be found"
	exit
else
	echo "docker is already installed"
fi


# DOCKER COMPOSE
# Make sure docker compose is installed
if ! command -v docker-compose &> /dev/null
then
	echo "docker-compose could not be found"

	# Install docker compose
	DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
	mkdir -p $DOCKER_CONFIG/cli-plugins
	curl -SL https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
else
	echo "docker-compose is already installed"
fi


# Success
echo "Installation complete!"
echo "🎉 🎉 🎉 🥳 🎉 🎉 🎉"

echo "Removing myself..."
rm $0