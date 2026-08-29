import dis
import marshal
import sys

pyc_path = "SharpBuy_NFA.exe_extracted/GUI.pyc"

with open(pyc_path, "rb") as f:
    f.seek(16)
    code = marshal.load(f)

print("Disassembling GUI.pyc functions...\n")

def inspect_code_obj(co, indent=0):
    prefix = "  " * indent
    print(f"{prefix}=== Function: {co.co_name} (args: {co.co_argcount}, vars: {co.co_varnames}) ===")
    
    # Print instructions
    for instr in dis.get_instructions(co):
        if instr.opname in ('LOAD_GLOBAL', 'LOAD_METHOD', 'CALL_METHOD', 'CALL_FUNCTION', 'LOAD_CONST', 'STORE_FAST', 'LOAD_FAST', 'CALL', 'STORE_NAME'):
            print(f"{prefix}  {instr.opname:20} {repr(instr.argval)}")
            
    # Sub-functions
    for const in co.co_consts:
        if hasattr(const, 'co_name'):
            inspect_code_obj(const, indent + 1)

# Find parse_eya and build_config and login_game
for const in code.co_consts:
    if hasattr(const, 'co_name') and const.co_name in ('parse_eya', 'build_config', 'login_game', 'steam_decrypt', 'steam_encrypt', 'build_login_users'):
        inspect_code_obj(const, 0)
