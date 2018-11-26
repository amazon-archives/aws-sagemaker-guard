LAMBDAS=$(shell for l in $$(ls ./lambda | grep -v Makefile);do echo lambda/$$l;done)
TEMPLATES=$(shell for l in $$(ls ./templates );do echo templates/$$l;done)
.PHONY: build website lambda check
build:
	mkdir -p build; mkdir -p build/lambda; 

lambda:  build
	make -C ./lambda

check: build
	for l in $(TEMPLATES); do	\
		$$l/bin/check.js; \
		cp $$l/build/* build;\
	done;			

website: build
	$(MAKE) -C ./website

upload: lambda check website
	./bin/upload.sh

.PHONY:lambda build/lambda/%.zip
