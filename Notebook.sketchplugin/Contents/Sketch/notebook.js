var com = {};

com.notebook = {

    config : {
        commentVMargin : 30,
        indicatorOffset : 0,
        sidebarWidth : 500,
        sidebarHeight : 480,
        sidebarX : 0,
        sidebarY : 0 
    },

    ctx : {},

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
        // var icon = NSImage.alloc().initByReferencingFile('../Resources/icon.png');
        // alert.setIcon(icon);
        alert.addButtonWithTitle('OK');
        alert.addButtonWithTitle('Cancel');
        return alert;
    },

    dumpObj: function(obj){
        log("#####################################################################################")
        log("## Dumping object " + obj )
        log("## obj class is: " + [obj className])
        log("#####################################################################################")
  
        log("############################# obj.properties:")
        log([obj class].mocha().properties())
        log("############################# obj.propertiesWithAncestors:")
        log([obj class].mocha().propertiesWithAncestors())
  
        log("############################# obj.classMethods:")
        log([obj class].mocha().classMethods())
        log("############################# obj.classMethodsWithAncestors:")
        log([obj class].mocha().classMethodsWithAncestors())
  
        log("############################# obj.instanceMethods:")
        log([obj class].mocha().instanceMethods())
        log("############################# obj.instanceMethodsWithAncestors:")
        log([obj class].mocha().instanceMethodsWithAncestors())
  
        log("############################# obj.protocols:")
        log([obj class].mocha().protocols())
        log("############################# obj.protocolsWithAncestors:")
        log([obj class].mocha().protocolsWithAncestors())
  
        log("############################# obj.treeAsDictionary():")
        log(obj.treeAsDictionary())

    },

    refreshPage: function() {
        this.debugLog("refreshing page")
        var doc = this.ctx.document,
            c = doc.currentPage();
        doc.setCurrentPage(0);
        doc.setCurrentPage(doc.pages().count() - 1);
        doc.setCurrentPage(c);
    },

    runCommand: function(cmd,path){
        var task = [[NSTask alloc] init];    
        task.setLaunchPath("/bin/bash");
        task.setArguments(cmd);
        task.launch();
    },

    showMessage: function(msg){
        // this.runCommand(['-c', 'say "dammit"']);
        this.runCommand(['-c', 'afplay /System/Library/Sounds/Basso.aiff']);
        var doc = this.ctx.document;
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

    settings: function(){

    },

    addSidebar : function(){
        this.debugLog("adding sidebar")
        var selection = this.ctx.selection,
            doc = this.ctx.document,
            artboard = [[doc currentPage] currentArtboard],
            sidebar = this.getAsset('sidebar').duplicate(),
            sX = artboard.frame().width(),
            sHeight = artboard.frame().height(),
            aWidth = artboard.frame().width() + this.config.sidebarWidth;

        sidebar.parentGroup().removeLayer(sidebar);
        artboard.addLayers([sidebar]);

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
        var doc = this.ctx.document,
            predicate = NSPredicate.predicateWithFormat(format.key,format.match),
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
        layer.setIsEditingText(true);
        layer.setIsEditingText(false);
    },

    setSidebarHeight: function(sidebar){
        this.debugLog("setting sidebar height")
        var sidebar = sidebar || this.getSidebar(),
            artboard = sidebar.parentGroup(),
            height = artboard.frame().height(),
            bgLayer = this.predicate({key : "(name != NULL) && (name == %@)",match : "sidebar-bg" }, sidebar);
        bgLayer.frame().setHeight(height);

    },

    getSidebar : function(){
        this.debugLog("getting sidebar")
        var doc = this.ctx.document,
            ab = [[doc currentPage] currentArtboard],
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
        log([obj class].mocha().instanceMethods())
        log([obj class].mocha().instanceMethodsWithAncestors())
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
        this.debugLog("adding comment");
        var selection = this.ctx.selection,
            doc = this.ctx.document,
            elementSelected = this.checkSelection([selection count]);

        if(elementSelected){

            var el = selection[0];

            var page = [doc currentPage],
            artboard = [page currentArtboard];
            if(!artboard){
                this.showMessage("Please add an artboard");
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

            commentGroup.addLayers([c]);
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
        var selection = this.ctx.selection,
            doc = this.ctx.document,
            artboard = [[doc currentPage] currentArtboard],
            container = this.predicate({key : "(name != NULL) && (name == %@)",match : "--nb--balls"}, artboard);

        if(!container){
            var cWidth = artboard.frame().width() - this.config.sidebarWidth,
                cHeight = artboard.frame().height();
            container = artboard.addLayerOfType("group");
            container.setName("--nb--balls");
            container.frame().setWidth(cWidth);
            container.frame().setHeight(cHeight);
            container.frame().setX(0);
            container.frame().setY(0);
            container.setIsLocked(true);
        }

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

        ballsContainer.addLayers([indicator]);
        indicator.absoluteRect().setX(x+30);
        indicator.absoluteRect().setY(y+30);
        indicator.setName(commentId+"####"+indicator.name())
    },

    createCommentsGroup : function(sidebar){
        this.debugLog("creating comment group")
        var gY = this.getBottomLinePos(sidebar),
            groupWidth = this.config.sidebarWidth - (this.config.commentVMargin*2),
            group = sidebar.addLayerOfType("group");
            group.setName("--comments");
            group.frame().setWidth(groupWidth);
            group.frame().setX(this.config.commentVMargin);
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
        var flag = this.getAsset("ManualRelocation");
        if(flag==0) this.iRelocation();
        this.bringToFront();
        this.setSidebarHeight(sidebar);
    },

    bringToFront: function(){
        this.debugLog("bringing comments to front");
        var selection = this.ctx.selection,
            doc = this.ctx.document,
            sidebar = this.getSidebar(),
            balls = this.getBallsContainer(),
            artboard = doc.currentPage().currentArtboard();

            sidebar.parentGroup().removeLayer(sidebar);
            balls.parentGroup().removeLayer(balls);
            artboard.addLayers([sidebar]);
            artboard.addLayers([balls]);
    },

    iRelocation: function(){
        this.debugLog("relocating indicators")
        var selection = this.ctx.selection,
            doc = this.ctx.document,
            sidebar = this.getSidebar(),
            comments = this.getCommentsGroup(sidebar).layers(),
            ab = doc.currentPage().currentArtboard(),
            ballsContainer = this.getBallsContainer();

        for (var i = 0; i < comments.count(); i++) {
            var tmp = [comments objectAtIndex:i];

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

            // this.debugLog("current position: ["+indicator.absoluteRect().x()+","+indicator.absoluteRect().y()+"]")
            // this.debugLog(" future position: ["+clx+","+cly+"]")

            indicator.absoluteRect().setX(clx);
            indicator.absoluteRect().setY(cly);
        };

        

    },

    checkDeletedComments: function(comments){
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
                    indicator.setName(commentId+"####index")
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
                this.setStringValue(layer,data['text'],true);
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
        [layer setIsEditingText:true]
        [layer setIsEditingText:false]
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
        var doc = this.ctx.document,
            c = doc.currentPage();
        doc.setCurrentPage(0);
        doc.setCurrentPage(doc.pages().count() - 1);
        doc.setCurrentPage(c);
    },

    addPage: function(name) {
        this.debugLog("adding page")
        var selection = this.ctx.selection,
            doc = this.ctx.document,
            page = doc.addBlankPage(),
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

    addOval: function(parent,name,bg,w,h,x,y){
        var doc = this.ctx.document,
            parent = parent || doc.currentPage(),
            name = name || "new oval layer",
            bg = bg || "#000000",
            //bg = MSColor.colorWithSVGString(bg),
            //bgColor = [MSColor colorWithHex: bg alpha: 1],
            w = w || 400,
            h = h || 400,
            y = y || 0,
            x = x || 0;

        var ovalShape = MSOvalShape.alloc().initWithFrame(NSMakeRect(x,y,w,h));
        var shapeGroup = MSShapeGroup.shapeWithPath(ovalShape)
        var fill = shapeGroup.style().fills().addNewStylePart();
        fill.color = MSColor.colorWithSVGString(bg);

        parent.addLayers([shapeGroup])

        return shapeGroup;
    },

    addRect: function(parent,name,bg,w,h,x,y){
        this.debugLog("adding rect layer")
        var doc = this.ctx.document,
            parent = parent || doc.currentPage(),
            name = name || "new rect layer",
            bg = bg || "#000000",
            //bg = MSColor.colorWithSVGString(bg),
            //bgColor = [MSColor colorWithHex: bg alpha: 1],
            w = w || 400,
            h = h || 400,
            y = y || 0,
            x = x || 0;

        var rect = parent.addLayerOfType("rectangle");

        var fill = rect.style().fills().addNewStylePart();
            fill.color = MSColor.colorWithSVGString(bg);

            rect.setName(name);
            rect.setNameIsFixed(true)
            // rect.style().fills().addNewStylePart();
            // rect.style().fill().setFillType(0);
            // rect.style().fill().setColor(bgColor);
            rect.frame().setWidth(w);
            rect.frame().setHeight(h);
            rect.frame().setX(x);
            rect.frame().setY(y);

        return rect;

    },

    setSidebarStyle: function(theme){
        this.debugLog("setting sidebar style");
        var theme = theme || "dark";
        if(theme == "sepia"){
            var primary = "#494841",
                secondary = "#828072",
                separator = "#BDBCB5",
                bgcolor = "#E4E3D6";
        }

        if(theme == "dark"){
            var primary = "#f0f0f0",
                secondary = "#aaaaaa",
                separator = "#555555",
                bgcolor = "#222222";
        }

        if(theme == "bright"){
            var primary = "#222222",
                secondary = "#777777",
                separator = "#cccccc",
                bgcolor = "#ffffff";
        }
        var sidebar = this.getSidebar(),
            currentPage = 
            comments = this.getCommentsGroup(),
            background = this.predicate({key : "(name != NULL) && (name == %@)",match : 'sidebar-bg'}, sidebar) || false,
            header = this.predicate({key : "(name != NULL) && (name == %@)",match : 'header-h1'}, sidebar) || false,
            bottomLine = this.predicate({key : "(name != NULL) && (name == %@)",match : 'bottomLine'}, sidebar) || false,            
            label = this.predicate({key : "(name != NULL) && (name == %@)",match : 'label'}, sidebar) || false,
            label2 = this.predicate({key : "(name != NULL) && (name == %@)",match : 'label_Date'}, sidebar) || false,
            label3 = this.predicate({key : "(name != NULL) && (name == %@)",match : 'label_Author'}, sidebar) || false,
            value = this.predicate({key : "(name != NULL) && (name == %@)",match : 'value_Project'}, sidebar) || false,
            value2 = this.predicate({key : "(name != NULL) && (name == %@)",match : 'value_Date'}, sidebar) || false,
            value3 = this.predicate({key : "(name != NULL) && (name == %@)",match : 'value_Author'}, sidebar) || false,
            labelScreen = this.predicate({key : "(name != NULL) && (name == %@)",match : 'label_screen'}, sidebar) || false,
            pageTitle = this.predicate({key : "(name != NULL) && (name == %@)",match : 'Page Title'}, sidebar) || false,
            commentTitle = this.predicate({key : "(name != NULL) && (name == %@)",match : 'comment title'}, comments) || false,
            commentBody = this.predicate({key : "(name != NULL) && (name == %@)",match : 'comment body'}, comments) || false;



        if(background) background.style().fill().color = MSColor.colorWithSVGString(bgcolor);
        if(bottomLine) bottomLine[0].style().fill().color = MSColor.colorWithSVGString(separator);
        if(header) this.updateTextStyleColor(header, primary)
        if(label) this.updateTextStyleColor(label, secondary)
        if(value) this.updateTextStyleColor(value, primary)
        if(labelScreen) this.updateTextStyleColor(labelScreen, secondary)
        if(pageTitle) this.updateTextStyleColor(pageTitle, primary)
        if(commentTitle) this.updateTextStyleColor(commentTitle, primary)
        if(commentBody) this.updateTextStyleColor(commentBody, secondary)
        

    },

    // updateTextStyleColor: function(obj, color){
    //     if(!obj) return;
    //     var color = color || "#000000";

    //     if(obj.length){
    //         for (var i = 0; i < obj.count(); i++) {
    //             var layer = [obj objectAtIndex:i];
    //             layer.textColor = MSColor.colorWithSVGString(color);
    //             layer.setIsEditingText(true);
    //             layer.setIsEditingText(false);
    //         };
    //     }else{
    //         obj.textColor = MSColor.colorWithSVGString(color);
    //         obj.setIsEditingText(true);
    //         obj.setIsEditingText(false);
    //     }

    //     this.ctx.document.reloadInspector();        
        
    // },

    updateTextStyleColor: function(obj, color){
        if(!obj) return;
        var color = color || "#000000";

        if(obj.length){
            for (var i = 0; i < obj.count(); i++) {
                var layer = [obj objectAtIndex:i];
                layer.textColor = MSColor.colorWithSVGString(color);
                layer.setIsEditingText(true);
                layer.setIsEditingText(false);
            };
            obj = obj.objectAtIndex(0);
        }else{
            obj.textColor = MSColor.colorWithSVGString(color);
            obj.setIsEditingText(true);
            obj.setIsEditingText(false);
        }

        var docData = this.ctx.document.documentData();
        var sharedStylesPredicate = NSPredicate.predicateWithFormat("objectID == %@", obj.style().sharedObjectID());
        var sharedStyle = docData.layerTextStyles().objects().array().filteredArrayUsingPredicate(sharedStylesPredicate).firstObject();

        if(sharedStyle) {
            docData.layerTextStyles().synchroniseInstancesOfSharedObject_withInstance(sharedStyle, obj.style())
        }
        
        this.ctx.document.reloadInspector();        
        
    },

    addTxt: function(parent,name,color,fontSize,string,w,h,x,y,fixed){
        this.debugLog("adding text layer");
        var doc = this.ctx.document,
            parent = parent || doc.currentPage(),
            name = name || "new text layer",
            color = color || "#000000",
            // color = [MSColor colorWithHex: color alpha: 1],
            color = MSColor.colorWithSVGString(color),
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
            this.setStringValue(textLayer, string);
            
            var textLayerFrame = [textLayer frame];
            [textLayerFrame setWidth: w];
            //[textLayerFrame setHeight: h];
            
            [textLayerFrame setX: x];
            [textLayerFrame setY: y];

            if(fixed){
                textLayer.setTextBehaviour(1) // BCTextBehaviourFixedWidth
            }

            textLayer.setFontPostscriptName('HelveticaNeue')

        return textLayer;
    },

    getMetadata: function(){

        var selection = this.ctx.selection,
            doc = this.ctx.document,
            name = ([doc displayName]).split('.sketch')[0],
            author = NSUserName(),
            objToday = new Date(),
            day = objToday.getDate(),
            month = objToday.getMonth(),
            yr = objToday.getFullYear(),
            date = month+"/"+day+"/"+yr;

        var meta = {
            name : name,
            date : date,
            author : author
        };

        return meta;
    },

    updateMetadata: function(){
        var doc = this.ctx.document,
            meta = this.getMetadata(),
            project = this.getAsset('value_Project'),
            date = this.getAsset('value_Date'),
            author = this.getAsset('value_Author'),
            sidebar = this.getSidebar();

        this.setStringValue(project, meta.name);
        this.setStringValue(date, meta.date);
        this.setStringValue(author, meta.author);
        this.setSidebarPageName(sidebar);
    },

    generateAssets: function(){
        this.debugLog("generating assets")
        var selection = this.ctx.selection,
            doc = this.ctx.document,
            firstCanvas = doc.currentPage(),
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
                contentW : (this.config.sidebarWidth - (this.config.commentVMargin*2))
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
        var bg = this.addRect(sidebar,'sidebar-bg', sc.bg, sc.width, sc.height, sc.x, sc.y);
        this.storeStyle(bg,"notebook:sidebar:bg");

        // Header
        this.debugLog("generating assets: sidebar header")
        var header = sidebar.addLayerOfType("group");
            header.setName("header");
            header.frame().setWidth(sc.contentW);
            header.frame().setHeight(53);
            header.frame().setX(sc.x+sc.margin);
            header.frame().setY(sc.y+sc.margin);
        //              addTxt(parent,name,color,fontSize,w,h,x,y)
        var logo = this.addTxt(header,'header-h1','#777777',20,'Notes',sc.width,24,0,0),
            topLineY = logo.frame().y() + logo.frame().height() + 20,
            topLine = this.addRect(header,'bottomLine', sc.separatorColor, sc.contentW, 1, 0, topLineY);

        this.storeStyle(logo,"notebook:sidebar:header");
        this.storeStyle(topLine,"notebook:sidebar:separator");

        var sepStyle = topLine.style().sharedObjectID();

        this.storeSymbol(header,"notebook:header");

        // Metadata group
        this.debugLog("generating assets: sidebar metadata")
        var m = sidebar.addLayerOfType("group"),
            mY = topLine.frame().y() + topLine.frame().height() + sc.margin*2;
            m.setName("Metadata");
            m.frame().setWidth(sc.contentW);
            //m.frame().setHeight(114);
            m.frame().setX(sc.margin);
            m.frame().setY(mY);

        m.enableAutomaticScaling();
        
        var mInfo = ['PROJECT','DATE','AUTHOR','DEVICE'];

        var meta = this.getMetadata();



        var mInfo2 = [
                        {
                            "label": "Project",
                            "value": meta.name,
                        },
                        {
                            "label": "Date",
                            "value": meta.date,
                        },
                        {
                            "label": "Author",
                            "value": meta.author,
                        }
                     ];

        // Metadata labels & values
        var newY = 0;
        for (var i = 0; i < mInfo2.length; i++) {            
            var label = this.addTxt(m,'label','#61625E',12,mInfo2[i].label.toUpperCase()+":",65,11,0,newY+2,fixed=true),
                value = this.addTxt(m,'value_'+mInfo2[i].label,'#C4C5C3',14,mInfo2[i].value,360,21,80,newY,fixed=true),
                lid,vid;
            newY = newY+sc.margin;
            this.txtRefreshSize(label);
            this.txtRefreshSize(value);
            if(i==0){
                this.storeStyle(label,"notebook:metadata:label");
                lid = label.style().sharedObjectID();
                this.storeStyle(value,"notebook:metadata:value");
                vid = value.style().sharedObjectID();
            }else{
                label.style().setSharedObjectID(lid);
                value.style().setSharedObjectID(vid);
            }
        };

        var midLineY = newY + value.frame().height();
            midLine = this.addRect(m,'bottomLine', sc.separatorColor, sc.contentW, 1, 0, midLineY);
            midLine.style().setSharedObjectID(sepStyle);

        this.storeSymbol(m,"notebook:metadata");
        // Screen name
        this.debugLog("generating assets: sidebar screen name")
        var sLx = midLine.absoluteRect().x(),
            sLy = midLine.absoluteRect().y() + midLine.absoluteRect().height() + sc.margin,
            screenLabel = this.addTxt(sidebar,'label_screen','#61625E',11,"SCREEN",100,11,0,0);
            this.storeStyle(screenLabel,"notebook:sidebar:screen-name-label");
        
        screenLabel.absoluteRect().setX(sLx);
        screenLabel.absoluteRect().setY(sLy);
        this.txtRefreshSize(screenLabel);
        

        var sNy = screenLabel.absoluteRect().y() + screenLabel.absoluteRect().height() + 10,
            screenName = this.addTxt(sidebar,'Page Title','#ffffff',18,"ARTBOARD NAME",400,21,sc.margin,sNy);
            this.storeStyle(screenName,"notebook:sidebar:screen-name");

        var bottomLineY = screenName.absoluteRect().y() + screenName.absoluteRect().height() + sc.margin,
            bottomLine = this.addRect(sidebar,'bottomLine', sc.separatorColor, sc.contentW, 1, sc.margin, bottomLineY);
            bottomLine.style().setSharedObjectID(sepStyle);
        
    
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
        var titleY = 7,
            title = this.addTxt(comment,'comment title','#ffffff',14,"TITLE",400,16,40,titleY,fixed=true);
            this.storeStyle(title,"notebook:comment:title");

        //body
        this.debugLog("generating assets: comment body")
        var bodyY = title.absoluteRect().y() + title.absoluteRect().height() + 10,
            body = this.addTxt(comment,'comment body','#9C9D9B',14,"Comment",400,16,40,bodyY,fixed=true);
        this.storeStyle(body,"notebook:comment:body");
            //body.frame().setWidth(400);
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
        var iBg = this.addOval(index, 'bg', '#55910B', 30, 30, 0, 0);
        this.storeStyle(iBg,"notebook:comment:index:bg");

        // index label
        this.debugLog("generating assets: comment index label")
                        //function(parent,name,color,fontSize,string,w,h,x,y,fixed){
        var iLabel = this.addTxt(index,'#','#ffffff',14,"#",30,30,0,0,fixed=true);
            iLabel.setTextAlignment(2);
            iLabel.setLineSpacing(23);
            this.storeStyle(iLabel,"notebook:comment:index");
            //iLabel.setFontPostscriptName('Helvetica Neue');

        // center canvas on sidebar
        // var view = [doc currentView];
        // [view zoomToFitRect:[sidebar rect]]
        // [view actualSize]
        // return assets page

        doc.setCurrentPage(0);
        doc.setCurrentPage(doc.pages().count() - 1);
        doc.setCurrentPage(firstCanvas)
        doc.currentPage().setCurrentArtboard(firstAB)

        return assets;
        this.debugLog("assets generated")
    },

    storeSymbol: function(obj,name){
        this.debugLog("storing symbol")
        var selection = this.ctx.selection,
            doc = this.ctx.document,
            symbols = doc.documentData().layerSymbols();
        symbols.addSymbolWithName_firstInstance(name, obj);

        //log(symbols.addSharedObjectWithName)
        // var sharedStyles=doc.documentData().layerStyles();
        // symbols.addSharedStyleWithName_firstInstance("nbassets:sidebar:bg",bg.style());
        //dataContainer.sharedStyleWithID(this.orig.style().sharedObjectID())
    },

    storeStyle: function(obj,name){
        this.debugLog("storing styles")
        var selection = this.ctx.selection,
            doc = this.ctx.document,
            style = obj.style();

        if ([obj class] == MSTextLayer) {
            var sharedStyles=doc.documentData().layerTextStyles();
        }else{
            var sharedStyles=doc.documentData().layerStyles();
        }
        sharedStyles.addSharedStyleWithName_firstInstance(name,style);

    },

    getAsset: function(asset){
        this.debugLog("getting asset")
        var selection = this.ctx.selection,
            doc = this.ctx.document,
            assetsPage = this.predicate({key : "(name != NULL) && (name == %@)", match : "--nb--assets"}, doc);
        if(!assetsPage) assetsPage = this.generateAssets();

        var asset = this.predicate({key : "(name != NULL) && (name == %@)", match : asset}, assetsPage);
        return asset;
    },

    setManualRelocation: function(){
        var doc = this.ctx.document,
            assetsPage = this.predicate({key : "(name != NULL) && (name == %@)", match : "--nb--assets"}, doc),
            flag = this.getAsset("ManualRelocation"),
            container = this.getBallsContainer();
        if(flag==0){
            var f = assetsPage.addLayerOfType("group");
                f.setName("ManualRelocation");
        }

        container.setIsLocked(false);

    },

    setAutomaticRelocation: function(){
        var doc = this.ctx.document,
            flag = this.getAsset("ManualRelocation"),
            container = this.getBallsContainer();
        if(flag!=0){
            flag.parentGroup().removeLayer(flag);
            container.setIsLocked(true);
        }

    },

    moveArtboards: function(page,offset){
        this.debugLog("moving artboards")
        var doc = this.ctx.document,
            page = page || doc.currentPage(),
            offset = offset || this.config.sidebarWidth,
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
        var selection = this.ctx.selection,
            doc = this.ctx.document,
            page = [doc currentPage],
            artboard = [page currentArtboard];
        if(!artboard){
            this.showMessage("No comments to align");
            return false;
        }

        var sidebarExists = this.predicate({key : "(name != NULL) && (name == %@)", match : '--nb--sidebar'}, artboard);

        if (!sidebarExists){
            this.showMessage("Dude, this page has no comments! Use 'ctrl + alt + ⌘ + 9' to add a new one");
            return false;
        }

        return true;

    },

    togglePageSidebars: function(hideAll,showAll){
        this.debugLog("toggling all sidebars");
        var doc = this.ctx.document,
            page = doc.currentPage(),
            abs = page.artboards().objectEnumerator(),
            hideAll = hideAll || false,
            showAll = showAll || false;
        while (a = abs.nextObject()) {
            doc.currentPage().setCurrentArtboard(a)
            this.toggleSidebar(hideAll,showAll);
        }

    },

    resetComments: function(){
        this.debugLog("reseting comments from current artboard");
        var sbExists = this.checkArtboardAndSidebar();
        if(!sbExists) return;

        var doc = this.ctx.document,
            page = [doc currentPage],
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
            this.showMessage('No comments to delete');
        }else{
            var sidebar = this.getSidebar(),
                ballsContainer = this.getBallsContainer(),
                visibility = sidebar.isVisible(),
                sidebarWidth = this.config.sidebarWidth;
            if(visibility==1){
                this.moveArtboards(page,-sidebarWidth);
                [sidebar setIsVisible:false]
                [ballsContainer setIsVisible:false]
                width = artboard.frame().width() - sidebarWidth;
                artboard.frame().setWidth(width);
            }
            sidebar.parentGroup().removeLayer(sidebar);
            ballsContainer.parentGroup().removeLayer(ballsContainer);
        }

    },

    toggleSidebar: function(hideAll,showAll){
        this.debugLog("toggling sidebar");
        var sbExists = this.checkArtboardAndSidebar();
        if(!sbExists) return;

        var selection = this.ctx.selection,
            doc = this.ctx.document,
            page = [doc currentPage],
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
                sidebarWidth = this.config.sidebarWidth;
            if(visibility==0){
                if(hideAll) return;
                this.moveArtboards(page,sidebarWidth);
                width = artboard.frame().width() + sidebarWidth;
                artboard.frame().setWidth(width);
                [sidebar setIsVisible:true];
                [ballsContainer setIsVisible:true]
            }else{
                if(showAll) return;
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
