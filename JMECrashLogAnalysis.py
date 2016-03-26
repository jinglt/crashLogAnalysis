# -*- coding: utf-8 -*-

"""
2016年3月25日22:52:05
JME崩溃日志解析：
1、根据崩溃栈信息分析出崩溃代码
2、统计各种崩溃率
注意：输出文件标题必须包含：型号、异常信息栈、异常代码行，负责没有办法解析对应代码
"""
from __future__ import division
import xlrd
import xlsxwriter
import os
import glob
import re
import string
import ReadConfigUtil


class CrashLogAnalysis:
    def __init__(self, ini_file_name, result_file_name):
        """
        加载配置文件信息
        :param configPath:配置文件名称
        :return:
        """
        self.Config = ReadConfigUtil.Config(ini_file_name)
        self.iphone_type_dict = self.Config.getIphoneMap()  # iphone 型号映射关系
        self.input_Tile_list = self.Config.getInputTitle()  # 输入文件标题信息
        self.result_title_list = self.Config.getresultTitle()  # 输出文件标题信息
        self.result_file_name = result_file_name  # 结果文件名称
        self.error_code_dict = {}  # 保存已经翻译出来的代码行，key:16进制位置字符的后三位_偏移量
        self.row_count = 0  # 总行数
        self.public_cache = {}  # 公共缓存

    def write_result(self, crash_file):
        """
        写入结果excel
        :return:
        """
        # 如果是结果文件则忽略
        if crash_file == self.result_file_name:
            return
        result_work_book = xlsxwriter.Workbook(self.result_file_name)
        result_sheet = result_work_book.add_worksheet('JMECrashLog')
        # 写入表头
        for t in self.result_title_list:
            result_sheet.write_string(0, self.result_title_list.index(t), unicode(t,"utf-8"))
        row_index = 0
        result_data = self.__read_crash_log(crash_file)
        self.__handle_localize_info(result_data)
        for dt in result_data:
            row_index += 1
            for col in self.result_title_list:
                v = dt[col]
                result_sheet.write_string(row_index, self.result_title_list.index(col), v)
        # 关闭结果文件
        result_work_book.close()

    def __handle_localize_info(self, result_data):
        data_count = self.row_count - 1
        for dt in result_data:
            for col in self.result_title_list:
                if 'ERP' == col or '型号' == col or '操作系统版本号' == col or '异常代码行' == col \
                        or '崩溃页面' == col:
                    if col not in self.public_cache.keys():
                        self.public_cache[col] = {}
                    if dt[col] in self.public_cache[col].keys():
                        self.public_cache[col][dt[col]] += 1
                    else:
                        self.public_cache[col][dt[col]] = 1
                    continue
        for dt in result_data:
            for col in self.result_title_list:
                if col in dt.keys():
                    v = dt[col]
                    if 'ERP崩溃次数' == col:
                        try:
                            v = str(self.public_cache['ERP'][dt['ERP']])
                        except:
                            pass
                    if 'ERP崩溃率' == col:
                        try:
                            v = str(round(self.public_cache['ERP'][dt['ERP']] / data_count, 4))
                        except:
                            pass
                    if '型号崩溃率' == col:
                        try:
                            v = str(round(self.public_cache['型号'][dt['型号']] / data_count, 4))
                        except:
                            pass
                    if '系统崩溃率' == col:
                        try:
                            v = str(round(self.public_cache['操作系统版本号'][dt['操作系统版本号']] / data_count, 4))
                        except:
                            pass
                    if '异常发生次数' == col:
                        try:
                            v = str(self.public_cache['异常代码行'][dt['异常代码行']])
                        except:
                            pass
                    if '异常总量占比' == col:
                        try:
                            v = str(round(self.public_cache['异常代码行'][dt['异常代码行']] / data_count, 4))
                        except:
                            pass
                    if '页面崩溃次数' == col:
                        try:
                            v = str(self.public_cache['崩溃页面'][dt['崩溃页面']])
                        except:
                            pass
                    if '页面崩溃率' == col:
                        try:
                            v = str(round(self.public_cache['崩溃页面'][dt['崩溃页面']] / data_count, 4))
                        except:
                            pass
                    dt[col] = v
        result_data
    def __read_crash_log(self, crash_file):
        """
        读取崩溃文件到缓存
        :param crash_file:
        :return:
        """

        crash_data = []
        crash_work_book = xlrd.open_workbook(crash_file)
        crash_sheet = crash_work_book.sheet_by_index(0)
        # 总行数(包括标题)
        self.row_count = crash_sheet.nrows
        for row in range(1, self.row_count):
            row_data_dict = {}  # 行数据临时字典
            for row_title in self.result_title_list:
                # 异常代码行 需要从 异常信息栈 和 xcode 文件解析出来，这里不缓存
                if '异常代码行' == row_title:
                    continue
                # 取出标题对应输入文件的内容，如果没有，则空着
                try:
                    row_index = self.input_Tile_list.index(row_title)
                except:
                    row_index = -1
                value = ''  # 列所对应的内容
                if row_index != -1:
                    value = crash_sheet.cell(row, row_index).value
                    value = value.strip()

                # 手机型号转换
                if '型号' == row_title:
                    for (k, v) in self.iphone_type_dict.items():
                        if value.find(k) != -1:
                            value = v
                            break
                if '异常信息栈' == row_title:
                    error_codes = self.__analysis_crash_2_error_code(value)
                    row_data_dict['异常代码行'] = error_codes
                # 列数据加入字典
                row_data_dict[row_title] = value
            # 行数据加入缓存
            crash_data.append(row_data_dict)
        return crash_data

    def __analysis_crash_2_error_code(self, value):
        """
        根据异常信息栈和xcode文件 翻译出异常代码行
        :param value:
        :return:
        """
        # 解析异常栈信息errorStack
        error_stack = value
        pattern = re.compile(r'.*?ME\s*(0x\w+)\s*ME\s*\+*\s*(\d*)[",]')
        m = pattern.findall(error_stack)
        if len(m) == 0:
            return ''  # 没有可翻译的栈信息
        print m
        offset_hex_str = ''  # 地址偏移字符串
        symbols = []  # 异常代码行
        # 找出偏移字符
        for u in m:
            offset_dec = string.atoi(u[1], 10)
            offset_hex = string.atoi(u[0], 16)
            offset_hex_str = hex(offset_hex - offset_dec)
            if offset_hex_str[-3:] == '000':
                break
        # 没有找到符合要求的偏移量（地址偏移字符串后3位为000时才解析），无法解析成代码行，直接返回
        if not offset_hex_str[-3:] == '000':
            return value
        # 遍历所有JME异常位置，解析成符号
        for u in m:
            if not u[0] == '':
                # 解析后输出字符串
                # 符号缓存key
                error_code_key = u[0][-3:].strip() + '_' + u[1].strip()
                if error_code_key != '' and self.error_code_dict.has_key(error_code_key):
                    error_code_str = self.error_code_dict[error_code_key]
                # 从文件中获取异常代码
                else:
                    # 判断是否是64位
                    arch = "armv7"
                    if len(u[0]) > 10:
                        arch = "arm64"
                    # 解析
                    cmd = "xcrun atos -arch " + arch + " -o ME.app/ME -l " + offset_hex_str + " " + u[0]
                    print cmd
                    error_code_str = os.popen(cmd).read()
                    # 缓存符号
                    self.error_code_dict[error_code_key] = error_code_str;
                # 符号信息与当前行栈中最后的地址保存到对应数组
                if not error_code_str == '':
                    symbols.append(error_code_str)
                    print error_code_str
        return ','.join(symbols)

analysis = CrashLogAnalysis('config.ini', 'result.xlsx')
fileList = glob.glob("*.xlsx")
for inputFile in fileList:
    analysis.write_result(inputFile)