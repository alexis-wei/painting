# Makefile
SHELL := bash

install:
	cd ./frontend && npm install

lint: install
	cd ./frontend && npm run lint
