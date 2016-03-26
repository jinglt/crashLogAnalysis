# -*- coding: utf-8 -*-
# 解析JME异常excel,查找异常代码行
# 输入：异常excel表格，DWARF文件 文件必须和脚本文件在同一目录
# 输出：统计表格
from __future__ import division
import xlrd, xlsxwriter, sys, string, os, glob, hashlib, re, ReadConfigUtil

Config = ReadConfigUtil.Config('config.ini')
# iphone型号映射关系
iphoneTypeDict = Config.getIphoneMap()
# 结果文件表头
resultTitleList = Config.getresultTitle()
# 输入文件表头映射
inputTileList = Config.getInputTitle()
if len(resultTitleList) == 0 or len(inputTileList) == 0 or len(iphoneTypeDict) == 0:
    print '配置文件有误'
    sys.exit(0)
# 结果文件
resultFile = "result.xlsx"
resultWorkBook = xlsxwriter.Workbook(resultFile)
resultSheet = resultWorkBook.add_worksheet('JMECrash')
# 写入表头
for t in resultTitleList:
    resultSheet.write_string(0, resultTitleList.index(t), unicode(t, 'UTF-8'))
# 遍历当前目录下所有日志文件
fileList = glob.glob("*.xlsx")
# 记录解析行号
rowIndex = 0
# 符号缓存
symbolsCache = {}
# 行数（包括表头）
nRows = 0
# 输入文件的数据缓存
inputData = []
for inputFile in fileList:
    if 'result.xlsx' == inputFile:
        continue
    # 打开原始数据表
    inputWorkBook = xlrd.open_workbook(inputFile)
    inputSheet = inputWorkBook.sheet_by_index(0)
    # 总行数
    nRows = inputSheet.nrows
    for row in range(1, nRows):
        columnDict = {}
        # 遍历结果表头
        for col in resultTitleList:
            if '异常代码行' == col:
                continue
            # 取出标题对应输入文件的内容，如果没有，则空着
            inputIndex = -1
            try:
                inputIndex = inputTileList.index(col)
            except Exception, e:
                inputIndex = -1
            value = ''
            if inputIndex != -1:
                value = inputSheet.cell(row, inputIndex).value

            if '异常信息栈' == col:
                # 解析异常栈信息errorStack
                errorStack = value
                pattern = re.compile(r'.*?ME\s*(0x\w+)\s*ME\s*\+*\s*(\d*)[",]')
                m = pattern.findall(errorStack)
                print m
                offsetHexStr = ''  # 地址偏移字符串
                symbols = []  # 保存符号表
                # 找出偏移字符
                for u in m:
                    offsetDec = string.atoi(u[1], 10)
                    offsetHex = string.atoi(u[0], 16)
                    offsetHexStr = hex(offsetHex - offsetDec)
                    if offsetHexStr[-3:] == '000':
                        break
                # 遍历所有JME异常位置，解析成符号
                for u in m:
                    if u[0] != '' and offsetHexStr != '':
                        # 解析后输出字符串
                        outStr = ''
                        # 符号缓存key
                        symbolsKey = u[0][-3:] + '_' + u[1]
                        if symbolsKey.strip() != '' and symbolsCache.has_key(symbolsKey):
                            outStr = symbolsCache[symbolsKey]
                        # 从文件中获取符号
                        else:
                            # 地址偏移字符串后3位为000时才解析
                            if offsetHexStr[-3:] == '000':
                                # 判断是否是64位
                                arch = "armv7"
                                if len(u[0]) > 10:
                                    arch = "arm64"
                                # 解析
                                cmd = "xcrun atos -arch " + arch + " -o ME.app/ME -l " + offsetHexStr + " " + u[0]
                                print cmd
                                outStr = os.popen(cmd).read()
                                # 缓存符号
                                symbolsCache[symbolsKey] = outStr;
                        # 符号信息与当前行栈中最后的地址保存到对应数组
                        if outStr != '':
                            symbols.append(outStr)
                            print outStr
                columnDict['异常代码行'] =  ','.join(symbols)
            columnDict[col] = value.strip()
        inputData.append(columnDict)
# 处理统计信息
dataCount = nRows - 1
# 没有数据，直接退出
if dataCount < 2:
    resultWorkBook.close()
    sys.exit(0)
# 公共缓存
publicCache = {}
for dt in inputData:
    for col in resultTitleList:
        if 'ERP' == col or '型号' == col or '操作系统版本号' == col or '异常代码行' == col \
                or '崩溃页面' == col:
            if not publicCache.has_key(col):
                publicCache[col] = {}
            if publicCache[col].has_key(dt[col]):
                publicCache[col][dt[col]] += 1
            else:
                publicCache[col][dt[col]] = 1
            continue
# 写入结果文件
for dt in inputData:
    rowIndex += 1
    for col in resultTitleList:
        if not dt.has_key(col):
            continue
        v = dt[col]
        if 'ERP崩溃次数' == col:
            try:
                v = str(publicCache['ERP'][dt['ERP']])
            except:
                pass
        if 'ERP崩溃率' == col:
            try:
                v = str(round(publicCache['ERP'][dt['ERP']] / dataCount, 4))
            except:
                pass
        if '型号崩溃率' == col:
            try:
                v = str(round(publicCache['型号'][dt['型号']] / dataCount, 4))
            except:
                pass
        if '系统崩溃率' == col:
            try:
                v = str(round(publicCache['操作系统版本号'][dt['操作系统版本号']] / dataCount, 4))
            except:
                pass
        if '异常发生次数' == col:
            try:
                v = str(publicCache['异常代码行'][dt['异常代码行']])
            except:
                pass
        if '异常总量占比' == col:
            try:
                v = str(round(publicCache['异常代码行'][dt['异常代码行']] / dataCount, 4))
            except:
                pass
        if '页面崩溃次数' == col:
            try:
                v = str(publicCache['崩溃页面'][dt['崩溃页面']])
            except:
                pass
        if '页面崩溃率' == col:
            try:
                v = str(round(publicCache['崩溃页面'][dt['崩溃页面']] / dataCount, 4))
            except:
                pass
        resultSheet.write_string(rowIndex, resultTitleList.index(col), v)
# 关闭结果文件
resultWorkBook.close()
