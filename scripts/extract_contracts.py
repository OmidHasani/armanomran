# -*- coding: utf-8 -*-
from pathlib import Path

base = Path(r'D:\Arman Holding')
out = base / 'scripts' / '_contract_extract.txt'

lines = []

def add(s=''):
    lines.append(s)

try:
    from pypdf import PdfReader
except ImportError:
    import subprocess
    subprocess.check_call(['pip', 'install', 'pypdf', 'python-docx', '-q'])
    from pypdf import PdfReader

from docx import Document

pdf_path = base / 'قرارداد اجاره به شرط تملیک خام.pdf'
add('=== PDF BLANK ===')
add(f'exists {pdf_path.exists()} size {pdf_path.stat().st_size if pdf_path.exists() else None}')
try:
    reader = PdfReader(str(pdf_path))
    add(f'pages {len(reader.pages)}')
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ''
        add(f'--- page {i+1} ---')
        add(text)
except Exception as e:
    add(f'PDF error {type(e).__name__}: {e}')

add()
add('=== DOCX FILLED ===')
docx_path = base / 'قرارداد اجاره به شرط تملیک.docx'
add(f'exists {docx_path.exists()}')
doc = Document(str(docx_path))
for i, p in enumerate(doc.paragraphs):
    if p.text.strip():
        style = p.style.name if p.style else ''
        add(f'P{i}[{style}]: {p.text}')
add('--- tables ---')
for ti, table in enumerate(doc.tables):
    add(f'TABLE {ti}')
    for row in table.rows:
        cells = [c.text.strip().replace('\n', ' | ') for c in row.cells]
        add(' || '.join(cells))

add()
add('=== DOCX RAW ===')
raw_path = base / 'قرارداد خام.docx'
doc2 = Document(str(raw_path))
for i, p in enumerate(doc2.paragraphs):
    if p.text.strip():
        style = p.style.name if p.style else ''
        add(f'P{i}[{style}]: {p.text}')
add('--- tables ---')
for ti, table in enumerate(doc2.tables):
    add(f'TABLE {ti}')
    for row in table.rows:
        cells = [c.text.strip().replace('\n', ' | ') for c in row.cells]
        add(' || '.join(cells))

# also check other docs
for name in ['رزرونامه نگار حیدر ی.docx', 'قراداد مشارکت چشم توتی 2.docx']:
    p = base / name
    if not p.exists():
        continue
    add()
    add(f'=== {name} ===')
    d = Document(str(p))
    for i, para in enumerate(d.paragraphs):
        if para.text.strip():
            add(f'P{i}: {para.text}')
    for ti, table in enumerate(d.tables):
        add(f'TABLE {ti}')
        for row in table.rows:
            cells = [c.text.strip().replace('\n', ' | ') for c in row.cells]
            add(' || '.join(cells))

out.write_text('\n'.join(lines), encoding='utf-8')
print('wrote', out, 'chars', sum(len(x) for x in lines))
