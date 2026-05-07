from pathlib import Path
import os, json, time

def find_parent_with_lib_pathlib(start_path):
    current_path = Path(start_path).resolve()
    if current_path.is_file():
        current_path = current_path.parent
    lib_name = "Lib" if os.name == "nt" else "lib"
    while current_path != current_path.parent:
        lib_dir = current_path / lib_name
        if lib_dir.is_dir():
            return str(current_path)
        current_path = current_path.parent
    lib_dir = current_path / lib_name
    if lib_dir.is_dir():
        return str(current_path)
    return None


lib_path = find_parent_with_lib_pathlib('D:\\project\\playwright-test\\Packages\\web')
scirpt_path = os.path.join(lib_path, "Lib\script\generalTest.js")
print(f'lib_path==>{lib_path}')
print(f'scirpt_path==>{scirpt_path}')