import sys, os, webbrowser, subprocess


import requests
import webview, os, json, psutil, shutil

from loguru import logger
import userpaths
import urllib3
from collections import deque

urllib3.disable_warnings()
import pickledb
import platform
from pathlib import Path

if sys.platform == "darwin":
    dbPath = os.path.join(Path(os.path.dirname(__file__)).parent.parent, "cache.db")
else:
    dbPath = os.path.join(os.path.dirname(__file__), "cache.db")

user_db_path = os.path.join(os.path.expanduser("~"), ".TEST")
os.makedirs(user_db_path, exist_ok=True)
user_db_file = os.path.join(user_db_path, "cache.db")

if not os.path.exists(user_db_file) and os.path.exists(dbPath):
    shutil.move(dbPath, user_db_path)


# 新增逻辑：检查数据库是否为空
def is_db_empty(db_path):
    try:
        # 检查文件大小是否为0
        if os.path.getsize(db_path) == 0:
            return True
        # 检查内容是否为空JSON对象
        with open(db_path, "r") as f:
            content = f.read().strip()
            return content == "{}"
    except Exception:
        return True


# 如果用户目录下的数据库存在且为空，则删除
if os.path.exists(user_db_file) and is_db_empty(user_db_file):
    os.remove(user_db_file)
    print("Deleted empty cache.db file")

db = pickledb.load(user_db_file, True)

if not db.exists("storage"):
    db.dcreate("storage")

my_docs = userpaths.get_downloads()

########################################################################################################################

if platform.system() == "Windows":
    p = psutil.Process()
    # 设置为nice值10
    p.nice(-20)
########################################################################################################################


def get_tree(root_path, follow_links=False, sort_key=None, max_depth=None):
    """
    生成文件树结构 (优化版)

    参数：
    root_path: 根路径
    follow_links: 是否跟随符号链接 (默认False)
    sort_key: 子节点排序函数 (默认按label字母排序)
    max_depth: 最大遍历深度 (默认无限制)

    返回：
    包含完整文件树结构的字典
    """
    # 初始化参数
    sort_key = sort_key or (lambda x: x["label"].lower())
    abs_root = os.path.abspath(root_path)

    # 初始化根节点
    tree = {"label": os.path.basename(abs_root), "path": abs_root, "children": []}

    # 使用栈结构进行迭代遍历
    stack = deque()
    stack.append((tree, 0))  # (当前节点, 当前深度)

    while stack:
        current_node, current_depth = stack.pop()
        current_path = current_node["path"]

        try:
            # 使用 scandir 提升性能
            with os.scandir(current_path) as entries:
                # 过滤隐藏文件并排序
                valid_entries = sorted(
                    [entry for entry in entries if not entry.name.startswith(".")],
                    key=lambda e: e.name,
                    reverse=True,  # 保证栈处理的顺序正确
                )

                for entry in valid_entries:
                    node_path = os.path.join(current_path, entry.name)
                    is_dir = False

                    # 处理目录/文件/符号链接
                    if entry.is_dir(follow_symlinks=follow_links):
                        is_dir = True
                    elif entry.is_symlink() and follow_links:
                        # 处理符号链接目标
                        target_path = os.path.realpath(node_path)
                        if os.path.isdir(target_path):
                            is_dir = True

                    # 构建节点
                    node = {"label": entry.name, "path": node_path}

                    # 处理目录节点
                    if is_dir:
                        node["children"] = []

                        # 深度控制
                        if max_depth is None or current_depth < max_depth:
                            stack.append((node, current_depth + 1))

                        current_node["children"].append(node)
                    else:
                        current_node["children"].append(node)

                # 子节点排序
                current_node["children"].sort(key=sort_key)

        except (PermissionError, OSError):
            # 静默跳过无权限访问的目录
            pass

    return tree


def get_dir_size(path="."):
    total = 0
    with os.scandir(path) as it:
        for entry in it:
            if entry.is_file():
                total += entry.stat().st_size
            elif entry.is_dir():
                total += get_dir_size(entry.path)
    return total


class Bridge:
    def __init__(self, token):
        global g_queen_to_sql_package
        self.token = token
        # p = multiprocessing.Process(target=data_to_sqlite_process, args=(g_queen_to_sql_package,))
        # p.start()

    def destroy(self):
        pid = os.getpid()
        try:
            parent_process = psutil.Process(pid)
            try:
                children = parent_process.children(recursive=True)    
                for child in children:
                    try:
                        print(f"终止子进程: PID {child.pid}, 名称 {child.name()}")
                        child.terminate()  
                    except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                        print(f"终止子进程时出错 (PID {child.pid}): {e}")
                        continue
                
                gone, still_alive = psutil.wait_procs(children, timeout=3)

                for child in still_alive:
                    try:
                        print(f"强制杀死子进程: PID {child.pid}, 名称 {child.name()}")
                        child.kill() 
                    except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                        print(f"强制杀死子进程时出错 (PID {child.pid}): {e}")
                        continue
                        
            except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                print(f"获取或操作子进程时出错: {e}")
            
            # 终止父进程
            try:
                parent_process.terminate()
                parent_process.wait() 
            except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                print(f"终止父进程时出错: {e}")
            except psutil.TimeoutExpired:
                print("等待父进程终止超时，尝试强制杀死")
                try:
                    parent_process.kill()
                except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                    print(f"强制杀死父进程时出错: {e}")
            
        except psutil.NoSuchProcess:
            print(f"错误: 当前进程 (PID {pid}) 不存在")
        except psutil.AccessDenied:
            print(f"错误: 没有足够权限操作当前进程 (PID {pid})")
        os._exit(0)
    def resize(self, width, height):
        webview.windows[0].resize(width=width, height=height)

    def move(self, x, y):
        print(x, y)
        webview.windows[0].move(x, y)

    def minimize(self):
        webview.windows[0].minimize()

    def restore(self):
        webview.windows[0].restore()

    def toggle_fullscreen(self):
        webview.windows[0].toggle_fullscreen()

    def hide(self):
        webview.windows[0].hide()

    def officeNetConnected(self):
        try:
            requests.get("http://device-hunter-be.ev.example.cn", timeout=3)
            print("officeNetConnected yes")
            return True
        except:
            print("officeNetConnected no")
            return False

    def openPath(self, path):
        if sys.platform == "win32":
            os.startfile(path)
        else:
            opener = "open" if sys.platform == "darwin" else "xdg-open"
            subprocess.call([opener, path])

    def openWeb(self, url):
        webbrowser.open(url)

    def choosePath(
        self, dialogType, directory, saveFilename, fileTypes, allow_multiple
    ):
        try:
            if dialogType == "FOLDER_DIALOG":
                dialogType = webview.FOLDER_DIALOG
            elif dialogType == "OPEN_DIALOG":
                dialogType = webview.OPEN_DIALOG
            elif dialogType == "SAVE_DIALOG":
                dialogType = webview.SAVE_DIALOG

            dirs = webview.windows[0].create_file_dialog(
                dialog_type=dialogType,
                directory=directory,
                save_filename=saveFilename,
                file_types=fileTypes,
                allow_multiple=allow_multiple,
            )
            logger.info(dirs)
            if (
                sys.platform.startswith("win") == False
                and dialogType == webview.SAVE_DIALOG
            ):
                dirs = "".join(dirs)
            if dirs and len(dirs) > 0:
                size = 0
                if allow_multiple:
                    directory = dirs
                else:
                    directory = dirs if isinstance(dirs, str) else dirs[0]
                    if isinstance(directory, bytes):
                        directory = directory.decode("utf-8")

                response = {"status": "ok", "directory": directory}
            else:
                response = {"status": "cancel"}

            return json.dumps(response)
        except:
            return json.dumps({"status": "ok", "directory": "C:\\Users\\user\\Downloads"})

    def getFileSize(self, path):
        if os.path.exists(path):
            return os.path.getsize(path)
        return 0

    def getDirSize(self, path):
        return get_dir_size(path)

    def storage_getItem(self, key):
        if db.dexists("storage", key) == False:
            return ""
        else:
            return db.dget("storage", key)

    def storage_removeItem(self, key):
        db.dpop("storage", key)

    def storage_setItem(self, key, value):
        db.dadd("storage", (key, value))

    def storage_getAll(self):
        if db.exists("storage"):
            return db.dgetall("storage")
        else:
            db.dcreate("storage")
            return db.dgetall("storage")

    def processInfo(self):
        # logger.info(str(os.getpid())+','+str(os.getppid()))
        return json.dumps(
            {
                "mem": psutil.Process(os.getpid()).memory_info().rss / 1024 / 1024,
                "cpu": psutil.Process(os.getpid()).cpu_percent(),
            }
        )

    def downloadPathInfo(self):
        return my_docs

    def getDir(self, path):
        return [get_tree(path)]
