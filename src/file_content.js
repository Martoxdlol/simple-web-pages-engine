const fs = require('fs-extra')
const { TYPE_DOCUMENT, TYPE_TEMPLATE, TYPE_SYSTEM } = require('./constants')
const { isTemplateFileType, isDocumentType } = require('./util')

class FileContent{
    constructor(webFile){
        this.webFile = webFile
        if(webFile.type == TYPE_TEMPLATE) this.read()
    }

    async read(){
        const c = await fs.readFile(this.webFile.path)
        if(this.type == TYPE_TEMPLATE) this._content = c
        return c
    }

    async content(){
        if(this._content) return this._content
        else return await this.read()
    }
}

exports.FileContent = FileContent