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
	(npx eslint . 2>&1 | grep -v -E '^\[nuxt\]|\[info\]|^ℹ|\[nitro\]') & \
	(npx nuxt typecheck 2>&1 | grep -v -E '^\[nuxt\]|\[info\]|^ℹ|\[nitro\]|.*\[.*ms\]|.*↳|@tailwindcss') & \
	wait

test:
	@npx vitest run 

test-llm:
	@set -o pipefail; npx vitest run --reporter=dot 2>&1 | \
		grep -v -E '^\[nuxt\]|\[info\]|^ℹ|\[nitro\]|.*\[.*ms\]|.*↳|\(node:.*\) Warning:|Use.*--trace-warnings|^·+$$|@tailwindcss|stdout \||\[nuxt-app\]|page:loading:|page:finish|app:created|app:beforeMount|app:mounted|vue:setup|app:suspense:resolve|<ref \*\d+>|Symbol\(|_uid:|_component:|_props:|_container:|_context:|_instance:|HTMLDivElement|HTMLDocument|ReactiveEffect|EffectScope|^\s+\[\[3[0-9]m|^\s\s+\w+:|^\s+\[3[0-9]m|\[Circular \*\d+\]|: \[\d+m|\[\d+m<|reload:|parent:|next:|subTree:|update:|job:|render:|proxy:|exposed:|exposeProxy:|withProxy:|provides:|accessCache:|renderCache:|propsOptions:|emitsOptions:|emit:|emitted:|propsDefaults:|inheritAttrs:|suspense:|asyncDep:|asyncResolved:|isMounted:|isUnmounted:|isDeactivated:|__vue_app__|_vnode:|^\s+\},?\s*$$|^\s+\]\s*$$|^\s+\}$$|^\s*\],?\s*$$'

ci:
	@echo "Running format..."
	@$(MAKE) fmt
	@echo "Running tests and lint in parallel..."
	@$(MAKE) test & $(MAKE) lint & wait
	@echo "CI pipeline completed."

ci-llm:
	@$(MAKE) fmt-llm
	@$(MAKE) test-llm & $(MAKE) lint-llm & wait
