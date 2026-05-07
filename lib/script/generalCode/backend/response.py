import json


class ReturnStatus:
    def __init__(self, code=0, data=None, msg=""):
        self.set_status(code, data, msg)

    def set_status(self, code, data, msg):
        self.code = code
        self.data = data
        self.msg = msg
        return self

    def get_json_str(self):
        content = {
            "code": self.code,
            "msg": self.msg,
            "data": self.data,
        }
        return json.dumps(content, ensure_ascii=False)


if __name__ == "__main__":
    print("res:")
