# Technical Requirements
* Parse markdown to extract:
  - H1 text
  - H2 text
  - List blocks
  - Line, column values

# Features

## Autocomplete via @Mentions and #Tagging
Typing @ must show a list of all people, and a # must show a list of all entities. Aliases must be allowed

### Questions
* How to determine whether an entity is a person or not?
    - YES: Have a special "tags" list under each entity with the "person" tag being used for characters.
    - NO: Use a file or directory contevention. "people.md" or .md files in "people/" folder
* How to differentiate between an entity in a definition file and headings in a story file?
    - NO: Directory structure. Stories and/or definitions must be in a special directory
    - YES: Does it matter?? How many H1 headings will there be? Maybe it can be solved later

### Implementation
* Get all H1 blocks from AST and parse an "Info" H2 block
    - The value of the H1 block is the name of the entity
    - There will be an H2 block with the text "tags" that is followed by a list of tags for that entity. If one of these tags is "person" then it will show up with the @ sign
    - There will be an H2 with the text "aliases" that is followed by a list of alternative names for the entity. that can follow the @ sign.

## Click on an entity to go to the definition of that entity
When an @ or # autocomplete suggestion is accepted, it must be possible to click or ctrl+click on an entity to go to the place that entity was defined

### Questions
* If a full link is used, can I hide the link when the cursor isn't near?

### Implementation
* a full markdown link can be inserted when the completion is accepted such as: [Entity Name](/path/to/file#Entity-Name).
  - The link part won't be clickable if it is hidden, but I should be able to figure out how to expose it for the "go to definition" functionality
  - This may require knowing the source location (file, line)

## Info on Hover
Hovering over an entity must show information about that entity including at least the name, tags, and aliases.

### Questions
* How much info should be shown?
  - Everything from the H1 until the next H1
  - Name, tags, aliases, and the first paragraph of a "Description header?"

### Implementation
* If I show only "known" values from the model, I can construct it or I can reference the markdown directly
* If I show everything, I can just directly show the markdown

## Find all references
It must be possible to find all references to an entity and to navigate between them

### Implementation
* Extract all links
  - Each reference will be a link. Normalize file paths + hashes and group on that.
  - Requires at least filename and line information for each reference.
  - Column number preferred.

## Rename entity
STRETCH GOAL
An entity must be renameable. When renamed, each hash in a reference must be updated to match that and each instance of that alias (or original name) must also be renamed.

## Tree View
VS Code should display a tree view listing all of the entries grouped by tags