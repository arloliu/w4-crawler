#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import urllib
import HtmlParser
import sys
reload(sys)  # Reload does the trick!
sys.setdefaultencoding('UTF8')
suffixString ="""
<h6>&lt;視界奇觀&gt;編譯整理    資料來源：<a href="http://wonder4.co/">視界奇觀</a></h6>
<h3><span style="color: #ff0000;"><strong>&lt;視界奇觀&gt; 希望能帶給大家各式有趣又有質感的內容，喜歡的話趕緊按下like，加入我們的粉絲吧！</strong></span></h3>
"""

def fetchPage(fetchUrl):
    f = urllib.urlopen(fetchUrl)
    content = f.read()
    f.close()
    return content


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print "Please specify url and convert method"
        sys.exit(1)
    targetUrl = sys.argv[1]
    content = fetchPage(sys.argv[1])
    if not content:
        sys.exit(0)

    if (targetUrl.find("weixin") != -1):
        handler = HtmlParser.WeixinParser(content, sys.argv[2])
    elif (targetUrl.find("buzzfeed") != -1):
        handler = HtmlParser.BuzzFeedParser(content, sys.argv[2])
    else:
        print "No existed parser implementation"
        sys.exit(1)

    handler.process()

    print handler.getTitle()
    print handler.getDate()
    print handler.getContent() + suffixString


