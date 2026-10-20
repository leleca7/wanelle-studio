#!/usr/bin/env python3
"""Simula (padrão) ou cria issues de governança apenas no Wanelle Studio."""
import argparse
import json
import subprocess
from pathlib import Path

p = argparse.ArgumentParser(description='Simulação segura de backlog Wanelle')
p.add_argument('--apply', action='store_true', help='criar issues de verdade (requer GitHub CLI autenticada)')
a = p.parse_args()
repo = 'leleca7/wanelle-studio'
items = json.loads((Path(__file__).parent/'backlog.json').read_text(encoding='utf8'))
for item in items:
    if not a.apply:
        print('[SIMULAÇÃO]', repo, item['title'])
    else:
        result = subprocess.run(['gh', 'issue', 'create', '--repo', repo, '--title', item['title'], '--body', item['body']], check=True, text=True, capture_output=True)
        print('[CRIADA]', result.stdout.strip())
