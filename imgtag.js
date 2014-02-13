var ITT = {
    init : function(options){
        var defaults = {
            tagImgSrc : 'Dot.png'
        };
        
        this.options = $.extend({}, defaults, options);
        this.tagObject = [];
        
        this.imageContainerEl = $("div#itt_imageContainer");
        this.$imageContainerEl = $("div#itt_imageContainer");
        
        this.imgEl = $("img#itt_img");
        this.$imgEl = $("img#itt_img");
        
        this._build();
        this._attachListeners();
        
        return this;
    },
    
    _getTemplates : function(templateID) {
          switch(templateID){
            case "tagEntryDialog" :
               return '<div id = "tagEntryDialog"><span id = "btn_close">x</span><input type = "text" id = "input_tagEntry" /><input type = "button" value = "Tag It!" id = "btn_tagit" /></div>';
                  
            case "tagContainer" :
                return '<div id = "tagContainer"></div>';
                  
            case "retrieveTagContainer" :
                return '<div id = "retrieveTagContainer"></div>';
          }
    },
    
    _attachListeners : function() {
        var applicationContext = this;
        
        $("#itt_img").on("click", function (e) {
            applicationContext._displayTagDialog(this, e);
        });
        
        $("#btn_close").on("click", function() {
            applicationContext._closeTagDialog(this);
        }); 
        
        $("#btn_tagit").on("click", function() {
            applicationContext._addTag(this);
        });
        
        $("#itt_imageContainer").off("click").on("click", "div div img", function(e) {
            applicationContext._retrieveTag(this, e);
        });
    },
    
    _addTag : function(context){
        var that = this;
    
        var position = $('#tagEntryDialog').position();
            
        var pos_x = left_distance;
        var pos_y = top_distance;
    
        var pos_width = $('#tagEntryDialog').width();
        var pos_height = $('#tagEntryDialog').height();
        
        var tagText = $("#input_tagEntry").val();
        
        $('#tagContainer').append("<div style = 'position : absolute; left : " + pos_x + "px; top : " + pos_y + "px;'> <img src = '"+ this.options.tagImgSrc +"' class = 'tagImage' id = 'tag" + pos_x + "_" + pos_y +"'/><div id = 'tagTextContainer' class = 'tagText hidden' data-position = "+ pos_x +"_"+ pos_y  +"><input type = 'text' value = '" + tagText  + "' disabled/></div></div>");  
        
        var tempObj = {};
        tempObj.id = "tag" + pos_x + "_" + pos_y;
        tempObj.pos_x = pos_x;
        tempObj.pos_y = pos_y;
        tempObj.tagText = tagText;
        
        this.tagObject.push(tempObj);
        
        $("#tagEntryDialog").hide();
        $("#input_tagEntry").val("");
    },
    
    _build : function() {
        this.$imageContainerEl.append(this._getTemplates('tagEntryDialog'));
        
        this.$imageContainerEl.append(this._getTemplates('tagContainer'));
        
        this.$imageContainerEl.append(this._getTemplates('retrieveTagContainer'));
    },
    _closeTagDialog : function(context){
        $(context).parent().hide();
    },
    
    _deleteTag : function(context, e) {
        $(context).parent().parent().parent().remove();
        
        var selectedTag_ID = context.id;
        
        var appTagObject = this.tagObject;
        
        var selectedTag_Index = "";
        
        $(this.tagObject).each(function(index){
            if(appTagObject[index] != undefined && selectedTag_ID == appTagObject[index].pos_x + "_" + appTagObject[index].pos_y){
                selectedTag_Index = index;
                return false;
            }
        });
        
        delete this.tagObject[selectedTag_Index];
    },
    
    _displayTagDialog : function(context, e) {
            var image_left = $(context).offset().left;
            var click_left = e.pageX;
            left_distance = click_left - image_left;
            
            var image_top = $(context).offset().top;
            var click_top = e.pageY;
            top_distance = click_top - image_top;
            
            var mapper_width = $('#tagEntryDialog').width();
            var imagemap_width = $('#itt_img').width();
            
            var mapper_height = $('#tagEntryDialog').height();
            var imagemap_height = $('#itt_img').height();
            
            if((top_distance + mapper_height > imagemap_height) && (left_distance + mapper_width > imagemap_width)){
                $('#tagEntryDialog').css("left", (click_left - mapper_width - image_left))
                .css("top",(click_top - mapper_height - image_top  ))
                .show();
            }
            
            else if(left_distance + mapper_width > imagemap_width){
                $('#tagEntryDialog').css("left", (click_left - mapper_width - image_left))
                .css("top",top_distance)
                .show();
            }
            
            else if(top_distance + mapper_height > imagemap_height){
                $('#tagEntryDialog').css("left", left_distance)
                .css("top",(click_top - mapper_height - image_top))
                .show();
            }
            else{
                $('#tagEntryDialog').css("left", left_distance)
                .css("top",top_distance)
                .show();
            } 
    },
    
    _editTag : function(context, e, selectedTag_Details) {
        var that = this;
        
        if(e.target.className == "tagText visible"){
        var tagTextContainer = context;
        tagTextContainer.innerHTML = "<input id = 'editText' type = 'text' value = '" + e.target.innerText + "' /><input id = 'edit" + selectedTag_Details[0].pos_x + "_" + selectedTag_Details[0].pos_y +"' type = 'button' value = 'Save' class = 'btn_save'/>";
        
        $(".btn_save").off("click").on("click", function(e_save) {
            var selectedTag_ID = e_save.target.id.split("edit")[1];
        
            var selectedTag_Index = "";
            
            $(that.tagObject).each(function(index){
            if(that.tagObject[index] != undefined && selectedTag_ID.split("_")[0] == that.tagObject[index].pos_x && selectedTag_ID.split("_")[1] == that.tagObject[index].pos_y){
                
                selectedTag_Index = index;
                return false;
            }
        });
            
            that.tagObject[selectedTag_Index].tagText = $("#editText").val();
            
        $("#"+e.target.id+"[data-position='"+ that.tagObject[selectedTag_Index].pos_x +"_"+ that.tagObject[selectedTag_Index].pos_y  +"']").html(selectedTag_Details[0].tagText + "<div><img src = 'delete.png' class = 'deleteImg' id = '" + selectedTag_Details[0].pos_x + "_" + selectedTag_Details[0].pos_y + "'/></div>");
            
            e_save.stopPropagation();
        });
        }
    },
    
    _retrieveTag : function(context, e){
        var that = this;
        var selectedTag_ID = e.target.id;
        var selectedTag_visibility = $("#"+selectedTag_ID).next().hasClass("hidden");
        
        var selectedTag_Details = $(this.tagObject).filter(function(){
            return this.id == selectedTag_ID;
        });
        
        if(selectedTag_visibility == false) {
            $("#"+selectedTag_ID).next().removeClass("visible").addClass("hidden");
        }
        else {
            $("#"+selectedTag_ID).next().html(selectedTag_Details[0].tagText + "<div><img src = 'delete.png' class = 'deleteImg' id = '" + selectedTag_Details[0].pos_x + "_" + selectedTag_Details[0].pos_y + "'/></div>").removeClass("hidden").addClass("visible");    
        }
        
        $(".tagText.visible").off("click").on("click", function(e) {
                that._editTag(this, e, selectedTag_Details);
        });
        
        $(".deleteImg").off("click").on("click", function(e) {
                that._deleteTag(this, e);
        });
        
    }
};

(function($){
    $.fn.itt = function(options){
        var ittObj = Object.create(ITT);
        ittObj.init(options, this);
    }
    
    $("#itt_imageContainer").itt();
})(jQuery);