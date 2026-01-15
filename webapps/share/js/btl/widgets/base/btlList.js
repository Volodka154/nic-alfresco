define(["dojo/_base/declare",
        "alfresco/lists/AlfList",
        "dojo/_base/lang",
        "jquery"],
        function(declare, AlfList, lang,$) {
   return declare([AlfList], {
        cssRequirements: [{cssFile:"./css/btlList.css"}],
        onPageWidgetsReady:function alfresco_lists_AlfList__onPageWidgetsReady(/* jshint unused:false*/ payload) {
            this.inherited(arguments);
             $('span.value').on('click', function(){
               $('.activeMainMenu').removeClass('activeMainMenu');
               $(this.parentNode.parentNode.parentNode).addClass('activeMainMenu');
             });
        },
   });
});