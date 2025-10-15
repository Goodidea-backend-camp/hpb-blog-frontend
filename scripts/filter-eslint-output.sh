#!/bin/bash

# ESLint output filter script
# Filter out Nuxt/Nitro debug messages

grep -v -E '^\[nuxt\]' | \
grep -v -E '\[info\]' | \
grep -v -E '^ℹ' | \
grep -v -E '^\[nitro\]'
