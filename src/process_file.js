const nodeHtmlParser = require("node-html-parser")
const { joinUrl, relativeUrlParts, getUrlDirPath } = require("./util")

async function _render(code, props, children, fileSystem, relativePath){
    const root = nodeHtmlParser.parse(code)
    const includes = root.querySelectorAll("include")
    const childrenElem = root.querySelector('children')
    if(childrenElem){
        if(children){
            childrenElem.parentNode.exchangeChild(childrenElem, children)
        }else{
            childrenElem.parentNode.removeChild(childrenElem)
        }     
    }
    for(const elem of includes){
        const src = elem.getAttribute('src')
        if(src){
            const srcPath = joinUrl(relativePath, src)
            const dirPath = getUrlDirPath(srcPath)
            const newElemRaw = await fileSystem.getFileContent(srcPath)
            if(newElemRaw){
                elem.parentNode.exchangeChild(
                    elem,
                    await _render(newElemRaw, elem.attributes, elem.childNodes, fileSystem, dirPath)
                )
            }else{
                console.error(`${srcPath} not found`)
            }
        }
    }
    return root
}

async function render(html, fileSystem){
    return (await _render(html, {}, null, fileSystem, '/')).toString()
}

exports.render = render 
