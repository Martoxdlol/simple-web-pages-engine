const path = require('path')
const validFilename = require('valid-filename')
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

exports.saferesolve = safeResolve
exports.normalizePath = normalizePath
exports.joinUrl = joinUrl
exports.urlPathnameParts = urlPathnameParts
exports.relativeUrlParts = relativeUrlParts
exports.relativeUrl = relativeUrl