#!/bin/bash

# TypeCheck output filter script
# Filter out Nuxt/Nitro debug messages and performance-related messages

grep -v -E '^\[nuxt\]' | \
grep -v -E '\[info\]' | \
grep -v -E '^ℹ' | \
grep -v -E '^\[nitro\]' | \
grep -v -E '.*\[.*ms\]' | \
grep -v -E '.*↳' | \
grep -v -E '@tailwindcss'
