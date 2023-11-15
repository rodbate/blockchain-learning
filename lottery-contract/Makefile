
NETWORK ?= hardhat

.PHONY: compile
compile:
	@yarn hardhat compile

.PHONY: clean
clean:
	@yarn hardhat clean

.PHONY: format
format:
	@yarn prettier --plugin prettier-plugin-solidity --write .

.PHONY: deploy
deploy: clean format compile
	@yarn hardhat --network ${NETWORK} deploy

.PHONY: test
test:
	@yarn hardhat --network ${NETWORK} test
