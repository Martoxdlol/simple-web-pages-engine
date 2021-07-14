# simple-web-pages-engine


## Render

Render document with data:
Example data: `{ 'document_title': "New document", 'content': 'Hi, h r u?\nEnd of document', 'date': '7-7-2021'}`

This sistem supports use of mustache to render data. more at: [https://github.com/janl/mustache.js](https://github.com/janl/mustache.js)

__\_\_main\_\_.html__ file will be used as default for rendering any document

__\_\_main\_\_.html__
```html
<include src="__template__.html" date="{{date}}" title="{{document_title}}">
  {{content}}
</include>
```

__\_\_template\_\_.html__
```html
<html>
  <include src="__head__.html" title="{{title}}">
  <body>
    {{&children}}}
    <!-- or also you can use:
    <children/>
    -->
    <div class="date">{{date}}</date>
  </body>
<html>
```

__\_\_head\_\_.html__
```html
<head>
  <title>{{title}}</title>
</head>
```

## Custom tags
__<include>__
```html
<include src="path of inclueded file" param1="param to be passed to children file" param2="other param">children to be pased to included file</include>
```

__<markdown>__
```html
<markdown includehtml="if true, html content on markdown file will be renderd as html and not flat text"># markdown content passed here will be rendered as html</markdown>
{{#markdown}}#also markdown{{/markdown}}
```
  
  __<loop>__
```html
<loop varname="i" start=5 end=5 step=1>{{i}} - Hi!</loop>
<!-- 
1 - Hi! 
2 - Hi! 
3 - Hi! 
4 - Hi! 
5 - Hi! 
-->
```
