# Node
- The ast node I have defined

# Program
- Nodes
- nameTable (where are all the names located)



VS Code -> Language Service

onFileChanged(filepath, contents) -> service.updateFile(filepath, contents)
* filepath: absolute file path
* contents: string contents of file


getDocumentSymbols(filepath) -> service.getDocumentSymbols(filepath):
                                    -> service.getDocumentUsages(filepath)
                                    -> service.getDocumentDeclarations(filepath)
* in: filepath: absolute file path
* out: 
  * name: string
  * kind: SymbolKind
  * containerName: string
  * location: Location (uri and line/col)

getWorkspaceSymbols -> service.getWorkspaceDeclarations
* out: 
  * name: string
  * kind: SymbolKind
  * containerName: string
  * location: Location (uri and line/col)

provideReferences(document, position, includeDeclaration) ->
                                service.getAllSymbolReferences(symbolPath)
                                    -> service.getSymbolDeclaration(symbolPath)
                                    -> service.getSymbolUsages(symbolPath)
* out:
  * location: Location (uri and line/col)