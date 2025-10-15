#!/bin/bash

# Test output filter script
# Filter out Nuxt/Nitro debug messages

grep -v -E '^\[nuxt\]' | \
grep -v -E '\[info\]' | \
grep -v -E '^ℹ' | \
grep -v -E '^\[nitro\]' | \
grep -v -E '.*\[.*ms\]' | \
grep -v -E '.*↳' | \
grep -v -E '\(node:.*\) Warning:' | \
grep -v -E 'Use.*--trace-warnings' | \
grep -v -E '^·+$' | \
grep -v -E '@tailwindcss' | \
grep -v -E 'stdout \|' | \
grep -v -E '^\[nuxt-app\]' | \
grep -v -E 'page:loading:' | \
grep -v -E 'page:finish' | \
grep -v -E 'app:created' | \
grep -v -E 'app:beforeMount' | \
grep -v -E 'app:mounted' | \
grep -v -E 'vue:setup' | \
grep -v -E 'app:suspense:resolve' | \
grep -v -E '<ref \*\d+>' | \
grep -v -E 'Symbol\(' | \
grep -v -E '_uid:' | \
grep -v -E '_component:' | \
grep -v -E '_props:' | \
grep -v -E '_container:' | \
grep -v -E '_context:' | \
grep -v -E '_instance:' | \
grep -v -E 'HTMLDivElement' | \
grep -v -E 'HTMLDocument' | \
grep -v -E 'ReactiveEffect' | \
grep -v -E 'EffectScope' | \
grep -v -E '^\s+\[\[3[0-9]m' | \
grep -v -E '^\s\s+\w+:' | \
grep -v -E '^\s+\[3[0-9]m' | \
grep -v -E '\[Circular \*\d+\]' | \
grep -v -E ': \[\d+m' | \
grep -v -E '\[\d+m<' | \
grep -v -E 'reload:' | \
grep -v -E 'parent:' | \
grep -v -E 'next:' | \
grep -v -E 'subTree:' | \
grep -v -E 'update:' | \
grep -v -E 'job:' | \
grep -v -E 'render:' | \
grep -v -E 'proxy:' | \
grep -v -E 'exposed:' | \
grep -v -E 'exposeProxy:' | \
grep -v -E 'provides:' | \
grep -v -E 'accessCache:' | \
grep -v -E 'renderCache:' | \
grep -v -E 'propsOptions:' | \
grep -v -E 'emitsOptions:' | \
grep -v -E 'emit:' | \
grep -v -E 'emitted:' | \
grep -v -E 'propsDefaults:' | \
grep -v -E 'inheritAttrs:' | \
grep -v -E 'suspense:' | \
grep -v -E 'asyncDep:' | \
grep -v -E 'asyncResolved:' | \
grep -v -E 'isMounted:' | \
grep -v -E 'isUnmounted:' | \
grep -v -E 'isDeactivated:' | \
grep -v -E '__vue_app__' | \
grep -v -E '_vnode:' | \
grep -v -E '^\s+\},?\s*$' | \
grep -v -E '^\s+\]\s*$' | \
grep -v -E '^\s+\}$' | \
grep -v -E '^\s*],?\s*$' | \
cat -s
