const TYPE_TEMPLATE = 'template'
const TYPE_DOCUMENT = 'document'
const TYPE_SYSTEM = 'system'
const fs = require('fs-extra')

const TYPE_DOCUMENT_FORMATS = ['md', 'html']

class FileContent{
    constructor(webFile){
        this.webFile = webFile
        if(webFile.name.substring(0,2) == '__' && webFile.name.substring(webFile.name.length-2,webFile.name.length) == '__'){
            this.type = TYPE_TEMPLATE
        }else{
            const ext = webFile.name.split('.').pop().toLowerCase()
            this.type = TYPE_SYSTEM
            for(const _ext of TYPE_DOCUMENT_FORMATS){
                if(_ext == ext) this.type = TYPE_DOCUMENT
            }
        }
        if(this.type == TYPE_TEMPLATE) this.read()
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