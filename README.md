# simple-web-pages-engine


## Render

Render file with initial data:
Ex: Data: `{ 'document_title': "New document", 'content': 'Hi, h r u?\nEnd of document', 'date': '7-7-2021'}`

index.html
```html
<include src="__template__.html" date="{{date}}" title="{{document_title}}">

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
