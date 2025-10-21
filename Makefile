SHELL := /bin/bash

.PHONY: fmt fmt-llm lint lint-llm test test-llm ci ci-llm

fmt:
	@npx eslint . --fix || true
	@npx prettier --write . || true

fmt-llm:
	@npx eslint . --fix >/dev/null 2>&1 || true
	@npx prettier --write . >/dev/null 2>&1 || true

lint:
	@(npx eslint .) & (npx nuxt typecheck) & wait

lint-llm:
	@set -o pipefail; \
	(npx eslint . 2>&1 | scripts/filter-eslint-output.sh) & \
	(npx nuxt typecheck 2>&1 | scripts/filter-typecheck-output.sh) & \
	wait

test:
	@npx vitest run 

test-llm:
	@set -o pipefail; npx vitest run --reporter=dot 2>&1 | scripts/filter-test-output.sh

ci:
	@echo "Running format..."
	@$(MAKE) fmt
	@echo "Running tests and lint in parallel..."
	@$(MAKE) test & $(MAKE) lint & wait
	@echo "CI pipeline completed."

ci-llm:
	@$(MAKE) fmt-llm
	@$(MAKE) test-llm & $(MAKE) lint-llm & wait
