const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const { TYPE_DOCUMENT, TYPE_SYSTEM, TYPE_TEMPLATE } = require('./constants')
const { FileContent } = require('./file_content')
const { saferesolve, normalizePath, urlPathnameParts, isTemplateFileType, isDocumentType } = require('./util')

class FileSystemManager {
    constructor(path) {
        this.path = path
        this.listenChanges()
    }

    async readFiles() {
        const _readDirectory = async (dir) => {
            const fileList = await fs.readdir(dir.path)
            for (const f of fileList) {
                const fp = path.join(dir.path, f)
                const stat = await fs.stat(fp)
                if (stat.isFile()) dir.children.push(new WebFile(f, dir, this, stat))
                else {
                    const n = new WebDirectory(f, dir)
                    dir.children.push(n)
                    await _readDirectory(n)
                }
            }
        }
        const baseWebDir = new WebDirectory('root')
        baseWebDir.basePath = this.path
        await _readDirectory(baseWebDir)
        this.dir = baseWebDir
    }

    listenChanges(){
        const listenPath = path.join(this.path, '**/*.*')
        glob(listenPath, {}, (er, files) => {
            this.readFiles()
        })
    }

    findPath(p) {
        const plist = urlPathnameParts(p)
        if (plist.length == 0) return null
        const filename = plist.pop()
        let parent = this.dir
        for (const f of plist) {
            if (!parent) return null
            parent = parent.findDir(f)
        }
        if (!parent) return null
        return parent.findFile(filename)
    }

    findPathUp(p) {
        const plist = urlPathnameParts(p)
        if (plist.length == 0) return null
        const filename = plist.pop()
        let parent = this.dir
        for (const f of plist) {
            if (!parent) return null
            parent = parent.findDir(f)
        }
        while (parent) {
            const f = parent.findFile(filename)
            if (f) return f
            parent = parent.parent
        }
        return null
    }

    getFile(p) {
        return isTemplateFileType(p) ? this.findPathUp(p) : this.findPath(p)
    }

    async getFileContent(p) {
        try {
            const file = this.getFile(p)
            if (!file) return null
            const content = await file.content()
            if (!content) return null
            return content
        } catch (e) {
            return null
        }
    }
}

class WebFile {
    constructor(name, parent, fileSystemManager, stat) {
        this.name = name
        this.parent = parent
        this.fileSystemManager = fileSystemManager
        this.fileContent = new FileContent(this)
        this.stat = stat
        if(isTemplateFileType(name)){
            this.type = TYPE_TEMPLATE
        }else if(isDocumentType(name)){
            this.type = TYPE_DOCUMENT
        }else{
            this.type = TYPE_SYSTEM
        }
    }

    get path() {
        return path.join(this.parent.path, this.name)
    }

    content() {
        return this.fileContent.content()
    }
}

class WebDirectory {
    constructor(name, parent) {
        this.name = name
        this.children = []
        this.parent = parent
    }

    get isBase() {
        return !this.parent
    }

    get path() {
        if (this.basePath) return this.basePath
        return path.join(this.parent.path, this.name)
    }

    findDir(name) {
        'Finds file inside directory'
        for (const child of this.children) {
            if (child.name == name && child instanceof WebDirectory) {
                return child
            }
        }
    }

    findFile(name) {
        'Finds file inside directory'
        for (const child of this.children) {
            if (child.name == name && child instanceof WebFile) {
                return child
            }
        }
        return null
    }

    findFileUp(name) {
        'Finds file inside this directory or parent dir'
        const f = this.findFile(name)
        if (f) return f
        else if (!this.isBase) return this.parent.findFileUp(name)
        return null
    }
}

exports.FileSystemManager = FileSystemManager