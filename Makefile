COMPOSE ?= docker compose
COMPOSE_FILE ?= docker-compose.yml
CERT_DIR ?= certs
CERT_FILES ?= $(CERT_DIR)/server.cert $(CERT_DIR)/server.key

.PHONY: help up down stop restart build logs ps clean clean-all clean-certs clean-volumes

help:
	@echo "Available targets:"
	@echo "  make up            - Start containers in detached mode"
	@echo "  make down          - Stop containers"
	@echo "  make stop          - Stop containers without removing them"
	@echo "  make restart       - Restart the stack"
	@echo "  make build         - Build images"
	@echo "  make logs          - Follow logs"
	@echo "  make ps            - Show container status"
	@echo "  make clean         - Stop containers and remove compose volumes"
	@echo "  make clean-certs   - Delete local SSL certificate files"
	@echo "  make clean-all     - Remove containers, compose volumes, and SSL cert files"

up:
	$(COMPOSE) -f $(COMPOSE_FILE) up 

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

stop:
	$(COMPOSE) -f $(COMPOSE_FILE) stop

restart:
	$(COMPOSE) -f $(COMPOSE_FILE) restart

build:
	$(COMPOSE) -f $(COMPOSE_FILE) build

logs:
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f

ps:
	$(COMPOSE) -f $(COMPOSE_FILE) ps

clean-volumes:
	$(COMPOSE) -f $(COMPOSE_FILE) down -v --remove-orphans

clean-certs:
	rm -f $(CERT_FILES)

clean-all: clean-volumes clean-certs

clean: clean-volumes