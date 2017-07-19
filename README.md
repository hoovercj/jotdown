# PlotDown

PlotDown leverages existing markdown features to provide a rich writing experience in Visual Studio Code. Authors can organize character sheets, locations, and any other information they find important. As they write, PlotDown provides auto-complete for these entities, information about them on hover, and even the ability to find all references to it across the document.

The most important part -- everything will be valid markdown.

Inspired by https://storyshop.io/, PlotDown offers the same critical functionality without the walled garden. PlotDown will be open source and use an open format.

## Spec / Schema
There is a rough [spec](planning/spec.md) of how markdown files must be structured to get the benefits of PlotDown. [requirements.md](planning/requirements.md) goes more into detail about the planned features and how this schema helps make those possible.

## Architecture
### Parser
The parser is a small wrapper on top of 'markdown-to-ast' that walks the ast to extract more information from headings, lists, and links according to the spec mentioned above.

### Language Service
The language service is merely a collection of parsed markdown files with functions for reparsing the files and extracting symbols from them. I would like to make it more efficient and more standalone, inspired by the typescript server, but for the hackathon I think this will suffice.

### VS Code Extension
The VS Code extension has not been started but will interact with the language service to provide the features outlined in [requirements.md](planning/requirements.md).

## Potential Pivots
Right now the description is aimed at stories. What features does it have that are specific to stories? "aliases" are the only one and the ability to differentiate between @ for a person and # for everything else.

### JotDown
If I rename it JotDown and focus on outlining and mindmapping in markdown I can keep the same basic functionality but use a bit more configuration.

Changes from original vision:
* @ could either only return L1 headings, or it could return only headings with a configured tag (person, starred, etc.)
* All headings would be treated as declarations so the parser would need to be updated. "parent" would likley need to be added to the interface
