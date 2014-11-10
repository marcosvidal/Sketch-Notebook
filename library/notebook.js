//#import 'Notebook/library/sandbox-sketch-utils.js'

var com = {};

com.notebook = {

    config : {
        commentVMargin : 30,
        indicatorOffset : 30,
        sidebarWidth : 500,
        sidebarHeight : 480,
        sidebarX : 0,
        sidebarY : 0
    },

    debugLog: function(msg){
        if(this.debug) log(msg);
    },

    alert: function (msg, title) {
        title = title || "Sketch NoteBook";
        var app = [NSApplication sharedApplication];
        [app displayDialog:msg withTitle:title];
    },

    createAlertBase: function () {
        this.debugLog("creating alertbase");
        var alert = COSAlertWindow.new();
        //var icon = NSImage.alloc().initByReferencingFile(pluginPath + '/lib/' + service + '.icns');
        //alert.setIcon(icon);
        alert.addButtonWithTitle('OK');
        alert.addButtonWithTitle('Cancel');
  
        return alert;
    },

    dump_obj: function(obj){
        this.debugLog("#####################################################################################")
        this.debugLog("## Dumping object " + obj )
        this.debugLog("## obj class is: " + [obj className])
        this.debugLog("#####################################################################################")
  
        this.debugLog("############################# obj.properties:")
        this.debugLog([obj class].mocha().properties())
        this.debugLog("############################# obj.propertiesWithAncestors:")
        this.debugLog([obj class].mocha().propertiesWithAncestors())
  
        this.debugLog("############################# obj.classMethods:")
        this.debugLog([obj class].mocha().classMethods())
        this.debugLog("############################# obj.classMethodsWithAncestors:")
        this.debugLog([obj class].mocha().classMethodsWithAncestors())
  
        this.debugLog("############################# obj.instanceMethods:")
        this.debugLog([obj class].mocha().instanceMethods())
        this.debugLog("############################# obj.instanceMethodsWithAncestors:")
        this.debugLog([obj class].mocha().instanceMethodsWithAncestors())
  
        this.debugLog("############################# obj.protocols:")
        this.debugLog([obj class].mocha().protocols())
        this.debugLog("############################# obj.protocolsWithAncestors:")
        this.debugLog([obj class].mocha().protocolsWithAncestors())
  
        this.debugLog("############################# obj.treeAsDictionary():")
        this.debugLog(obj.treeAsDictionary())
    },

    refreshPage: function() {
        this.debugLog("refreshing page")
        var c = doc.currentPage();
        doc.setCurrentPage(0);
        doc.setCurrentPage(doc.pages().count() - 1);
        doc.setCurrentPage(c);
    },

    showMessage: function(msg){
        var error = [[NSTask alloc] init]
        
        [error setLaunchPath:"/bin/bash"]
        [error setArguments:["-c", "afplay /System/Library/Sounds/Basso.aiff"]]

        // [error setLaunchPath:"/bin/bash"]
        // [error setArguments:["-c", 'say -v "Vicki" "dammit"']]

        [error launch]

        [doc showMessage: msg]; 
    },

    checkSelection : function(sel){
        this.debugLog("checking for selected layers");
        if (sel > 0){
            return true;
        }else{
            this.showMessage("Select any layer or group to add a comment");
            return false;
        }
    },

    addSidebar : function(){
        this.debugLog("adding sidebar")
        var artboard = [[doc currentPage] currentArtboard],
            sidebar = this.getAsset('sidebar').duplicate(),
            sX = artboard.frame().width(),
            sHeight = artboard.frame().height(),
            aWidth = artboard.frame().width() + 500;

        sidebar.parentGroup().removeLayer(sidebar);
        artboard.addLayer(sidebar);

        sidebar.setName("--nb--sidebar");
        sidebar.frame().setX(sX);
        sidebar.frame().setY(0);

        this.setSidebarHeight(sidebar);
        this.setSidebarPageName(sidebar);
        sidebar.setIsVisible(false);
        return sidebar;
    },

    predicate: function(format,container,returnArray){
        if(!format || !format.key  || !format.match){
            this.debugLog("No format to predicate");
            return false;
        }
        var predicate = NSPredicate.predicateWithFormat(format.key,format.match),
            container = container || doc.currentPage(),
            layers;

        //this.debugLog("getting layer from container: "+container);
        //this.debugLog("predicate: "+format.key+" -- "+format.match);

        if(container.pages){
            layers = container.pages();
        }else{
            layers = container.children();
        }

        var queryResult = layers.filteredArrayUsingPredicate(predicate);

        if(returnArray) return queryResult;

        if (queryResult.count()==1){
            return queryResult[0];
        } else if (queryResult.count()>0){
            return queryResult;
        } else {
            this.debugLog("no layer matched while predicating")
            return false;
        }
    },

    setSidebarPageName: function(sidebar){
        this.debugLog("setting screen name");
        var sidebar = sidebar || this.getSidebar,
            layer = this.predicate({key : "(name != NULL) && (name == %@)",match : "Page Title"}, sidebar),
            pageName = sidebar.parentGroup().name();
        
        this.setStringValue(layer,pageName);
    },

    setSidebarHeight: function(sidebar){
        this.debugLog("setting sidebar height")
        var sidebar = sidebar || this.getSidebar(),
            artboard = sidebar.parentGroup(),
            height = artboard.frame().height(),
            bgLayer = this.predicate({key : "(name != NULL) && (name == %@)",match : "bg"}, sidebar);
            //bgLayer = [bgLayer objectAtIndex:0];

        bgLayer.frame().setHeight(height);

    },

    getSidebar : function(){
        this.debugLog("getting sidebar")
        var ab = [[doc currentPage] currentArtboard],
            sidebar = this.predicate({key : "(name != NULL) && (name == %@)",match : "--nb--sidebar"}, ab);

        if(sidebar == false) {
            sidebar = this.addSidebar();
        }else{
            return sidebar;
        }

        return sidebar;
    },

    getSidebarWidth: function(sidebar){
        this.debugLog("getting sidebar width")
        var sidebar = sidebar || this.getSidebar(),
            layers = [sidebar layers],
            layer = this.predicate({key : "(name != NULL) && (name == %@)",match : "bg"}, sidebarLayers);

        if (layer) {
            //layer = [layer objectAtIndex:0];
            var sidebarWidth = layer.frame().width();
            return sidebarWidth;
        };
        return nil;
        
    },

    methodsFor: function(obj){
        this.debugLog([obj class].mocha().instanceMethods())
    },

    alertHandler: function(alert, responseCode){
        // The OK button will return a code of 1000
        // Cancel is 1001.
        // The codes are odd. They are based off the button's position in the view.
        // They are explain in more detail in the NSAlert docs
        // https://developer.apple.com/library/mac/documentation/cocoa/reference/applicationkit/classes/NSAlert_Class/Reference/Reference.html#//apple_ref/doc/constant_group/Button_Return_Values
        // There's no anchor to it, but search for "Button Return Values" in the page
        if (responseCode == "1000") {

          var opts = {
            title: valAtIndex(alert, 1),
            comment: valAtIndex(alert, 3)
          }
          return opts;

        }else{
            this.showMessage("Canceled")
        }

    },

    getCommentedLayers: function(){
        var comments = this.getCommentsGroup().layers(),
            commentedLayers = [];
        if(comments.count()>0){
            for (var i = 0; i < comments.count(); i++) {
                var comment = [comments objectAtIndex:i];
                    commentedLayerID = (comment.name()).split("####")[3];
                    commentedLayers.push(commentedLayerID)
            };
        }

        return commentedLayers;
    },

    isCommented: function(el){
        this.debugLog("Checking if selected layer is already commented");
        var objID = el.objectID(),
            commentedLayers = this.getCommentedLayers(),
            isCommented = false;

        if (commentedLayers.length > 0){
            for (var i = 0; i < commentedLayers.length; i++) {
                if(objID == commentedLayers[i]) isCommented = true;
            };
        }

        //return isCommented;
        return isCommented;
    },

    addComment: function () {
        this.debugLog("adding comment")
        var elementSelected = this.checkSelection([selection count]);

        if(elementSelected){

            var el = selection[0];

            var page = [doc currentPage],
            artboard = [page currentArtboard];
            if(!artboard){
                this.showMessage("Please add an artboard to use this plugin");
                return false;
            }


            var alreadyCommented = this.isCommented(el);

            if(alreadyCommented) {
                this.showMessage("Dude, this layer is already commented...")
                return;
            }



            
            var panel = this.createAlertBase(),
                comment;            

            panel.setMessageText("Sketch Notebook");
            panel.setInformativeText("Set comment title and content for \""+el.name()+"\"");
            panel.addTextLabelWithValue("Title");
            panel.addTextFieldWithValue(el.name());
            panel.addTextLabelWithValue("Comment");

            var textComment = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 10, 300, 200)];
            textComment.setStringValue("Just another comment");
            panel.addAccessoryView(textComment);

            var userInput = panel.runModal();

            if(userInput == "1000"){
                comment = {
                    'text' : (panel.viewAtIndex(3).stringValue()),
                    'title' : panel.viewAtIndex(1).stringValue()
                };
                
            }else{
                comment = false;
                this.showMessage("Cancelled");
                return;
            }

            var sidebar = this.getSidebar(),
                container,
                ix = el.absoluteRect().x(),
                iy = el.absoluteRect().y();

            if(!sidebar.isVisible()) this.toggleSidebar();

            var commentGroup = this.getCommentsGroup(sidebar),
                c = this.getAsset('comment');
                c  = this.cloneLayer(c);

            //var newY = this.getCommentsHeight(sidebar);
            //this.realignComments();
            var newY = this.getLastCommentPosition();

            commentGroup.addLayer(c);
            c.frame().setX(0);
            c.frame().setY(newY);

            var commentId = this.getNewCommentId(),
                commentedLayerID = el.objectID();
            c.setName("####"+commentId+"####"+comment['title']+"####"+commentedLayerID);

            this.setCommentData(c,comment,sidebar);
            this.placeCommentIndicator(commentId,c,sidebar,ix,iy,el);
            this.debugLog("final height: "+this.getCommentsHeight(sidebar))
            this.realignComments();
        }
        
    },

    flags: {
        deletedComments: false
    },

    getNewCommentId: function(){
        this.debugLog("generating comment id")
        var sidebar = sidebar || this.getSidebar(),
            comments = this.getCommentsGroup(sidebar).layers(),
            commentId = 0;
        if(comments.count()>0){
            for (var i = 0; i < comments.count(); i++) {
                var comment = [comments objectAtIndex:i],
                    tmpId = (comment.name()).split("####")[1];
                    tmpId = parseInt(tmpId);
                    if(tmpId>commentId) commentId = tmpId;
            };
        }
        commentId = commentId+1;
        if(this.flags.deletedComments) commentId = commentId - this.flags.deletedComments;
        this.debugLog("comment id: "+commentId)
        return commentId;
    },

    getBallsContainer : function(){
        var artboard = [[doc currentPage] currentArtboard],
            container = this.predicate({key : "(name != NULL) && (name == %@)",match : "--nb--balls"}, artboard);

        if(!container){
            var cWidth = artboard.frame().width() - 500,
                cHeight = artboard.frame().height();
            container = artboard.addLayerOfType("group");
            container.setName("--nb--balls");
            container.frame().setWidth(cWidth);
            container.frame().setHeight(cHeight);
            container.frame().setX(0);
            container.frame().setY(0);
        }

        container.setIsLocked(true);

        return container;
    },

    cloneLayer : function(layer){
        this.debugLog("clonning layer")
        var layer = layer || false,
            clone;
        if(layer){
            clone = layer.duplicate();
            clone.parentGroup().removeLayer(clone);
            return clone;
        }else{
            this.debugLog("no layer to duplicate");
        }
    },

    placeCommentIndicator: function(commentId,c,sidebar,x,y,el){
        this.debugLog("placing indicator")
        var ballsContainer = this.getBallsContainer(),
            commentId = commentId || 1,
            layer = this.predicate({key : "(name != NULL) && (name == %@)",match : "index"}, c),
            indicator = this.cloneLayer(layer);

        ballsContainer.addLayer(indicator);
        indicator.absoluteRect().setX(x+30);
        indicator.absoluteRect().setY(y+30);
        indicator.setName(commentId+"####"+indicator.name())
    },

    createCommentsGroup : function(sidebar){
        this.debugLog("creating comment group")
        var gY = this.getBottomLinePos(sidebar),
            group = sidebar.addLayerOfType("group");
            group.setName("--comments");
            group.frame().setWidth(446);
            group.frame().setX(32);
            group.frame().setY(gY);
        return group;
    },

    // container = this.predicate({key : "(name != NULL) && (name == %@)",match : "--nb--balls"}, artboard);

    getBottomLinePos: function(sidebar){
        this.debugLog("getting bottom line position")
        var bottomLines = this.predicate({key : "(name != NULL) && (name == %@)",match : "bottomLine"}, sidebar),
            pos = this.config.commentVMargin;

        if(bottomLines.count && bottomLines.count() > 1){
            var bottomLines = bottomLines.objectEnumerator();
            while (bottomLine = bottomLines.nextObject()) {
                var bottomLineY = bottomLine.frame().y() + bottomLine.frame().height() + this.config.commentVMargin;
                if(pos < bottomLineY) pos = bottomLineY;
            }
        }else{
            pos = bottomLines.frame().y() + bottomLines.frame().height() + pos;
        }
        this.debugLog("bottom line position: "+pos)
        return pos;

    },

    getCommentsGroup: function(sidebar){
        var sidebar = sidebar || this.getSidebar(),
            commentsGroup  = this.predicate({key : "(name != NULL) && (name == %@)", match : "--comments"}, sidebar);

        if(!commentsGroup) commentsGroup = this.createCommentsGroup(sidebar);

        return commentsGroup;
    },

    alignCommentText: function(comment){
        this.debugLog("aligning comments title and body")
        var title = this.predicate({key : "(name != NULL) && (name == %@)",match : 'comment title'}, comment),
            body = this.predicate({key : "(name != NULL) && (name == %@)",match : 'comment body'}, comment);

        if(body && title){
            var titleH = title.frame().height(),
                titleY = title.frame().y(),
                txtY = titleY + titleH + 5;
            body.frame().setY(txtY);
            var layer = body.parentGroup();
        }else{
            this.debugLog("no body or title to align")
        }
        //[body select:true byExpandingSelection:false];
        //[body select:false byExpandingSelection:false];
    },
        // var sidebar = sidebar || this.getSidebar(),
        //     layers = [sidebar layers],
        //     layer = this.predicate({key : "(name != NULL) && (name == %@)",match : "bg"}, sidebarLayers);

        // if (layer) {
        //     layer = [layer objectAtIndex:0];
        //     var sidebarWidth = layer.frame().width();
        //     return sidebarWidth;
        // };

    realignComments: function(sidebar){
        this.debugLog("realigning comments");
        var sbExists = this.checkArtboardAndSidebar();
        if(!sbExists) return;
        var sidebar = sidebar || this.getSidebar(),
            comments = this.getCommentsGroup(sidebar).layers(),
            sortedComments = [],
            nextY = 0,
            gY = this.getBottomLinePos(sidebar);

        this.checkDeletedComments(comments);

        var cG = this.getCommentsGroup(sidebar);

        //this.debugLog(cG.frame().y).setY(gy)
        cG.frame().setY(gY)


        for (var i = 0; i < comments.count(); i++) {
            var comment = comments.objectAtIndex(i);
            this.alignCommentText(comment);
            sortedComments.push({
                "el" : comment,
                "y" : comment.absoluteRect().y()
            });
        };
        sortedComments = sortedComments.sort(function (a, b) {
                  if (a.y > b.y) {
                    return 1;
                  }
                  if (a.y < b.y) {
                    return -1;
                  }
                  // a must be equal to b
                  return 0;
                });
        this.commentRepositioning(sortedComments);
        this.commentRenumbering(sortedComments);
        this.iRelocation()
    },

    iRelocation: function(){
        this.debugLog("relocating indicators")
        var sidebar = this.getSidebar(),
            comments = this.getCommentsGroup(sidebar).layers(),
            ab = doc.currentPage().currentArtboard(),
            ballsContainer = this.getBallsContainer();

        for (var i = 0; i < comments.count(); i++) {
            var comment = [comments objectAtIndex:i],
                commentId = comment.name().split("####")[1]),
                clID = comment.name().split("####")[3],
                cl = this.predicate({key : "(objectID != NULL) && (objectID == %@)",match : clID}, ab, returnArray=true),
                clc = (cl.count())-1,
                //this.debugLog("saasAS"+cl)
                offset = this.config.indicatorOffset,
                clx = cl[clc].absoluteRect().x() + offset,
                cly = cl[clc].absoluteRect().y() + offset,
                ballsContainer = this.getBallsContainer(),
                indicator = this.predicate({key : "(name != NULL) && (name == %@)",match : commentId+'####index'}, ballsContainer);

            this.debugLog("current position: ["+indicator.absoluteRect().x()+","+indicator.absoluteRect().y()+"]")
            this.debugLog(" future position: ["+clx+","+cly+"]")

            indicator.absoluteRect().setX(clx);
            indicator.absoluteRect().setY(cly);
        };

        

    },

    checkDeletedComments: function(comments){
        this.debugLog("checking for deleted comments")
        var commentsIds = [],
            index,
            ballsContainer = this.getBallsContainer(),
            balls = ballsContainer.layers();

        for (var i = 0; i < comments.count(); i++) {
            var comment = [comments objectAtIndex:i];
            index = (comment.name()).split("####");
            commentsIds.push(index[1]);
        };

        for (var i = 0; i < balls.count(); i++) {
            var indicator = [balls objectAtIndex:i],
                index = (indicator.name()).split("####"),
                index = index[0];
                //this.debugLog(commentsIds.indexOf(index))
            if(commentsIds.indexOf(index)==-1) {
                indicator.parentGroup().removeLayer(indicator);
                if(this.flags.deletedComments==false) this.flags.deletedComments = 0;
                this.flags.deletedComments = this.flags.deletedComments+1;
            }
        };

    },

    commentRepositioning: function(comments){
        this.debugLog("repositioning comments")
        var nextY = 0,
            margin = this.config.commentVMargin;

        for (var i = 0; i < comments.length; i++) {
            var comment = comments[i]['el'];
            comment.frame().setY(nextY);
            comment.frame().setX(0);
            nextY = nextY + comment.frame().height() + margin;
            // [layer select:true byExpandingSelection:false];
            // [layer select:false byExpandingSelection:false];
        };
        
    },

    commentRenumbering: function(comments){
        this.debugLog("renumbering comments")
        var sidebar = this.getSidebar(),
            comments = comments || this.getCommentsGroup(sidebar).layers(),
            ballsContainer = this.getBallsContainer();

        for (var i = 0; i < comments.length; i++) {
            var comment = comments[i],
                index = this.predicate({key : "(name != NULL) && (name == %@)",match : '#'}, comment.el),
                ival = i+1,
                commentId = comment.el.name().split("####")[1]),
                indicator = this.predicate({key : "(name != NULL) && (name == %@)",match : commentId+'####index'}, ballsContainer),
                label = this.predicate({key : "(name != NULL) && (name == %@)",match : '#'}, indicator);
                if(indicator){
                    var ci = comment.el.name().split("####")[1];
                        //commentedLayer = comment.el.name().split("####")[3];
                    //this.debugLog("  comment index:"+ci)
                    //this.debugLog("           ival:"+ival)
                    //this.debugLog("indicator index:"+(indicator.name()).split('####')[0])
                    //this.debugLog("     final name: "+ival+"####index")
                  indicator.setName(commentId+"####index")
                  //this.iRelocation(indicator, commentedLayer)
                }
                this.setStringValue(label,ival.toString());
                this.setStringValue(index,ival.toString());
        };
    },


    setCommentData : function(comment,data,sidebar){
        this.debugLog("setting comment data")
        var layers = comment.layers(),
            commentsGroup = this.getCommentsGroup(sidebar),
            index = this.countComments(sidebar);

        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i],
                layerName = layer.name();

            if(layerName == 'comment title'){
                var title = (data['title']).toUpperCase();
                this.setStringValue(layer,title);
            }
            else if(layerName=='index'){
                var iLayers = layer.children();
                for (var j = 0; j < iLayers.count(); j++) {
                    var iLayer = [iLayers objectAtIndex:j];
                    if(iLayer.name()=="#") this.setStringValue(iLayer,index.toString(),fit=true);
                }
            }
            else if(layerName=='comment body'){
                this.setStringValue(layer,data['text']);
            }

            this.alignCommentText(comment);
            //this.debugLog([[layer parentGroup] adjustFrameToFit])
        };
    },

    setStringValue: function(layer,string, fit){
        var string = string || "new text",
            fit = fit || false;
        this.debugLog("setting string to: "+string)
        layer.setStringValue(string);
        this.txtRefreshSize(layer,fit)
    },

    countComments: function(sidebar){
        return this.getCommentsGroup(sidebar).layers().count();
    },

    txtRefreshSize: function(layer, fit){
        var fit  =fit || false
        this.debugLog("refreshing text size: "+layer)
        if(fit) [layer adjustFrameToFit]
        [layer select:true byExpandingSelection:false];
        [layer select:false byExpandingSelection:false];
    },

    getCommentsHeight : function(sidebar){
        this.debugLog("getting comments height")
        var commentsGroup = this.getCommentsGroup(sidebar),
            comments = commentsGroup.layers(),
            h = 0;
        for (var i = 0; i < comments.count(); i++) {
            var layer = [comments objectAtIndex:i],
                layerH = layer.frame().height();
            h = h + layerH;
        };
        return h;
    },

    getLastCommentPosition : function(sidebar){
        this.debugLog("getting last comments position")
        var sidebar = sidebar || this.getSidebar(),
            comments = this.getCommentsGroup(sidebar).layers(),
            lowerY = 0;
        if(comments.count()>0){
            for (var i = 0; i < comments.count(); i++) {
                var layer = [comments objectAtIndex:i];
                var layerY = layer.frame().y();
                if(layerY > lowerY) {
                    lowerY = layerY+layer.frame().height();
                }
            };
        }
        return(lowerY);
    },

    refreshPage: function() {
        this.debugLog("refreshing page")
        var c = doc.currentPage();
        doc.setCurrentPage(0);
        doc.setCurrentPage(doc.pages().count() - 1);
        doc.setCurrentPage(c);
    },

    addPage: function(name) {
        this.debugLog("adding page")
        var page = doc.addBlankPage(),
            name = name || "New page";
        page.setName(name);
        //doc.setCurrentPage(page);
        //this.refreshPage();
        return page;
    },

    addGroup: function(parent,name){
        this.debugLog("adding group layer")
        var parent = parent || doc.currentPage(),
            group = parent.addLayerOfType("group"),
            name = name || "new group";
        
        group.setName(name);
        group.setNameIsFixed(true)

        return group;
    },

    addRect: function(parent,name,bg,w,h,x,y){
        this.debugLog("adding rect layer")
        var parent = parent || doc.currentPage(),
            name = name || "new layer",
            bg = bg || "#000000",
            bgColor = [MSColor colorWithHex: bg alpha: 1],
            w = w || 400,
            h = h || 400,
            y = y || 0,
            x = x || 0;

        var rect = parent.addLayerOfType("rectangle");
            rect.setName(name);
            rect.setNameIsFixed(true)
            rect.style().fills().addNewStylePart();
            rect.style().fill().setFillType(0);
            rect.style().fill().setColor(bgColor);
            rect.frame().setWidth(w);
            rect.frame().setHeight(h);
            rect.frame().setX(x);
            rect.frame().setY(y);

        return rect;

    },

    addTxt: function(parent,name,color,fontSize,string,w,h,x,y,fixed){
        this.debugLog("adding text layer")
        var parent = parent || doc.currentPage(),
            name = name || "new text layer",
            color = color || "#000000",
            color = [MSColor colorWithHex: color alpha: 1],
            fontSize = fontSize || 14,
            string = string || "Type something",
            w = w || 400,
            h = h || 24,
            x = x || 0,
            y = y || 0,
            fixed = fixed || false; //fixed width

        var textLayer = parent.addLayerOfType("text");

            textLayer.textColor = color;
            textLayer.fontSize = fontSize;

            textLayer.setName(name);
            textLayer.setNameIsFixed(true);
            textLayer.setStringValue(string);
            
            var textLayerFrame = [textLayer frame];
            [textLayerFrame setWidth: w];
            [textLayerFrame setHeight: h];
            
            [textLayerFrame setX: x];
            [textLayerFrame setY: y];

            if(fixed){
                textLayer.setTextBehaviour(1) // BCTextBehaviourFixedWidth
            }

            textLayer.setFontPostscriptName('Raleway')

        return textLayer;
    },

    generateAssets: function(){
        this.debugLog("generating assets")
        var firstCanvas = doc.currentPage(),
            firstAB = doc.currentPage().currentArtboard(),
            sel = selection[0],
            layer = false,
            assets = this.addPage("--nb--assets"),
            sc = {
                width : this.config.sidebarWidth,
                height : this.config.sidebarHeight,
                x : 0,
                y : 0,
                margin : this.config.commentVMargin,
                bg : '#393B36',
                separatorColor : '#4D4E4A',
                contentW : (500 - (this.config.commentVMargin*2))
            };

    // Create sidebar
        this.debugLog("generating assets: sidebar group")
        // group
        var sidebar = assets.addLayerOfType("group");
            sidebar.setName("sidebar");
            sidebar.frame().setWidth(sc.width);
            sidebar.frame().setHeight(sc.height);
            sidebar.frame().setX(sc.x);
            sidebar.frame().setY(sc.y);
        // background
        this.debugLog("generating assets: sidebar background")
        //            addRect(parent,name,bg,w,h,x,y)
        var bg = this.addRect(sidebar,'bg', sc.bg, sc.width, sc.height, sc.x, sc.y);
        //this.storeStyle(bg);

        // Header
        this.debugLog("generating assets: sidebar header")
        var header = sidebar.addLayerOfType("group");
            header.setName("header");
            header.frame().setWidth(sc.contentW);
            header.frame().setHeight(53);
            header.frame().setX(sc.x);
            header.frame().setY(sc.y);
        //              addTxt(parent,name,color,fontSize,w,h,x,y)
        var logo = this.addTxt(header,'Sketch Notebook','#4C504A',20,'Sketch Notebook',sc.width,24,sc.margin,sc.margin),
            topLineY = logo.frame().y() + logo.frame().height() + 20,
            topLine = this.addRect(header,'bottomLine', sc.separatorColor, sc.contentW, 1, sc.margin, topLineY);

        // Metadata group
        this.debugLog("generating assets: sidebar metadata")
        var m = sidebar.addLayerOfType("group"),
            mY = topLine.frame().y() + topLine.frame().height() + sc.margin;
            m.setName("Metadata");
            m.frame().setWidth(sc.contentW);
            //m.frame().setHeight(114);
            m.frame().setX(sc.margin);
            m.frame().setY(mY);

        m.enableAutomaticScaling();
        
        var mInfo = ['PROJECT','DATE','AUTHOR','DEVICE'];
        // Metadata labels & values
        var newY = 0;
        for (var i = 0; i < mInfo.length; i++) {
            var label = this.addTxt(m,'label_'+mInfo[i],'#61625E',11,mInfo[i]+":",100,11,0,newY+3,fixed=true),
                value = this.addTxt(m,'value_'+mInfo[i],'#C4C5C3',14,mInfo[i],360,21,80,newY,fixed=true);
            newY = newY+sc.margin;
            this.txtRefreshSize(label);
            this.txtRefreshSize(value);
        };

        var midLineY = newY + value.frame().height();
            midLine = this.addRect(m,'bottomLine', sc.separatorColor, sc.contentW, 1, 0, midLineY);

        // Screen name
        this.debugLog("generating assets: sidebar screen name")
        var sLx = midLine.absoluteRect().x(),
            sLy = midLine.absoluteRect().y() + midLine.absoluteRect().height() + sc.margin,
            screenLabel = this.addTxt(sidebar,'label_screen','#61625E',11,"SCREEN",100,11,0,0);
        
        screenLabel.absoluteRect().setX(sLx);
        screenLabel.absoluteRect().setY(sLy);
        this.txtRefreshSize(screenLabel);

        var sNy = screenLabel.absoluteRect().y() + screenLabel.absoluteRect().height() + 10,
            screenName = this.addTxt(sidebar,'Page Title','#ffffff',18,"ARTBOARD NAME",300,21,sc.margin,sNy);

        var bottomLineY = screenName.absoluteRect().y() + screenName.absoluteRect().height() + sc.margin,
            bottomLine = this.addRect(sidebar,'bottomLine', sc.separatorColor, sc.contentW, 1, sc.margin, bottomLineY);
        
    
    // Create comment
        // group
        this.debugLog("generating assets: comment")
        var comment = assets.addLayerOfType("group"),
            cX = sc.margin,
            cY = bottomLine.absoluteRect().y() + bottomLine.absoluteRect().height() + sc.margin;

        comment.setName("comment");
        comment.frame().setWidth(sc.contentW);
        comment.frame().setHeight(48);
        comment.frame().setX(cX);
        comment.frame().setY(cY);

        //title
        this.debugLog("generating assets: comment title")
        var titleY = 5,
            title = this.addTxt(comment,'comment title','#ffffff',14,"TITLE",400,16,40,titleY,fixed=true);

        //body
        this.debugLog("generating assets: comment body")
        var bodyY = title.absoluteRect().y() + title.absoluteRect().height() + 10,
            body = this.addTxt(comment,'comment body','#9C9D9B',14,"Comment",400,16,40,bodyY,fixed=true);
            body.frame().setWidth(400);
            //body.setTextWidth(1)
        
        body.absoluteRect().setY(bodyY);

        // index group
        this.debugLog("generating assets: comment index")
        var index = comment.addLayerOfType("group");
            index.setName("index");
            index.frame().setWidth(40);
            index.frame().setHeight(40);
            index.frame().setX(0);
            index.frame().setY(0);

        // index bg
        this.debugLog("generating assets: comment index bg")
        var iBg = this.addRect(index, 'bg', '#55910B', 30, 30, 0, 0);
        var firstObject = [[iBg layers] firstObject];
        [firstObject setFixedRadius:15];
        [firstObject resetPointsBasedOnUserInteraction];

        // index label
        this.debugLog("generating assets: comment index label")
        var iLabel = this.addTxt(index,'#','#ffffff',14,"#",8,16,10,6);
            iLabel.setTextAlignment(2);
            iLabel.setFontPostscriptName('Helvetica Neue')
        this.txtRefreshSize(body);

        // center canvas on sidebar
        // var view = [doc currentView];
        // [view zoomToFitRect:[sidebar absoluteRect]]
        // [view actualSize]
        // return assets page

        doc.setCurrentPage(0);
        doc.setCurrentPage(doc.pages().count() - 1);
        doc.setCurrentPage(firstCanvas)
        doc.currentPage().setCurrentArtboard(firstAB)

        return assets;
        this.debugLog("assets generated")
    },



    storeStyle: function(obj, kind){
        this.debugLog("storing '"+kind+"' styles")
        var layerTextStyles = [[[doc documentData] layerTextStyles]];
        var layerStyles = [[[doc documentData] layerStyles]];
        var layerSymbols = [[[doc documentData] layerSymbols]];


        log(layerTextStyles.insertObject());

        // this.debugLog("layerStyles: "+layerStyles);

        // for (var i=0; i < [layerStyles count]; i++){
        //     this.debugLog([[layerStyles objectAtIndex:i] name]) // MSStyle
        //     var style = [[layerStyles objectAtIndex:i] style]
        //     this.debugLog(style) // MSStyle
        //     this.debugLog(style.fills()) // MSFillStyleCollection
        //     this.debugLog(style.borders()) // MSBorderStyleCollection
        //     this.debugLog(style.shadows()) // MSShadowStyleCollection
        //     this.debugLog(style.innerShadows()) // MSInnerShadowStyleCollection
        //     this.debugLog(style.blur()) // MSStyleBlur
        //     this.debugLog(style.reflection()) // MSStyleReflection
        // }

        // var textStyles = [[[doc documentData] layerTextStyles] objects];
        // this.debugLog("#### text styles:")
        // for (var i=0; i < [textStyles count]; i++){
        //     //this.debugLog([[textStyles objectAtIndex:i] name]) // MSStyle
        //     var style = [textStyles objectAtIndex:i],
        //         styleName = [[textStyles objectAtIndex:i] name],
        //         styleAttrs = style.style().textStyle().attributes();
        //         this.debugLog('######## ' + styleName + ' attrs:');
        //         this.debugLog('########' + styleAttrs)
        //         this.debugLog('########' + style)
        // }

        // // artboard is your artboard where you want to add the text layer to
        // var textLayer = artboard.addLayerOfType("text");

        // // apply attributes
        // textLayer.style().textStyle().setAttributes(textStyle);
    },

    getAsset: function(asset){
        this.debugLog("getting asset")
        var assetsPage = this.predicate({key : "(name != NULL) && (name == %@)", match : "--nb--assets"}, doc);
        if(!assetsPage) assetsPage = this.generateAssets();

        var asset = this.predicate({key : "(name != NULL) && (name == %@)", match : asset}, assetsPage);
        return asset;
    },

    deleteComment: function(){},

    moveArtboards: function(page,offset){
        this.debugLog("moving artboards")
        var page = page || doc.currentPage(),
            offset = offset || 500,
            cab = page.currentArtboard(),
            cabName = cab.name(),
            cabX = cab.frame().x() + cab.frame().width(),
            cabY = cab.frame().y() + cab.frame().height(),
            abs = page.artboards().objectEnumerator();


        while (a = abs.nextObject()) {
            var x = a.frame().x(),
                y = a.frame().y();
            if (a.name() != cabName && x > cabX && y <= cabY) {
                a.frame().addX(offset)
            }
        }
    },

    checkArtboardAndSidebar: function(){
        var page = [doc currentPage],
            artboard = [page currentArtboard];
        if(!artboard){
            this.showMessage("No comments to align.");
            return false;
        }

        var sidebarExists = this.predicate({key : "(name != NULL) && (name == %@)", match : '--nb--sidebar'}, artboard);

        if (!sidebarExists){
            this.showMessage("Dude, this page has no comments! Use 'ctrl + alt + ⌘ + 9' to add a new one.");
            return false;
        }

        return true;

    },

    toggleSidebar: function(){
        this.debugLog("toggling sidebar");
        
        var sbExists = this.checkArtboardAndSidebar();
        if(!sbExists) return;

        var page = [doc currentPage],
            artboard = [page currentArtboard],
            layers = [artboard layers],
            sidebar = false,
            artboard = [[doc currentPage] currentArtboard];



        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i];
            if(layer.name()=='--nb--sidebar'){
                sidebar = layer;
            }
        };
        if(!sidebar) {
            this.showMessage('No comments to show');
        }else{
            var sidebar = this.getSidebar(),
                ballsContainer = this.getBallsContainer(),
                visibility = sidebar.isVisible(),
                sidebarWidth = 500;
            if(visibility==0){
                this.moveArtboards(page,sidebarWidth);
                width = artboard.frame().width() + sidebarWidth;
                artboard.frame().setWidth(width);
                [sidebar setIsVisible:true];
                [ballsContainer setIsVisible:true]
            }else{
                this.moveArtboards(page,-sidebarWidth);
                [sidebar setIsVisible:false]
                [ballsContainer setIsVisible:false]
                width = artboard.frame().width() - sidebarWidth;
                artboard.frame().setWidth(width);
            }
        }

    },

    debug : false

 } 