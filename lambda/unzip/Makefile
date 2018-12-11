NAME=$(shell basename $(shell pwd))
DST=../../build/lambda/$(NAME).zip
$(DST): nodejs/package.json
	echo "Building $(NAME)"; cd nodejs && npm install && cd .. && zip -r -q $(DST) .
