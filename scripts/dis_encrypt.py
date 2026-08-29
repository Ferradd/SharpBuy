import dis
import marshal

pyc_path = "SharpBuy_NFA.exe_extracted/GUI.pyc"

with open(pyc_path, "rb") as f:
    f.seek(16)
    code = marshal.load(f)

for const in code.co_consts:
    if hasattr(const, 'co_name') and const.co_name == 'steam_encrypt':
        print("\n================ FUNCTION: steam_encrypt ================")
        dis.dis(const)
