const { TYPE_DOCUMENT, TYPE_TEMPLATE } = require('./constants')
const { renderAny } = require('./process_file')
const { saferesolve, normalizePath, joinUrl, relativeUrl, mergeUrl } = require('./util')

function serveRenderFilesMiddleware(fileSystemManager) {
    return async (req, res, next) => {
        const relativePath = req.url
        let file = fileSystemManager.getFile(relativePath)
        let redirect = false

        //If going relative / but real url is something like /app, it can't access assets from index.html 
        //It's neccessary to use full url, ex: /app => / => /index.html /app/index.html
        if (!file && req.originalUrl != '/' && relativePath == '/') {
            redirect = true
        }


        let indexUrl
        if (!file) {
            const indexPath = joinUrl(relativePath, 'index.html')
            indexUrl = joinUrl(req.originalUrl, 'index.html')
            file = fileSystemManager.getFile(indexPath)
        }
        if (!file) {
            const indexPath = joinUrl(relativePath, 'index.md')
            indexUrl = joinUrl(req.originalUrl, 'index.md')
            file = fileSystemManager.getFile(indexPath)
        }

        if (file) {
            if (redirect) {
                res.redirect(indexUrl)
            } else if (file.type == TYPE_DOCUMENT || file.type == TYPE_TEMPLATE) {
                const content = await renderAny(file)
                res.setHeader('Content-Type', 'text/html')
                res.end(content)
            } else {
                res.sendFile(file.path)
            }
        } else {
            next()
        }
    }
}

function serveAssetsFilesMiddleware(assetsBaseUrl, fileSystemManager) {
    return async (req, res, next) => {
        let file
        const relativePath = relativeUrl(assetsBaseUrl, req.url)
        if (req.url.search(assetsBaseUrl) == 0) {
            file = fileSystemManager.getFile(relativePath)
        }
        if (!file) {
            const arr = relativePath.split(assetsBaseUrl)
            if (arr.length >= 2) {
                const relativePath = mergeUrl(arr.splice(1))
                file = fileSystemManager.getFile(relativePath)
            }
        }
        if (file) {
            res.sendFile(file.path)
        } else {
            next()
        }
    }
}


function e404Middleware(baseUrl, fileSystemManager) {
    return async (req, res, next) => {
        const p404 = fileSystemManager.getFile('__404__.html')
        if (!p404) res.status(404).end("<html><head><title>File not found</title></head><body>File not found</body></html>")
        else res.status(404).end(await p404.content())
    }
}

exports.serveRenderFilesMiddleware = serveRenderFilesMiddleware
exports.serveAssetsFilesMiddleware = serveAssetsFilesMiddleware
exports.e404Middleware = e404Middleware
