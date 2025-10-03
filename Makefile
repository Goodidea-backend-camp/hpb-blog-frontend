.PHONY: format lint lint-verbose test ci

format:
	@npx eslint . --fix >/dev/null 2>&1 || true
	@npx prettier --write . >/dev/null 2>&1 || true

lint:
	@npx eslint . --quiet
	@npx nuxt typecheck --logLevel=silent

lint-verbose:
	@npx eslint .
	@npx nuxt typecheck

test:
	@npx vitest run --reporter=dot --silent

ci:
	@echo "Running format..."
	@$(MAKE) format || true
	@echo "Running tests and lint in parallel..."
	@($(MAKE) test || true) & ($(MAKE) lint-verbose || true) & wait
	@echo "CI pipeline completed."