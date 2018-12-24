LAMBDAS=$(shell for l in $$(ls ./lambda | grep -v Makefile);do echo lambda/$$l;done)
TEMPLATES=$(shell for l in $$(ls ./templates );do echo templates/$$l;done)
.PHONY: build website lambda check QnA assets
build:
	mkdir -p build; mkdir -p build/lambda; mkdir -p build/assets 

assets:build ./assets/*
	cp ./assets/* build/assets
lambda:  build
	make -C ./lambda

check: build
	for l in $(TEMPLATES); do	\
		$$l/bin/check.js; \
		cp $$l/build/* build;\
	done;			

website: build
	$(MAKE) -C ./website && cp logo/*.jpg build/

upload: lambda check website assets
	./bin/upload.sh

.PHONY:lambda build/lambda/%.zip
