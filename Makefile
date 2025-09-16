.PHONY: format lint test

format:
	@npx eslint . --fix >/dev/null 2>&1 || true
	@npx prettier --write . >/dev/null 2>&1 || true

lint:
	@npx eslint . --quiet
	@npx nuxt typecheck --logLevel=silent

test:
	@npx vitest run --reporter=dot --silent