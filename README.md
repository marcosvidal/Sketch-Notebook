# Sketch Notebook

Easily manage sidebar comments for documenting design.



## Installation

1. [Download the plugin]
2. Unzip the archive
3. (Optional) Rename it to "Sketch Notebook"
4. Place the folder into your Sketch Plugins folder by navigating to Sketch > Plugins > Reveal Plugins Folder…

It should look like this:

![Sketch Plugins Folder](assets/readme_images/sketchfolder.png?raw=true "Sketch Plugins Folder")

  
## Using the plugin

Now you can use the plugin from the "Plugins" menu:

![Plugins menu](assets/readme_images/pluginmenu.png?raw=true "Plugins menu")

>**Remember:** The first time this plugin runs, it will automatically add a page to store assets. PLease do not touch anything inside that page.


  
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
  

  
### Toggle Sidebar Visibility `ctrl` + `alt` + `⌘` + `0`
This command is pretty self-explanatory... toggle the visibility of the sidebar by running it.

![Toggle Sidebar Visibility](assets/readme_images/toggle_visibility.gif?raw=true "Toggle Sidebar Visibility")

### Relocate Indicators `ctrl` + `alt` + `⌘` + `0`
Run this command after moving or transforming commented layers to relocate its indicators.

![Relocate Comment Indicators](assets/readme_images/relocate_indicators.gif?raw=true "Relocate Comment Indicators")
  
  
  
[Download the plugin]:https://github.com/marcosvidal/Sketch-Notebook/archive/master.zip
[see example]:assets/readme_images/edit_title.gif?raw=true
[template]:assets/Notebook%20Assets.sketch?raw=true