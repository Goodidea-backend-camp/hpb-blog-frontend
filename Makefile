.PHONY: format lint test

format:
	@npm run lint:fix >/dev/null 2>&1 || true
	@npm run format >/dev/null 2>&1 || true

lint:
	@npm run lint --silent

test:
	@npm run test -- --reporter=dot --silent