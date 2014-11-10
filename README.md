# Sketch Notebook

Easily manage sidebar comments for documenting design.

## Installation

There are two ways to install this plugin:

**A) Using the plugin manager [Sketch Toolbox]:**

1. [Download Sketch Toolbox]
2. Unzip the archive and run Sketch Toolbox
3. Type "Notebook" into the search input or navigate through the list until you find it
4. Click "Install"

Thats it.

![Sketch Toolbox](assets/readme_images/sketchtoolbox.gif?raw=true "Sketch Toolbox")


**B) Manual installation:**

1. [Download the plugin]
2. Unzip the archive
3. (Optional) Rename it to "Sketch Notebook"
4. Place the folder into your Sketch Plugins folder by navigating to Sketch > Plugins > Reveal Plugins Folder…

It should look like this:

![Sketch Plugins Folder](assets/readme_images/sketchfolder.png?raw=true "Sketch Plugins Folder")

  
## Using the plugin

Now you can use the plugin from the "Plugins" menu:

![Plugins menu](assets/readme_images/pluginmenu.png?raw=true "Plugins menu")

>**Remember:** The first time this plugin runs, it will automatically add a page to store assets. Please do not touch anything inside that page.


  
### Add Comment `ctrl` + `alt` + `⌘` + `9`
1. Select any layer of your document
2. Run the "Add Comment" command
3. Type the comment title and detail. 

That's it.

![Adding a comment](assets/readme_images/add_comment.gif?raw=true "Adding a comment")
  

  
### Update Comments `ctrl` + `alt` + `⌘` + `8`
Run this command anytime to update the sidebar. Here is a list of things that you can do:
  

  
#### Reorder comments
1. Select the layer group that containts the comment you want to move
2. Place it wherever you want (the plugin will automatically read the "y" value of that group to order the comments)
3. Run "Update Comments" command (`ctrl` + `alt` + `⌘` + `8`)

They will automatically reorder and renumber.

![Reorder comment](assets/readme_images/reorder.gif?raw=true "Reorder")
  
  
  
#### Edit comment content
1. Just edit them as normal layers
2. Run "Update Comments" command (`ctrl` + `alt` + `⌘` + `8`)

![Edit comment](assets/readme_images/edit_comment.gif?raw=true "Edit comment")

>**Titles:** If you edit the comment title and it reaches two lines or longer, you'll need to run the command "Realign Comments" twice to set everything in place ([see example]). This will be fixed in future releases.
  
  
  
#### Delete comment
1. Select the layout group that contains the comment you want to remove
2. Delete it
3. Run "Update Comments" command (`ctrl` + `alt` + `⌘` + `8`)

Again, all comments will be automatically reordered and renumbered.

![Delete comment](assets/readme_images/delete_comment.gif?raw=true "Delete comment")


#### Relocate Indicators
1. Move or transform commented layers
2. Run "Update Comments" command (`ctrl` + `alt` + `⌘` + `8`) to relocate its indicators.
  
![Relocate Comment Indicators](assets/readme_images/relocate_indicators.gif?raw=true "Relocate Comment Indicators")

  
### Toggle Sidebar Visibility `ctrl` + `alt` + `⌘` + `0`
This command is pretty self-explanatory... toggle the visibility of the sidebar by running it.

![Toggle Sidebar Visibility](assets/readme_images/toggle_visibility.gif?raw=true "Toggle Sidebar Visibility")

## Version history

| Version    | Release date  | Description     |
| ---------- | ------------- | --------------- |
| 0.0.1      | 30/10/2014    | Spike release   |


## Feedback

Please keep in mind that this is just an initial release to test how it works in the real world. However, if you found any issue or have any suggestions for improvement of the plugin, please [open an issue].


## License

**The MIT License (MIT)**

Copyright (c) 2014 Marcos Vidal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.




[Download the plugin]:https://github.com/marcosvidal/Sketch-Notebook/archive/master.zip
[see example]:assets/readme_images/edit_title.gif?raw=true
[open an issue]:https://github.com/marcosvidal/Sketch-Notebook/issues/new
[Sketch Toolbox]:http://www.sketchtoolbox.com
[Download Sketch Toolbox]:http://sketchtoolbox.com/Sketch%20Toolbox.zip