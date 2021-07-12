const joinUrl = require("join-url")
const nodeHtmlParser = require("node-html-parser")
const { RENDER_RECURSION_LIMIT } = require("./constants")
const { getUrlDirPath, mergeUrl } = require("./util")

const FILL_ATTRS_WITH_PROPS_ATTR_NAME = 'useprops'
const REPLACE_ATTR_WITH_PROP_ATTR_NAME = 'attr_prop'
const REPLACE_VALUE_WITH_PROP_TAG_NAME = 'useprop'

function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    
    return text.replace(/[&<>"']/g, function(m) { return map[m] })
}

function replaceProps(root, props) {
    const elems = root.querySelectorAll(`*[${FILL_ATTRS_WITH_PROPS_ATTR_NAME}=''],*[${FILL_ATTRS_WITH_PROPS_ATTR_NAME}=true]`)
    const elems2 = root.querySelectorAll(`*[${REPLACE_ATTR_WITH_PROP_ATTR_NAME}]`)
    // const elems3 = root.querySelectorAll("*[useprop]")
    // const elems4 = root.querySelectorAll("*[useprop_unsafe]")
    const elems5 = root.querySelectorAll(`${REPLACE_VALUE_WITH_PROP_TAG_NAME}`)
    //Use props as attributes
    for (const elem of elems) {
        elem.setAttributes({...elem.attributes, ...props})
    }
    //Set specific attribute as prop REPLACE_ATTR_WITH_PROP_ATTR_NAME="ELEM_ATTRIBUTE_NAME|PROP_NAME" => ELEM_ATTRIBUTE_NAME="PROP_NAME"
    for (const elem of elems2) {
        const propAttr = elem.getAttribute(REPLACE_ATTR_WITH_PROP_ATTR_NAME)
        const arr = propAttr.split('|')
        const attrName = arr[0]
        const attrValue = arr.splice(1).join()
        if (props[attrValue]) {
            elem.setAttribute(attrName, props[attrValue])
        }
        elem.removeAttribute(REPLACE_ATTR_WITH_PROP_ATTR_NAME)
    }
    // Replace content text with prop value
    // for (const elem of elems3) {
    //     elem.innerText = props[elem.getAttribute('useprop')]
    //     elem.removeAttribute('useprop')
    // }

    // Replace content text HTML prop value (unsafe)
    // for (const elem of elems4) {
    //     elem.innerHTML = props[elem.getAttribute('useprop_unsafe')]
    //     elem.removeAttribute('useprop_unsafe')
    // }

    //Replace tag <useprop prop="PROPNAME"/> => PROP_VALUE
    //if <useprop prop="PROPNAME" unsafe="true"/> => PROP_VALUE can be HTML
    for (const elem of elems5) {
        let value = props[elem.getAttribute('prop')]
        const unsafeAttr = elem.getAttribute('unsafe')
        const unsafe = unsafeAttr == '' || unsafeAttr == 'true'
        if(!value){
            const def = elem.getAttribute('default')
            if(def) value = def
        }
        if(!unsafe) value = escapeHtml(value || '')
        elem.parentNode.exchangeChild(elem, value)
    }
}

async function _renderHTML(code, props, children, fileSystem, relativePath, stackLimit = -1) {
    if (stackLimit == 0) return nodeHtmlParser.parse('')
    stackLimit--
    const root = nodeHtmlParser.parse(code)
    const includes = root.querySelectorAll("include")
    const childrenElem = root.querySelector('children')
    if (childrenElem) {
        if (children) {
            childrenElem.parentNode.exchangeChild(childrenElem, children)
        } else {
            childrenElem.parentNode.removeChild(childrenElem)
        }
    }
    replaceProps(root, props)
    for (const elem of includes) {
        const src = elem.getAttribute('src')
        if (src) {
            const srcPath = mergeUrl(relativePath, src)
            const dirPath = getUrlDirPath(srcPath)
            const newElemFile = await fileSystem.getFile(srcPath)
            if (newElemFile) {
                const attrs = elem.attributes
                delete attrs.src
                const newElem = await renderAnyAsHTML(newElemFile, attrs, elem.childNodes.join(''), dirPath, stackLimit)
                elem.parentNode.exchangeChild(
                    elem,
                    newElem
                )
            } else {
                elem.parentNode.exchangeChild(
                    elem,
                    `${srcPath} not found`
                )
                console.error(`${srcPath} not found`)
            }
        }
    }
    return root
}

async function renderHTML(html, fileSystem) {
    'Render HTML ONLY input'
    return (await _renderHTML(html, {}, null, fileSystem, '/', RENDER_RECURSION_LIMIT)).toString()
}

async function renderAnyAsHTML(file, props = {}, children = null, relativePath, stackLimit) {
    'Render any input as HtmlElement'
    const fileSystem = file.fileSystemManager
    return (await _renderHTML(await file.content(), props, children, fileSystem, relativePath, stackLimit))
}

async function renderAny(file) {
    'Render any input as html string'
    const fileSystem = file.fileSystemManager
    return (await _renderHTML(await file.content(), {}, null, fileSystem, '/', RENDER_RECURSION_LIMIT)).toString()
}

exports.renderHTML = renderHTML
exports.renderAny = renderAny
