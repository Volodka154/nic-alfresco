<#include "include/alfresco-template.ftl" />
<#import "import/alfresco-layout.ftl" as layout />
<@templateHeader "transitional" />

<@templateBody>
   <@markup id="alf-hd">
   <div id="alf-hd">
      <@region scope="global" id="share-header" chromeless="true"/>
   </div>
   </@>
   <@markup id="alf-full-width">
   <div id="alf-full-width">
      <@region id="full-width-dashlet" scope="page" />
   </div>
   </@>
   <@markup id="bd">
      <div id="bd">
         <@layout.grid gridColumns gridClass "component" />
      </div>
   </@>
</@>


<@region id="html-upload" scope="template"/>
<@region id="flash-upload" scope="template"/>
<@region id="file-upload" scope="template"/>
<@region id="dnd-upload" scope="template"/>