#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
rm -f uwt_bilingual_arxiv.tar.gz
tar -czf uwt_bilingual_arxiv.tar.gz 00README.XXX main.tex
echo "Created uwt_bilingual_arxiv.tar.gz"
