const fs = require('fs-extra')
const path = require('path')
const { FileContent } = require('./file_content')
const { saferesolve, normalizePath, joinUrl, urlPathnameParts } = require('./util')

class PagesManager{
    constructor(path){
        this.path = path
        this.readFiles()
    }

    async readFiles(){
        async function _readDirectory(dir){
            const fileList = await fs.readdir(dir.path)
            for(const f of fileList){
                const fp = path.join(dir.path, f)
                const stat = await fs.stat(fp)
                if(stat.isFile()) dir.children.push(new WebFile(f, dir))
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
    

    findPath(p){
        const plist = urlPathnameParts(p)
        if(plist.length == 0) return null
        const filename = plist.pop()
        let parent = this.dir
        for(const f of plist){
            if(!parent) return null
            parent = parent.findDir(f)
        }
        return parent.findFile(filename)
    }
}

class WebFile{
    constructor(name, parent){
        this.name = name
        this.parent = parent
        this.fileContent = new FileContent(this)
    }

    get path(){
        return path.join(this.parent.path, this.name)
    }

    content(){
        return this.fileContent.content()
    }
}

class WebDirectory{
    constructor(name, parent){
        this.name = name
        this.children = []
        this.parent = parent
    }

    get isBase(){
        return !this.parent
    }

    get path(){
        if(this.basePath) return this.basePath
        return path.join(this.parent.path, this.name)
    }

    findDir(name){
        'Finds file inside directory'
        for(const child of this.children){
            if(child.name == name && child instanceof WebDirectory){
                return child
            }
        }
    }

    findFile(name){
        'Finds file inside directory'
        for(const child of this.children){
            if(child.name == name && child instanceof WebFile){
                return child
            }
        }
    }

    findFileUp(name){
        'Finds file inside this directory or parent dir'
        const f = this.findFile(name)
        if(f) return f
        else if(!this.isBase) return this.parent.findFileUp(name)
        return null
    }
}

exports.PagesManager = PagesManager