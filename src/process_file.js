const htmlparser2 = require("htmlparser2");
const selfClosing = new Set([
    'area',
    'base',
    'col',
    'embed',
    'hr',
    'br',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
    'command',
    'keygen',
    'menuitem',
])

class Template{
    
}

function makeTemplate(content){
    const list = []
    const keys = {}
    let html = ''
    const parser = new htmlparser2.Parser({
        onopentag(name, attributes) {
            html += `<${name}`
            for(k in attributes){
                if(!attributes[k]) html += ' '+k
                else html += ` ${k}="`+escapeHtml(attributes[k])+'"'
            }
            if(selfClosing.has(name)) html += '/>'
            else  html += '>'
        },
        ontext(text) {
            html += text
        },
        onclosetag(tagname) {
            if(!selfClosing.has(tagname)) html += `</${tagname}>`
        },
    })
    parser.write(content)
    parser.end()
    return html
}

function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

exports.makeTemplate = makeTemplate 
