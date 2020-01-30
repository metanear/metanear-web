#!/bin/bash
set -e

rm -rf docs
yarn build
cp -r build docs
