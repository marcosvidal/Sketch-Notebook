//#import 'Notebook/library/sandbox-sketch-utils.js'

var com = {};

com.notebook = {

    messages: {
        'alertTitle' : 'Sketch NoteBook',
        'noLayerSelected' : 'Select any layer or group to add a comment',
        'noSidebar' : 'No comments to show',
        'noArtboard' : 'Please select an artboard'
    },

    config : {
        commentVMargin : 30,
        indicatorOffset : 30
    },

    alert: function (msg, title) {
        title = title || this.messages['alertTitle'];
        var app = [NSApplication sharedApplication];
        [app displayDialog:msg withTitle:title];
    },

    createAlertBase: function () {
      var alert = COSAlertWindow.new();
      //var icon = NSImage.alloc().initByReferencingFile(pluginPath + '/lib/' + service + '.icns');
      //alert.setIcon(icon);
      alert.addButtonWithTitle('OK');
      alert.addButtonWithTitle('Cancel');

      return alert;
    },

    refreshPage: function() {
        var c = doc.currentPage();
        doc.setCurrentPage(0);
        doc.setCurrentPage(doc.pages().count() - 1);
        doc.setCurrentPage(c);
    },

    showMessage: function(msg){
        [doc showMessage: msg]; 
    },

    abExists : function(artboard){
        var layers = artboard.children().objectEnumerator();
        while (layer = layers.nextObject()) {
            if(layer.name()=='Background'){
                log('background already exists');
                return layer;
            }
        }
        return false;
    },

    checkSelection : function(sel){
        if (sel > 0){
            return true;
        }else{
            this.alert(this.messages['noLayerSelected']);
            return false;
        }
    },

    addSidebar : function(){
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

    getLayerFromSidebar: function(sidebar,layerName){
        var artboard = [[doc currentPage] currentArtboard],
            layers = [sidebar layers];
        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i];
            if(layer.name()==layerName){
                return layer;
            }
        };
        return false;
    },

    setSidebarPageName: function(sidebar){
        var layer = this.getLayerFromSidebar(sidebar,'Page Title'),
            pageName = sidebar.parentGroup().name();
            this.setStringValue(layer,pageName);
    },

    setSidebarHeight: function(sidebar){
        var artboard = sidebar.parentGroup(),
            height = artboard.frame().height(),
            layers = [sidebar layers];
        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i];
            if(layer.name()=='bg'){
                layer.frame().setHeight(height);
                return;
            }
        };

    },

    getSidebar : function(){
        var layers = [[[doc currentPage] currentArtboard] layers],
        sidebar = false;
        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i];
            if(layer.name()=='--nb--sidebar'){
                sidebar = layer;
            }
        };
        if(!sidebar) sidebar = this.addSidebar();

        return sidebar;
    },

    getSidebarWidth: function(sidebar){
        var layers = [sidebar layers];
        for (var i = 0; i < layers.count(); i++) {

            var layer = [layers objectAtIndex:i];
            if(layer.name()=='bg'){
                var sidebarWidth = layer.frame().width();
                return sidebarWidth;
            }
        };
        return nil;
    },

    addInput: function(panel,txt){
        
    },

    methodsFor: function(obj){
        log([obj class].mocha().instanceMethods())
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

    addComment: function () {
        var elementSelected = this.checkSelection([selection count]);

        if(elementSelected){

            var el = selection[0],
                sidebar = this.getSidebar(),
                panel = this.createAlertBase(),
                comment,
                container,
                ix = el.absoluteRect().x(),
                iy = el.absoluteRect().y();

            //log("initial height: "+this.getCommentsHeight(sidebar))

            panel.setMessageText("Sketch Notebook");
            panel.setInformativeText("Set comment title and content for \""+el.name()+"\"");
            panel.addTextLabelWithValue("Title");
            panel.addTextFieldWithValue(el.name());
            panel.addTextLabelWithValue("Comment");
            //panel.addTextFieldWithValue("Just another comment");

            var textComment = [[NSTextField alloc] initWithFrame:NSMakeRect(10, 10, 300, 200)];
            textComment.setStringValue("Just another comment");
            panel.addAccessoryView(textComment);
            //log(this.methodsFor(panel));

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

            if(!sidebar.isVisible()) this.toggleSidebar();

            var commentGroup = this.getCommentsGroup(sidebar),
                c = this.getAsset('comment').duplicate();

            this.removeDuplicate(c);

            //var newY = this.getCommentsHeight(sidebar);
            this.realignComments();
            var newY = this.getLastCommentPosition();

            commentGroup.addLayer(c);
            c.frame().setX(0);
            c.frame().setY(newY);

            var commentId = this.getNewCommentId();
            c.setName("####"+commentId+"####"+comment['title']+"####"+el.name());

            this.setCommentData(c,comment,sidebar);
            this.placeCommentIndicator(commentId,c,sidebar,ix,iy,el);
            //log("final height: "+this.getCommentsHeight(sidebar))
            this.realignComments();
        }
        
        // Check if selection already has a comment on config file
        // Check if there is a sidebar
        
    },
    flags: {
        deletedComments: false
    },

    getNewCommentId: function(){
        var sidebar = sidebar || this.getSidebar(),
            comments = this.getCommentsGroup(sidebar).layers(),
            commentId = 0;
        if(comments.count()>0){
            for (var i = 0; i < comments.count(); i++) {
                var comment = [comments objectAtIndex:i],
                    tmpId = (comment.name()).split("####")[1];
                    if(tmpId>commentId) commentId = tmpId;
            };
        }
        commentId = commentId+1;
        if(this.flags.deletedComments) commentId = commentId - this.flags.deletedComments;
        return commentId;
    },

    getBallsContainer : function(){
        var artboard = [[doc currentPage] currentArtboard],
            layers = [artboard layers],
            container = false;

        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i];
            if(layer.name()=='--nb--balls'){
                var container = layer;
                container.setIsLocked(true);
                return container;
            }
        };

        if(!container){
            var cWidth = artboard.frame().width() - 500,
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

    placeCommentIndicator: function(commentId,c,sidebar,x,y,el){
        var layers = c.layers(),
            ballsContainer = this.getBallsContainer(),
            commentId = commentId || 1; 
        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i];

            if(layer.name()=="index"){
                var indicator = layer.duplicate();
                indicator.parentGroup().removeLayer(indicator);
                ballsContainer.addLayer(indicator);
                indicator.absoluteRect().setX(x+30);
                indicator.absoluteRect().setY(y+30);
                indicator.setName(commentId+"####"+indicator.name())
            }
        };
    },

    createCommentsGroup : function(sidebar){
        var gY = this.getBottomLinePos(sidebar),
            group = sidebar.addLayerOfType("group");
            group.setName("--comments");
            group.frame().setWidth(446);
            group.frame().setX(32);
            group.frame().setY(gY);
        return group;
    },

    getBottomLinePos: function(sidebar){

        var layers = [sidebar layers],
            pos = this.config.commentVMargin;

        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i];
            if(layer.name()=='bottomLine'){
                var pos = layer.frame().y()+layer.frame().height()+this.config.commentVMargin;
                return pos;
            }
        };
        return pos;
    },

    getCommentsGroup: function(sidebar){
        var layers = [sidebar layers],
            commentsGroup  = false,
            sidebar = sidebar || this.getSidebar();
        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i];
            if(layer.name()=='--comments'){
                commentsGroup = layer;
            }
        };
        if(!commentsGroup) commentsGroup = this.createCommentsGroup(sidebar);

        return commentsGroup;
    },

    alignCommentText: function(comment){
        var title = this.getChildByName(comment,"title"),
            body = this.getChildByName(comment,"body");
            titleH = title.frame().height(),
            titleY = title.frame().y(),
            txtY = titleY + titleH + 5;
        
        body.frame().setY(txtY);
        var layer = body.parentGroup();
        //[body select:true byExpandingSelection:false];
        //[body select:false byExpandingSelection:false];
    },

    realignComments: function(sidebar){
        var sidebar = sidebar || this.getSidebar(),
            comments = this.getCommentsGroup(sidebar).layers(),
            sortedComments = [],
            nextY = 0,
            gY = this.getBottomLinePos(sidebar);

        this.checkDeletedComments(comments);

        var cG = this.getCommentsGroup(sidebar);

        //log(cG.frame().y).setY(gy)
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
    },

    getChildByName: function(o,name){
        var layers = o.children().objectEnumerator(),
            name = name || "shittyshitlayer";
        while (layer = layers.nextObject()) {
            if(layer.name()==name){
                return layer;
            }
        }
        return;
    },

    iRelocation: function(){
        var sidebar = this.getSidebar(),
            comments = this.getCommentsGroup(sidebar).layers(),
            ab = doc.currentPage().currentArtboard(),
            ballsContainer = this.getBallsContainer();

        for (var i = 0; i < comments.count(); i++) {
            var comment = [comments objectAtIndex:i],
                commentId = comment.name().split("####")[1]),
                clname = comment.name().split("####")[3],
                cl = this.getChildByName(ab,clname),
                offset = this.config.indicatorOffset,
                clx = cl.absoluteRect().x() + offset,
                cly = cl.absoluteRect().y() + offset,
                ballsContainer = this.getBallsContainer(),
                indicator = this.getChildByName(ballsContainer,commentId+"####index");

            log("current position: ["+indicator.absoluteRect().x()+","+indicator.absoluteRect().y()+"]")
            log(" future position: ["+clx+","+cly+"]")

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
                //log(commentsIds.indexOf(index))
            if(commentsIds.indexOf(index)==-1) {
                indicator.parentGroup().removeLayer(indicator);
                if(this.flags.deletedComments==false) this.flags.deletedComments = 0;
                this.flags.deletedComments = this.flags.deletedComments+1;
            }
        };

    },

    commentRepositioning: function(comments){
        var nextY = 0,
            margin = this.config.commentVMargin;

        for (var i = 0; i < comments.length; i++) {
            var comment = comments[i]['el'];
            comment.frame().setY(nextY);
            comment.frame().setX(0);
            nextY = nextY + comment.frame().height() + margin;
            [layer select:true byExpandingSelection:false];
            [layer select:false byExpandingSelection:false];
        };
        
    },

    commentRenumbering: function(comments){
        var sidebar = this.getSidebar(),
            comments = comments || this.getCommentsGroup(sidebar).layers(),
            ballsContainer = this.getBallsContainer();

        for (var i = 0; i < comments.length; i++) {
            var comment = comments[i],
                index = this.getChildByName(comment.el,"#"),
                ival = i+1,
                commentId = comment.el.name().split("####")[1]),
                indicator = this.getChildByName(ballsContainer,commentId+"####index"),
                label = this.getChildByName(indicator,"#");
                if(indicator){
                    var ci = comment.el.name().split("####")[1];
                        //commentedLayer = comment.el.name().split("####")[3];
                    //log("  comment index:"+ci)
                    //log("           ival:"+ival)
                    //log("indicator index:"+(indicator.name()).split('####')[0])
                    //log("     final name: "+ival+"####index")
                  indicator.setName(commentId+"####index")
                  //this.iRelocation(indicator, commentedLayer)
                }
                this.setStringValue(label,ival.toString());
                this.setStringValue(index,ival.toString());
        };
    },


    setCommentData : function(comment,data,sidebar){
        var layers = comment.layers(),
            commentsGroup = this.getCommentsGroup(sidebar),
            index = this.countComments(sidebar);

        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i],
                layerName = layer.name();

            if(layerName == 'title'){
                var title = (data['title']).toUpperCase();
                this.setStringValue(layer,title);
            }
            else if(layerName=='index'){
                var iLayers = layer.children();
                for (var j = 0; j < iLayers.count(); j++) {
                    var iLayer = [iLayers objectAtIndex:j];
                    if(iLayer.name()=="#") this.setStringValue(iLayer,index.toString());
                }
            }
            else if(layerName=='body'){
                this.setStringValue(layer,data['text']);
            }
            this.alignCommentText(comment);
            //log([[layer parentGroup] adjustFrameToFit])
        };
    },

    setStringValue: function(layer,string){
        layer.setStringValue(string);
        this.txtRefreshSize(layer)
    },

    countComments: function(sidebar){
        return this.getCommentsGroup(sidebar).layers().count();
    },

    txtRefreshSize: function(layer){
        [layer adjustFrameToFit]
        [layer select:true byExpandingSelection:false];
        [layer select:false byExpandingSelection:false];
    },

    getCommentsHeight : function(sidebar){
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

    removeDuplicate: function(asset){
        var pages = doc.pages().objectEnumerator();
        while (page = pages.nextObject()) {
            if (page.name() == "--nb--assets") {
                page.removeLayer(asset);
                break;
            }
        }
    },

    refreshPage: function() {
        var c = doc.currentPage();
        doc.setCurrentPage(0);
        doc.setCurrentPage(doc.pages().count() - 1);
        doc.setCurrentPage(c);
    },

    addPage: function(name) {
        var page = doc.addBlankPage(),
            name = name || "New page";
        page.setName(name);
        //doc.setCurrentPage(page);
        //this.refreshPage();
        return page;
    },

    addGroup: function(parent,name){
        var parent = parent || doc.currentPage(),
            group = parent.addLayerOfType("group"),
            name = name || "new group";
        
        group.setName(name);

        return group;
    },

    addRect: function(parent,name,bg,w,h,x,y){

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
            rect.style().fills().addNewStylePart();
            rect.style().fill().setFillType(0);
            rect.style().fill().setColor(bgColor);
            rect.frame().setWidth(w);
            rect.frame().setHeight(h);
            rect.frame().setX(x);
            rect.frame().setY(y);

        return rect;

    },

    addTxt: function(parent,name,color,fontSize,string,w,h,x,y){
        var parent = parent || doc.currentPage(),
            name = name || "new text layer",
            color = color || "#000000",
            color = [MSColor colorWithHex: color alpha: 1],
            fontSize = fontSize || 14,
            string = string || "Type something",
            w = w || 400,
            h = h || 24,
            x = x || 0,
            y = y || 0;

        var textLayer = parent.addLayerOfType("text");

            textLayer.textColor = color;
            textLayer.fontSize = fontSize;

            textLayer.setName(name);
            textLayer.setStringValue(string);
            
            var textLayerFrame = [textLayer frame];
            [textLayerFrame setWidth: w];
            [textLayerFrame setHeight: h];
            
            [textLayerFrame setX: x];
            [textLayerFrame setY: y];

            textLayer.setFontPostscriptName('Raleway')

        return textLayer;
    },

    generateAssets: function(){
        log("generating assets")
        var firstCanvas = doc.currentPage(),
            firstAB = doc.currentPage().currentArtboard(),
            sel = selection[0],
            layer = false,
            assets = this.addPage("--nb--assets"),
            sc = {
                width : 500,
                height : 480,
                x : 0,
                y : 0,
                margin : this.config.commentVMargin,
                bg : '#393B36',
                separatorColor : '#4D4E4A',
                contentW : (500 - (this.config.commentVMargin*2))
            };

    // Create sidebar
        // group
        var sidebar = assets.addLayerOfType("group");
            sidebar.setName("sidebar");
            sidebar.frame().setWidth(sc.width);
            sidebar.frame().setHeight(sc.height);
            sidebar.frame().setX(sc.x);
            sidebar.frame().setY(sc.y);
        // background
        //            addRect(parent,name,bg,w,h,x,y)
        var bg = this.addRect(sidebar,'bg', sc.bg, sc.width, sc.height, sc.x, sc.y);

        // Header
        var header = sidebar.addLayerOfType("group");
            header.setName("header");
            header.frame().setWidth(sc.contentW);
            header.frame().setHeight(53);
            header.frame().setX(sc.x);
            header.frame().setY(sc.y);
        //              addTxt(parent,name,color,fontSize,w,h,x,y)
        var logo = this.addTxt(header,'Sketch Notebook','#4C504A',20,'Sketch Notebook',sc.width,24,sc.margin,sc.margin),
            topLineY = logo.frame().y() + logo.frame().height() + 20,
            topLine = this.addRect(header,'topLine', sc.separatorColor, sc.contentW, 1, sc.margin, topLineY);

        // Metadata group
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
            var label = this.addTxt(m,'label_'+mInfo[i],'#61625E',11,mInfo[i]+":",100,11,0,newY+3),
                value = this.addTxt(m,'value_'+mInfo[i],'#C4C5C3',14,mInfo[i],300,21,80,newY);
            newY = newY+sc.margin;
            this.txtRefreshSize(label);
            this.txtRefreshSize(value);
        };

        var midLineY = newY + value.frame().height();
            midLine = this.addRect(m,'midLine', sc.separatorColor, sc.contentW, 1, 0, midLineY);

        // Screen name
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
        var comment = assets.addLayerOfType("group"),
            cX = sc.margin,
            cY = bottomLine.absoluteRect().y() + bottomLine.absoluteRect().height() + sc.margin;

        comment.setName("comment");
        comment.frame().setWidth(sc.contentW);
        comment.frame().setHeight(48);
        comment.frame().setX(cX);
        comment.frame().setY(cY);

        //title
        var titleY = 5,
            title = this.addTxt(comment,'title','#ffffff',14,"TITLE",400,16,40,titleY);

        //body
        var bodyY = title.absoluteRect().y() + title.absoluteRect().height() + 10,
            body = this.addTxt(comment,'body','#9C9D9B',14,"Comment",400,16,40,bodyY);
        
        body.absoluteRect().setY(bodyY);

        // index group
        var index = comment.addLayerOfType("group");
            index.setName("index");
            index.frame().setWidth(40);
            index.frame().setHeight(40);
            index.frame().setX(0);
            index.frame().setY(0);

        // index bg
        var iBg = this.addRect(index, 'bg', '#55910B', 30, 30, 0, 0);
        var firstObject = [[iBg layers] firstObject];
        [firstObject setFixedRadius:15];
        [firstObject resetPointsBasedOnUserInteraction];

        // index label
        var iLabel = this.addTxt(index,'#','#ffffff',14,"#",8,16,10,6);
            iLabel.setTextAlignment(2);
            iLabel.setFontPostscriptName('Helvetica Neue')
        this.txtRefreshSize(body);


        //center canvas on sidebar
        var view = [doc currentView];
        [view zoomToFitRect:[sidebar absoluteRect]]
        [view actualSize]
        // return assets page

    
    doc.setCurrentPage(0);
    doc.setCurrentPage(doc.pages().count() - 1);
    doc.setCurrentPage(firstCanvas)
    doc.currentPage().setCurrentArtboard(firstAB)
    log("assets generated")
    },

    getAssetsPage: function(){
        var pages = doc.pages().objectEnumerator(),
            aPage = false;

        while (page = pages.nextObject()) {
            if(page.name()=='--nb--assets') {
                aPage = page;                
            }
        }

        return aPage;
    },

    getAsset: function(asset){
        
        var assetsPage = this.getAssetsPage();

        if(!assetsPage) {
            this.generateAssets();
            assetsPage = this.getAssetsPage();
        }

        var layers = assetsPage.layers();
        
        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i];
            if (layer.name() == asset) {
                return layer;
            }
        };
                
        return false;
    },

    deleteComment: function(){},

    moveArtboards: function(page,offset){
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

    toggleSidebar: function(){
        var page = [doc currentPage],
            artboard = [page currentArtboard];
            if(!artboard){
                this.showMessage(this.messages['noArtboard']);
                return;
            }

        var layers = [artboard layers],
            sidebar = false,
            artboard = [[doc currentPage] currentArtboard];



        for (var i = 0; i < layers.count(); i++) {
            var layer = [layers objectAtIndex:i];
            if(layer.name()=='--nb--sidebar'){
                sidebar = layer;
            }
        };
        if(!sidebar) {
            this.showMessage(this.messages['noSidebar']);
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

    }

 } //end com.showroom