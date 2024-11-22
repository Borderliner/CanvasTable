#!/bin/bash

pnpm build:dist
pnpm build:umd
pnpm publish
