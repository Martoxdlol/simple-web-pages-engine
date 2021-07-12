const path = require('path')
const validFilename = require('valid-filename')
const { TYPE_DOCUMENT_FORMATS } = require('./constants')
const SAMPLE_URL = 'http://sample_domain/'

function safeResolve(base, target) {
    var targetPath = '.' + path.posix.normalize('/' + target)
    return path.posix.resolve(base, targetPath)
}

function normalizePath(p){
    return path.normalize(p).replace(/\\/gi, '/')
}

function joinUrl(u1, u2 = ''){
    const baseUrl = new URL(u1, SAMPLE_URL)
    const joined = new URL(u2, baseUrl)
    return joined.pathname + joined.search + joined.hash
}

function urlPathnameParts(url){
    const pathname = (new URL(url, SAMPLE_URL)).pathname
    const pathnameList = pathname.split('/')
    const list = []
    for(const part of pathnameList){
        if(validFilename(part)) list.push(part)
    }
    return list
}

function relativeUrlParts(base, url){
    const parts1 = urlPathnameParts(base)
    const parts2 = urlPathnameParts(url)
    for(const name of parts1){
        if(name == parts2[0]) parts2.splice(0,1)
    }
    return parts2
}

function relativeUrl(base, url){
    return '/'+relativeUrlParts(base, url).join('/')
}

function getUrlDirPath(pathname){
    const urlParts = relativeUrlParts(pathname)
    if(urlParts.length == 0) return '../'
    urlParts.pop()
    return '/'+urlParts.join()
}

function nameAndExtension(filename){
    const arr = filename.split('.')
    if(arr.length == 1) return [ filename, '' ]
    const ext = arr.pop()
    return [ arr.join(), ext ]
}

function isTemplateFileType(filename){
    const [ name, ext ] = nameAndExtension(filename)
    if(name.substring(0,2) == '__' && name.substring(name.length-2, name.length) == '__'){
        return true
    }
}

function isDocumentType(filename){
    const [ name, ext ] = nameAndExtension(filename)
    return TYPE_DOCUMENT_FORMATS.has(ext)
}

exports.saferesolve = safeResolve
exports.normalizePath = normalizePath
exports.joinUrl = joinUrl
exports.urlPathnameParts = urlPathnameParts
exports.relativeUrlParts = relativeUrlParts
exports.relativeUrl = relativeUrl
exports.getUrlDirPath = getUrlDirPath
exports.isTemplateFileType = isTemplateFileType
exports.isDocumentType = isDocumentType