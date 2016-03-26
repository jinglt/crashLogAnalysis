# -*- coding: utf-8 -*-

import ConfigParser


# 读取配置文件工具类

class Config:
    def __init__(self, path):
        self.path = path
        self.cf = ConfigParser.ConfigParser()
        self.cf.read(self.path)

    def get(self, field, key):
        result = ""
        result = self.cf.get(field, key)
        return result

    def set(self, field, key, value):
        self.cf.set(field, key, value)
        self.cf.write(open(self.path, 'w'))
        return True

    def getIphoneMap(self):
        result = {}
        try:
            options = self.cf.options('iphoneMap')
            for op in options:
                temp = eval(self.get('iphoneMap', op))
                result.update(temp)
        except Exception, e:
            print '获取iphone型号映射关系错误，请检查配置文件' + e
        return result

    def getInputTitle(self):
        result = []
        try:
            result = eval(self.get('inputTitle', 'inputTitle'))
        except Exception, e:
            print '获取输入文件表头错误，请检查配置文件' + e
        return result

    def getresultTitle(self):
        result = []
        try:
            result = eval(self.get('resultTitle', 'resultTitle'))
        except Exception, e:
            print '获取结果文件表头错误，请检查配置文件' + e
        return result
