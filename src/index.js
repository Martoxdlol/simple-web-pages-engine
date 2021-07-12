const isCLI = require.main === module
const { parser } = require('args-command-parser')
const express = require('express')
const Router = express.Router
const path = require('path')
const { serveRenderFilesMiddleware, e404Middleware } = require('./middlewares')
const { FileSystemManager } = require('./pages')
const { saferesolve, normalizePath, joinUrl, relativeUrl } = require('./util')


const DEFAULT_OPTIONS = {
    webroot: './webroot',
    webrootMain: './main',
    webrootAssets: './assets',
    webrootAdmin: './admin',
    baseUrl: '/',
    adminUrl: 'admin',
    assetsUrl: 'assets',
}

function joinOptions(options, defaultOptions){
    const r = defaultOptions
    for(const k in options) if(options[k]) r[k] = options[k]
    return r
}

function main(options){
    //SWE can be integrated into any express app or work standalone
    options = joinOptions(options, DEFAULT_OPTIONS)
    const app = Router()
    const webroot = path.resolve(options.webroot)
    const baseUrl = joinUrl(options.baseUrl)
    const assetsUrl = joinUrl(baseUrl, options.assetsUrl)
    const adminUrl = joinUrl(baseUrl, options.adminUrl)
    const webrootMainPath = path.resolve(webroot, options.webrootMain)
    const webrootAssetsPath = path.resolve(webroot, options.webrootAssets)
    const webrootAdminPath = path.resolve(webroot, options.webrootAdmin)
    
    const mainPages = new FileSystemManager(webrootMainPath)
    const adminPages = new FileSystemManager(webrootAdminPath)
    app.use(express.static(webrootAssetsPath))
    

    // app.use(assetsUrl, null)
    // app.use(adminUrl, auth)
    app.use(adminUrl, serveRenderFilesMiddleware(adminUrl, adminPages))
    app.use(baseUrl, serveRenderFilesMiddleware(baseUrl, mainPages))
    app.use(baseUrl, e404Middleware(baseUrl, mainPages))

    return app
}

if(isCLI){
    const argv = parser().data
    const settings = argv.longSwitches
    const port = settings.port && settings.port[0] || 3000
    const webroot = settings.webroot && settings.webroot[0]
    const baseUrl = settings.baseUrl && settings.baseUrl[0]
    const adminUrl = settings.adminUrl && settings.adminUrl[0]
    const assetsUrl = settings.assetsUrl && settings.assetsUrl[0]
    
    const app = express()
    app.use(main({
        webroot,
        baseUrl,
        adminUrl,
        assetsUrl,
    }))
    app.listen(port)
}