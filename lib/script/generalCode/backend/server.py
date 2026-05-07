import os, json, time
import shutil
import datetime
import subprocess
from pathlib import Path


from loguru import logger
from response import *

from flask import Flask, render_template, request
from flask_compress import Compress
from flask_cors import CORS
from flask_sock import Sock

base_dir = os.path.dirname(os.path.abspath(__file__))  # 解析为绝对路径
template_dir = os.path.join(os.path.dirname(__file__), "www")

if not os.path.exists(template_dir):
    template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "www")
print(template_dir)

server = Flask(
    __name__,
    static_folder=template_dir,
    template_folder=template_dir,
    static_url_path="",
)
cors = CORS(server, supports_credentials=True)
compress = Compress(server)

server.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

sock = Sock(server)  # 使用与 Flask 实例相同的对象

# todo token机制
WEBVIEW_TOKEN = "hello"

ext = ".spec.js"


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


@server.before_request
def beforeRequest():
    print("beforeRequest")
    return


# 清缓存
@server.after_request
def add_header(response):
    print("after_request")
    # response.headers["Cache-Control"] = "no-store"
    return response


# 首页
@server.route("/")
def landing():
    return render_template("index.html")


# 存储所有连接的客户端
clients = set()

status = "pause"


def sendConnect():
    for client in clients:
        data = {"type": "connect", "data": {"status": status, "len": len(clients)}}
        client.send(json.dumps(data, ensure_ascii=False))


@sock.route("/ws")
def echo(ws):
    global status
    clients.add(ws)
    sendConnect()
    try:
        while True:
            data = ws.receive()
            if not data:
                break

            print(f"收到消息: {data}")

            dataPar = json.loads(data)
            if dataPar["type"] == "status":
                status = dataPar["data"]

            for client in clients:
                if client != ws:
                    client.send(data)
    except Exception as e:
        print(f"服务器异常: {e}")
    finally:
        if ws in clients:
            clients.remove(ws)
            print(f"客户端断开连接，当前连接数: {len(clients)}")
            sendConnect()


@server.route("/get_ws", methods=["POST"])
def get_ws():
    res = ReturnStatus()
    try:
        return res.set_status(0, len(clients), f"获取成功").get_json_str()
    except Exception as e:
        print(f"操作失败: {e}")
        return res.set_status(-1, {}, f"操作失败: {e}").get_json_str()


@server.route("/read", methods=["POST"])
def read_file():
    data = request.json
    try:
        with open(data.get("path"), "r", encoding="utf-8") as file:
            file_content = file.read()
            # res = ReturnStatus(0, file_content, "文件复制成功")
            # return res.get_json_str()
            return file_content
    except FileNotFoundError:
        res = ReturnStatus(-1, {}, "File not found.")
        return res.get_json_str()


@server.route("/write", methods=["POST"])
def write_file():
    data = request.json
    with open(data.get("path"), "w", encoding="utf-8") as f:
        f.write(data.get("file_content"))
    res = ReturnStatus(0, {}, "文件写入成功")
    return res.get_json_str()


@server.route("/add_test", methods=["POST"])
def add_test():
    data = request.json
    target_path = data.get("path")
    print(f'add_test==>{target_path}')
    res = ReturnStatus()
    try:
        lib_path = find_parent_with_lib_pathlib(target_path)
        scirpt_path = os.path.join(lib_path, "Lib\script\generalTest.js")
        result = subprocess.run(f"node {scirpt_path} {target_path}", shell=True, check=True)
        return res.set_status(0, {}, f"文件创建成功").get_json_str()
    except Exception as e:
        print(f"操作失败11111: {e}")
        return res.set_status(-1, {}, f"操作失败123123: {e}").get_json_str()


@server.route("/add_req", methods=["POST"])
def add_req():
    data = request.json
    target_path = data.get("path")
    print(f'add_req==>{target_path}')
    res = ReturnStatus()
    try:
        lib_path = find_parent_with_lib_pathlib(target_path)
        scirpt_path = os.path.join(lib_path, "Lib\script\generalReqTest.js")
        result = subprocess.run(f"node {scirpt_path} {target_path}", shell=True, check=True)
        return res.set_status(0, {}, f"文件创建成功").get_json_str()
    except Exception as e:
        print(f"操作失败: {e}")
        return res.set_status(-1, {}, f"操作失败: {e}").get_json_str()


@server.route("/import_req_to_test", methods=["POST"])
def import_req_to_test():
    data = request.json
    target_path = data.get("path")
    print(f'import_req_to_test==>{target_path}')
    res = ReturnStatus()
    if not os.path.exists(target_path):
        return res.set_status(-1, {}, "路径不存在").get_json_str()
    try:
        lib_path = find_parent_with_lib_pathlib(target_path)
        scirpt_path = os.path.join(lib_path, "Lib\script\importReqToTest.js")
        result = subprocess.run(f"node {scirpt_path} {target_path}", shell=True, check=True)
        return res.set_status(0, {}, f"文件创建成功").get_json_str()
    except Exception as e:
        print(f"操作失败: {e}")
        return res.set_status(-1, {}, f"操作失败: {e}").get_json_str()


@server.route("/add_dir", methods=["POST"])
def add_dir():
    data = request.json
    target_path = data.get("path")

    res = ReturnStatus()
    if not os.path.exists(target_path):
        print("路径不存在")
        return res.set_status(-1, {}, "路径不存在").get_json_str()
    try:
        if os.path.isfile(target_path):
            os.remove(target_path)
            print(f"文件 {target_path} 已删除")
            return res.set_status(0, {}, f"文件 {target_path} 已删除").get_json_str()

        elif os.path.isdir(target_path):
            shutil.rmtree(target_path)
            print(f"文件夹 {target_path} 已递归删除")
            return res.set_status(
                0, {}, f"文件夹 {target_path} 已递归删除"
            ).get_json_str()
    except Exception as e:
        print(f"操作失败: {e}")
        return res.set_status(-1, {}, f"操作失败: {e}").get_json_str()


def safe_copy_file(src, dst_dir):
    """复制文件到目标目录，同名文件自动添加时间戳后缀"""
    filename = os.path.basename(src)
    # base, ext = os.path.splitext(filename)
    # ext = ".spec.js"
    base = filename[: -len(ext)]

    # 生成带时间戳的新文件名（精确到毫秒避免冲突）
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")[:-3]
    new_filename = f"{base}_{timestamp}{ext}"
    new_path = os.path.join(dst_dir, new_filename)

    shutil.copy2(src, new_path)
    return new_path


def generate_unique_dirname(parent_dir, base_name):
    """生成带数量后缀的文件夹名"""
    new_name = base_name

    while os.path.exists(os.path.join(parent_dir, new_name)):
        new_name = f"{base_name}_copy"
    return new_name


@server.route("/paste", methods=["POST"])
def paste_file():
    data = request.json
    source_path = data.get("source_path")
    target_path = data.get("target_path")

    res = ReturnStatus(0, {}, "文件复制成功")
    try:
        if not os.path.exists(source_path):
            return res

        if os.path.isfile(source_path):
            # 文件复制逻辑
            if os.path.exists(target_path) and os.path.isdir(target_path):
                dst_file = os.path.join(target_path, os.path.basename(source_path))
                # 同名文件添加后缀
                if os.path.exists(dst_file):
                    new_path = safe_copy_file(source_path, target_path)
                else:
                    shutil.copy2(source_path, dst_file)
            else:
                # 目标路径是文件时添加后缀
                if os.path.exists(target_path):
                    dir_path = os.path.dirname(target_path)
                    new_path = safe_copy_file(source_path, dir_path)
                else:
                    shutil.copy2(source_path, target_path)

        elif os.path.isdir(source_path):
            # 确保目标目录存在
            os.makedirs(target_path, exist_ok=True)

            # 获取源文件夹名称
            src_basename = os.path.basename(source_path)

            # 生成唯一目标文件夹名
            dest_dirname = generate_unique_dirname(target_path, src_basename)
            full_dest_path = os.path.join(target_path, dest_dirname)

            # 执行文件夹复制
            shutil.copytree(source_path, full_dest_path, copy_function=shutil.copy2)
    except Exception as e:
        print(str(e))
        res.set_status(-1, {}, str(e))

    return res.get_json_str()


@server.route("/del", methods=["POST"])
def del_file():
    data = request.json
    target_path = data.get("path")

    res = ReturnStatus(-1, {}, "路径不存在")
    if not os.path.exists(target_path):
        print("路径不存在")
        return res.set_status(-1, {}, "路径不存在").get_json_str()
    try:
        if os.path.isfile(target_path):
            os.remove(target_path)
            print(f"文件 {target_path} 已删除")
            return res.set_status(0, {}, f"文件 {target_path} 已删除").get_json_str()

        elif os.path.isdir(target_path):
            shutil.rmtree(target_path)
            print(f"文件夹 {target_path} 已递归删除")
            return res.set_status(
                0, {}, f"文件夹 {target_path} 已递归删除"
            ).get_json_str()
    except Exception as e:
        print(f"操作失败: {e}")
        return res.set_status(-1, {}, f"操作失败: {e}").get_json_str()


@server.route("/rename", methods=["POST"])
def rename_file():
    data = request.json
    old_path = data["old_path"]
    new_name = data["new_name"]

    res = ReturnStatus(-1, {}, "路径不存在")
    try:
        # new_path = rename_file_or_folder(old_path, new_name)
        if os.path.dirname(new_name):
            raise ValueError("新名称不应包含路径，请仅提供文件或文件夹名称")

        directory, old_name = os.path.split(old_path)

        if os.path.isfile(old_path):
            new_name = f"{new_name}{ext}"

        new_path = os.path.join(directory, new_name)

        if not os.path.exists(old_path):
            raise FileNotFoundError(f"原文件或文件夹 {old_path} 不存在")

        if os.path.exists(new_path):
            raise FileExistsError(f"文件或文件夹 {new_path} 已经存在")

        os.rename(old_path, new_path)
    except Exception as e:
        print("重命名失败:", e)
        res.set_status(-1, {}, "failed! {} 重命名失败".format(str(e)))
        return res.get_json_str()
    res.set_status(0, {"new_path": new_path}, "success")
    return res.get_json_str()


@server.route("/execute", methods=["POST"])
def execute_file():
    data = request.json
    target_path = data.get("path")

    res = ReturnStatus(-1, {}, "路径不存在")

    list = target_path.split("\\")
    file = list.pop()
    target_dir = "\\".join(list)

    try:
        os.chdir(target_dir)
        print(f"已切换到目录: {os.getcwd()}")
        result = subprocess.run(f"npm run test -- {file}", shell=True, check=True)

        print("📋 Node输出结果:\n", result.stdout)
        return res.set_status(0, {}, "Node输出结果").get_json_str()

    except FileNotFoundError:
        print(f"目录不存在: {FileNotFoundError}")
        return res.set_status(-1, {}, f"目录不存在: {target_dir}").get_json_str()

    except subprocess.CalledProcessError as e:
        print(f" Node命令执行失败: {e.stderr}")
        return res.set_status(-1, {}, f"Node命令执行失败: {e.stderr}").get_json_str()


@server.route("/start_app", methods=["POST"])
def start_app():
    data = request.json
    target_path = data.get("path")

    try:
        target_path = find_parent_with_lib_pathlib(target_path)
        print(f"target_path: {target_path}")
        scirpt_path = os.path.join(target_path, "Lib\script\generalCode\startApp.js")
        print(f"脚本路径: {scirpt_path}")
        result = subprocess.Popen(["node", scirpt_path], shell=True)

        print("📋 Node输出结果:\n", result.stdout)
        return {"code": 0, "data": {}, "msg": "Success"}

    except FileNotFoundError:
        print(f"目录不存在: {FileNotFoundError}")
        return {"code": 1, "data": {}, "msg": f"目录不存在: {target_path}"}

    except subprocess.CalledProcessError as e:
        print(f" Node命令执行失败: {e.stderr}")
        return {"code": 1, "data": {}, "msg": f"Node命令执行失败: {e.stderr}"}


if __name__ == "__main__":
    server.run(host="0.0.0.0", port=9527, debug=True)
