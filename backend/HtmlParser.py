# -*- coding: utf-8 -*-
from pyquery import PyQuery
from lxml import etree
from lxml.html import HTMLParser
import os, tempfile, re
import subprocess
import inspect
from bs4 import BeautifulSoup
import urllib2

import sys
reload(sys)  # Reload does the trick!
sys.setdefaultencoding('UTF8')

class BaseHtmlParser:
    def __init__(self, content, convertMethod):
        self.originContent = content
        self.convertMethod = convertMethod
        self.title = ""
        self.date = ""
        self.resultContent = ""

    def process(self):
        pass

    def getContent(self):
        soup = BeautifulSoup(self.resultContent, 'html.parser')
        prettyContent = soup.prettify().encode('utf8')
        return prettyContent

    def getTitle(self):
        return self.title

    def getDate(self):
        return self.date

    def convertToZhTW(self, content):
        opencc = "/usr/local/bin/opencc"
        (inputFd, inputPath) = tempfile.mkstemp()

        os.write(inputFd, content)
        os.close(inputFd)

        retcode = 0
        convertParam = "-c " + self.convertMethod + ".json"
        try:
            content = subprocess.check_output([opencc, convertParam, "-i " + inputPath])
        except subprocess.CalledProcessError as e:
            retcode = e.returncode

        os.remove(inputPath)

        if retcode != 0:
            return False
        return content

    def getInstagramImageUrl(self, shortCode):
        url = 'http://instagram.com/p/%s/media?size=l' % (shortCode)
        return url

class BuzzFeedParser(BaseHtmlParser):

    def __processImageTag(self, i, e):
        obj = PyQuery(e)
        style = obj.attr('style')

        if style != None and style.find('display: none') != -1:
            obj.remove()
            return

        newObj = PyQuery("<img />")
        newObj.attr('src', obj.attr('rel:bf_image_src'))
        newObj.attr('style', obj.attr('style'))
        newObj.width(obj.width())
        newObj.height(obj.height())
        obj.replaceWith(newObj)

    def __processInstagramTag(self, i, e):
        obj = PyQuery(e)
        url = obj('a').attr('href')
        shortCode = re.match("http://.*/p/(.*)/", url).group(1)
        imageUrl = self.getInstagramImageUrl(shortCode)

        newObj = PyQuery("<img />")
        newObj.attr('src', imageUrl)
        obj.replaceWith(newObj)

    def __processInstagramLinkTag(self, i, e):
        obj = PyQuery(e)
        linkObj = obj('a')
        href = str(linkObj.attr('href'))
        text = str(linkObj.text())
        #~ print "href:%s, text:%s" % (href, text)
        prefix = "圖片來源："
        if text.find('youtube') != -1:
            prefix = "影片來源："
        composedText = "%s%s" % (prefix, text)
        linkObj.text(unicode(composedText))
        linkObj.wrap('<h6></h6>')

    def process(self):
        d = PyQuery(self.originContent)
        #~ self.title = self.convertToZhTW(d("h2.rich_media_title").html().encode('utf8'))
        #~ self.date = d("#post-date").html()
        obj = d('#buzz_sub_buzz')

        obj(".print").remove()

        # handle img tag
        obj("img").each(self.__processImageTag)
        obj("blockquote").each(self.__processInstagramTag)
        obj("div.sub_buzz_source_via").each(self.__processInstagramLinkTag)

        # remove empty tags
        obj("img").filter(lambda i: PyQuery(this).attr("src") == None).remove()
        obj("span").filter(lambda i: PyQuery(this).html() == "" or PyQuery(this).text() == "").remove()
        #obj("div").filter(lambda i: PyQuery(this).html() == None).remove()

        # remove unused  tags
        obj('div.pinit').remove()
        obj('div.share-box').remove()
        obj('script').remove()

        # remove any id and class attributes
        #obj('*').attr('id', '').attr('class', '')

        self.resultContent = self.convertToZhTW(obj.html().encode('utf8'))
        self.resultContent += '<script async defer src="//platform.instagram.com/en_US/embeds.js"></script>'
        return {'title': self.title, 'date' : self.date, 'content': self.resultContent}

class WeixinParser(BaseHtmlParser):
    def __processIframeTag(self, i, e):
        obj = PyQuery(e)
        obj.attr('src', obj.attr('data-src'))

    def __processImageTag(self, i, e):
        obj = PyQuery(e)
        obj.attr('src', obj.attr('data-src'))
        obj.attr("data-s", "")
        obj.attr("data-src", "")
        obj.attr("data-type", "")
        obj.attr("data-ratio", "")
        obj.attr("data-w", "")
        obj.attr("style", "")

    def process(self):
        d = PyQuery(self.originContent)
        self.title = self.convertToZhTW(d("h2.rich_media_title").html().encode('utf8'))
        self.date = d("#post-date").html()

        # get text content
        obj = d('#js_content')
        # remove unused style attributes
        obj('br').remove()
        obj("p").attr("style", "")
        obj("strong").attr("style", "")
        #obj("span").attr("style", "")

        # handle img tag
        obj("img").each(self.__processImageTag)
        # handle iframe tag
        obj("iframe").each(self.__processIframeTag)
        # remove empty p tags
        obj("p").filter(lambda i: PyQuery(this).html() == None).remove()

        self.resultContent = self.convertToZhTW(obj.html().encode('utf8'))
        return {'title': self.title, 'date' : self.date, 'content': self.resultContent}
