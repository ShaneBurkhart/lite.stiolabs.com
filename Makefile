# /Makefile
.PHONY: build up down restart c logs ps

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart: down up logs

c:
	docker-compose run --rm $(or $(word 2, $(MAKECMDGOALS)), python) bash

logs:
	docker-compose logs -f $(or $(word 2, $(MAKECMDGOALS)),)

ps:
	docker-compose ps

%:
	docker-compose $(MAKECMDGOALS)