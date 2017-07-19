## Parsing
I need to parse the markdown to extract structured data from it. This will include entity names, information, tags, etc.

The first question I need to ask myself is exactly how much structure I need to have and what information I need to be able to parse.

First choice: markdown-to-ast

### markdown-to-ast
* Based on remark
* Great location information
* Includes offset and line/column
* Parses links well
* Playground: http://textlint.github.io/markdown-to-ast/example/

### MarkdownIt 
* Does not nest headings
* Spits out a stream of tokens
* Provides line numbers
* Parses links well
https://stackoverflow.com/questions/40442058/convert-markdown-to-json-object


### Commonmark
* The XML output is quite good. Great position information, very clear and easy to read
* But it is XML...how to best process this?

### Markdown-Tree

* Uses marked under the hood
* Nests by headings
* Spits out raw stream of tokens
* Does not handle lists
* Does not detect links well
* Does not provide col/ln numbers

Example:
```json
{
    "type": "Document",
    "children": [
        {
            "type": "Heading",
            "text": "John Doe",
            "children": [
                {
                    "type": "Heading",
                    "text": "Info",
                    "children": [],
                    "depth": 2,
                    "tokens": [
                        {
                            "type": "list_start",
                            "ordered": false
                        },
                        {
                            "type": "list_item_start"
                        },
                        {
                            "type": "text",
                            "text": "type: person"
                        },
                        {
                            "type": "list_item_end"
                        },
                        {
                            "type": "list_item_start"
                        },
                        {
                            "type": "text",
                            "text": "tags: this, that, other"
                        },
                        {
                            "type": "list_item_end"
                        },
                        {
                            "type": "list_item_start"
                        },
                        {
                            "type": "text",
                            "text": "aliases: John, James"
                        },
                        {
                            "type": "list_item_end"
                        },
                        {
                            "type": "list_item_start"
                        },
                        {
                            "type": "text",
                            "text": "relationships:"
                        },
                        {
                            "type": "list_start",
                            "ordered": false
                        },
                        {
                            "type": "list_item_start"
                        },
                        {
                            "type": "text",
                            "text": "[Jane Doe](#Jane-Doe): sister"
                        },
                        {
                            "type": "space"
                        },
                        {
                            "type": "list_item_end"
                        },
                        {
                            "type": "list_end"
                        },
                        {
                            "type": "list_item_end"
                        },
                        {
                            "type": "list_end"
                        }
                    ]
                }
            ],
            "depth": 1,
            "tokens": []
        },
        {
            "type": "Heading",
            "text": "Jane Doe",
            "children": [
                {
                    "type": "Heading",
                    "text": "Info",
                    "children": [],
                    "depth": 2,
                    "tokens": [
                        {
                            "type": "list_start",
                            "ordered": false
                        },
                        {
                            "type": "list_item_start"
                        },
                        {
                            "type": "text",
                            "text": "type: person"
                        },
                        {
                            "type": "list_item_end"
                        },
                        {
                            "type": "list_item_start"
                        },
                        {
                            "type": "text",
                            "text": "tags: this, that, other"
                        },
                        {
                            "type": "list_item_end"
                        },
                        {
                            "type": "list_item_start"
                        },
                        {
                            "type": "text",
                            "text": "aliases: John, James"
                        },
                        {
                            "type": "list_item_end"
                        },
                        {
                            "type": "list_item_start"
                        },
                        {
                            "type": "text",
                            "text": "relationships:"
                        },
                        {
                            "type": "list_start",
                            "ordered": false
                        },
                        {
                            "type": "list_item_start"
                        },
                        {
                            "type": "text",
                            "text": "[John](#John-Doe): brother"
                        },
                        {
                            "type": "list_item_end"
                        },
                        {
                            "type": "list_end"
                        },
                        {
                            "type": "list_item_end"
                        },
                        {
                            "type": "list_end"
                        }
                    ]
                }
            ],
            "depth": 1,
            "tokens": []
        }
    ],
    "parent": null
}
```

### Drafter
Drafter appears more suited for using markdown to creating self-documenting schemas. You define a schema in markdown that can be automatically converted to HTML as documentation, and can be parsed into a json schema. This is not what I need. The section must be prefixed with a special block, links must refer to objects within the schema, etc.