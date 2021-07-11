const { saferesolve, normalizePath, joinUrl, relativeUrl } = require('./util')

function serveRenderFilesMiddleware(baseUrl, pagesManager){
    return async (req, res, next) => {
        const relativePath = relativeUrl(baseUrl, req.url)
        const file = pagesManager.findPath(relativePath)
        if(file){
            const content = await file.content()
            res.end(content)
        }else{
            next()
        }
    }
}

function e404Middleware(baseUrl, pagesManager){
    return (req, res, next) => {
        const p404 = pagesManager.findPath('__404__.html')
        if(!p404) res.status(404).end("<html><head><title>File not found</title></head><body>File not found</body></html>")
        else res.status(404)
    }
}

exports.serveRenderFilesMiddleware = serveRenderFilesMiddleware
exports.e404Middleware = e404Middleware