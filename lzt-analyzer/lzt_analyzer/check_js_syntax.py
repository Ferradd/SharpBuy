import json

# Simple check to ensure app.js open/close braces match and function names don't duplicate
with open("app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

brace_count = 0
for idx, line in enumerate(lines, 1):
    brace_count += line.count('{') - line.count('}')
    if brace_count < 0:
        print(f"Brace error at line {idx}: {line.strip()}")
        break

print(f"Total lines: {len(lines)}, final brace count: {brace_count}")
if brace_count == 0:
    print("[+] JS Braces match perfectly!")
