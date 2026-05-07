import os, sys, time, requests, threading
import webview
import logging
from server import server
from waitress import serve
from multiprocessing import Process
from webview.dom import DOMEventHandler
import json

from bridge import Bridge

DEBUG = False
PORT = 9527
server_thread = None


def check_reg():
    import ctypes, winreg

    try:
        ok = winreg.CreateKeyEx(
            winreg.HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Policies\Microsoft\Edge\WebView2",
            reserved=0,
            access=winreg.KEY_WRITE,
        )
        winreg.SetValueEx(ok, "RendererCodeIntegrityEnabled", 0, winreg.REG_DWORD, 0)
        winreg.CloseKey(ok)
        ok = winreg.CreateKeyEx(
            winreg.HKEY_CLASSES_ROOT, r".js", reserved=0, access=winreg.KEY_WRITE
        )
        winreg.SetValueEx(ok, "Content Type", 0, winreg.REG_SZ, "text/javascript")
        winreg.CloseKey(ok)
    except PermissionError:
        print(
            "重新启动sys.argv==>",
            sys.executable,
            sys.argv,
            __file__,
            " ".join(sys.argv),
        )

        pythonw_path = sys.executable

        if "pythonw.exe" in pythonw_path.lower():
            pythonw_path = pythonw_path.replace("pythonw.exe", "python.exe")

        if not DEBUG:
            pythonw_path = pythonw_path.replace("python.exe", "pythonw.exe")

        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", pythonw_path, f"{__file__} {' '.join(sys.argv)}", None, 1
        )
        sys.exit()


def on_drag(e):
    webview.windows[0].evaluate_js(f"window.handleDrag&&handleDrag()")
    pass


def on_drop(e):
    files = e["dataTransfer"]["files"]
    if len(files) == 0:
        return

    for file in files:
        fullPath = file.get("pywebviewFullPath")
        fullPath_json = json.dumps(fullPath)
        webview.windows[0].evaluate_js(
            f"window.handleDrop&&handleDrop({fullPath_json})"
        )


def on_loaded():
    window = webview.windows[0]
    window.dom.document.events.dragover += DOMEventHandler(
        on_drag, True, True, debounce=500
    )
    window.dom.document.events.drop += DOMEventHandler(on_drop, True, True)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    testPath = os.path.normpath(os.path.join(base_dir, "../../../../Packages"))
    window.evaluate_js(f"window.handleDrop&&handleDrop({json.dumps(testPath)})")

    # unsubscribe event listener
    # window.events.loaded -= on_loaded

def on_closed():
    print("closed")
    sys.exit()


def on_closing():
    print("closing")

    def run_async():
        webview.windows[0].evaluate_js("window.pywebview?.api.destroy()")

    thread = threading.Thread(target=run_async)
    thread.start()
    return False


# 启动服务
def start_server(port=PORT):
    global DEBUG
    server.run(host="127.0.0.1", port=port, debug=DEBUG, use_reloader=False)
    # serve(server, host="0.0.0.0", port=port)


# 启动客户端
def start_gui(port=PORT):
    global DEBUG
    try:
        requests.get("http://localhost:3000", timeout=0.1)
        port = 3000
    except:
        None
    url = f"http://127.0.0.1:{port}/"
    # url = f"http://127.0.0.1:3000/"
    api = Bridge(webview.token)
    window = webview.create_window(
        title="脚本录制-自动化测试",
        url=url,
        width=1200,
        height=800,
        frameless=False,
        min_size=(1200, 800),
        background_color="#f5f5f5",
        js_api=api,
        resizable=True,
    )

    window.events.loaded += on_loaded
    window.events.closed += on_closed
    window.events.closing += on_closing
    webview.start(window, debug=DEBUG, private_mode=True)


def start():
    server_process = Process(target=start_server, args=(PORT,), daemon=False)
    server_process.start()
    time.sleep(1)
    start_gui()


if __name__ == "__main__":
    check_reg()
    start()
