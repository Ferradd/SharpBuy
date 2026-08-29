import dis
import marshal
import os

pyc_path = "scripts/SharpBuy_NFA.exe_extracted/GUI.pyc"
# If pyinstxtractor put it in cwd:
if not os.path.exists(pyc_path):
  pyc_path = "SharpBuy_NFA.exe_extracted/GUI.pyc"

print("Reading", pyc_path)
with open(pyc_path, "rb") as f:
  # Skip header (16 bytes in Python 3.13)
  f.seek(16)
  code = marshal.load(f)

print("Constants in GUI.pyc:")
for const in code.co_consts:
  if isinstance(const, str) and len(const) > 2:
    print(" - Str:", repr(const))
  elif hasattr(const, 'co_name'):
    print(" - Function:", const.co_name)
    for sub_const in const.co_consts:
      if isinstance(sub_const, str) and len(sub_const) > 2:
        print("    * SubStr:", repr(sub_const))
