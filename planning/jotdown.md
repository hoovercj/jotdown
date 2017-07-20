# JotDown
 An extensible "parser" and "language service" for markdown

## Parser
The base parser will simplly walk the Markdown AST and emit no symbols.
Plugins can register, though, and at each node a "visit" function will be called on the plugins in the order that the plugins were registered.
The plugins will have access to the ast node itself, the node's parent, and a shared state object.

### Interface
new Parser(plugins)
registerPlugin(plugin)
removePlugin(plugin)
parse(filename, contents) -> SymbolInfo[]

### Registering plugins
- Pass an array of plugin module names to "require" to the parser constructor. These must resolve to a module with a top level "walk" function.
- Pass an array of "visit" functions.
- Register plugins directly on a parser instance

### Symbol Generators:
- headings
  - headings: H1, H2, etc.
  - heading-links: links to headings, i.e. `[text](../file.md#heading-text)`
- tags: a list item under a heading with the shape `- tags: tag1, tag2, tag3`
- aliases: a list item under a heading with the shape `- aliases: alias1, alias2, alias3` 

## Language Service
The base language service will provide stubs for each of the methods needed to provide editor functionality.
Plugins can be registered that will "decorate" the base language service to provide the implementations.

### Interface
new LanguageService(plugins)
registerPlugin(plugin)
removePlugin(plugin)
onDocumentChanged(document, text)

provideCompletionItems
provideDefinition
provideDocumentLinks
provideDocumentHighlights
provideDocumentSymbols
provideWorkspaceSymbols
provideHover
provideReferences
etc.

### Registering plugins
- Pass an array of plugin module names to "require" to the language service constructor. These must resolve to a module with a top level "init" function which returns a decorated language service (based on the typescript langugage service plugins [described here](https://github.com/Microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin#setup-and-initialization))
- Pass an array of "init" functions.
- Register plugins directly on a language service instance

### Language Service Plugins
- heading
  - heading symbol provider: workspace and file symbol providers should show all headings
  - heading completion provider: typing # in text will provide a list of all workspace headings that are defined, accepting it will generate a link
  - heading-link symbol provider: file symbol provider should show all heading links
  - heading-link hover provider: hovering on a heading link should show a hover of the heading body
  - heading reference provider: find all references of a heading and heading links
  - heading-link formatter: format heading links by hiding the url and brackets and coloring them
- tag
  - completion provider: if you're in a tag list, suggest tags that you've used before
  - reference provider: find all references should show all headings that use this tag 
  - mention completion provider: typing @ in text will find all tags with a configured tag (default: person) and provide a list of all parent symbols as completion options
- alias completion provider: add alias completions, and if you accept them then it is like accepting a completion for the parent header, but it uses the alias text


## Model
### Core Data structures
- SymbolLocation
  - Range
  - Uri
- SymbolInfo
  - Name: main value for the symbol, shown to the user
  - Kind: given by the parser
  - SymbolLocation: file and line/col range
  - Data: whatever data parser plugin added
  - Parent: the parent to this symbol. i.e. tags belong to a heading  
### symbol types provided by plugins and the data they add
- heading
- heading-link 
  - value: the value between []
  - url: the value between ()
- tag
- alias