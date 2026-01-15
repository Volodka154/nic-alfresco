<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/extension/css/action-dashlet.css" />
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/extension/css/modalWindow.css" />

<#import "/ru/btlab/components/form/form.lib.ftl" as formLib />
<!-- Dependency files for Tabview -->
<link rel="stylesheet" type="text/css" href="/share/yui/tabview/assets/skins/sam/tabview.css">
<script type="text/javascript" src="/share/yui/yahoo-dom-event/yahoo-dom-event.js"></script>
<script type="text/javascript" src="/share/yui/element/element-min.js"></script>
<script type="text/javascript" src="/share/yui/connection/connection-min.js"></script>
<script type="text/javascript" src="/share/yui/tabview/tabview-min.js"></script>

<@script type="text/javascript" src="${url.context}/res/components/form/form.js" />
<@link rel="stylesheet" type="text/css" href="${url.context}/res/components/form/form.css" />
<@script type="text/javascript" src="${url.context}/res/components/form/date.js" />
<@script type="text/javascript" src="${url.context}/res/components/form/date-picker.js" />
<@script type="text/javascript" src="${url.context}/res/components/object-finder/object-finder.js" />
<@script type="text/javascript" src="${url.context}/res/modules/documentlibrary/doclib-actions.js" />


<@link rel="stylesheet" type="text/css" href="share/res/components/form/document/document.css" />

<@script type="text/javascript" src="${url.context}/res/components/upload/file-upload.js" />
<@script type="text/javascript" src="${url.context}/res/components/upload/dnd-upload.js" />
<@script type="text/javascript" src="${url.context}/res/components/upload/flash-upload.js" />
<@script type="text/javascript" src="${url.context}/res/components/upload/html-upload.js" />

<@script type="text/javascript" src="${url.context}/res/extension/components/btl/windowSettingAction/windowSettingAction.js"/>
<@link rel="stylesheet" type="text/css" href="${url.context}/res/extension/components/btl/windowSettingAction/windowSettingAction.css" />

<@script type="text/javascript" src="/share/res/isid-share-jar/js/arm/libs.js"></@script>
<@script type="text/javascript" src="/share/res/isid-share-jar/js/arm/dictionary-bundle.js"></@script>

<#--
<style>
	 tbody tr:hover {
		background: #eeeeee;
		cursor:default;
	   }
</style>
-->

<div class="dashlet actions">
	<div id="actions_dashlet_title" class="title">
		Действия
		<div class="titleBarActions" style="opacity: 1;">
			<div onclick="windowSettingAction.show();" title="Настроить этот дашлет" class="titleBarActionIcon edit" tabindex="0"></div>
		</div>
	</div>
	<div id="icons_area" class="icons-area">

		<#list visibleActions as action>
			<div class="${action.id}" id="${action.id}"></div>
		</#list>

	</div>
</div>

<div id="modalWindowShadow" class="modalWindowShadow">
	<div id="modalFon" class="modalFon">
		<div id="modalWindow" style="display: initial;" class="modalWindow">

		</div>

	</div>
</div>

<div id="modalCreateProject" class="modalWindowShadow">
	<div id="modalWindowCreateProjectDiv" class="modalFon" style="width: 50%; margin-top: 20%; border-radius: 4px;">
		<div id="modalWindowCreateProject" class="modalWindow">

			<div class="panel panel-primary">
				<div class="panel-heading">Выберите шаблон:</div>
				<div class="panel-body">
					<table style="width: 100%;">
						<tbody id="templateTable">

						</tbody>
					</table>
					<div class="rowNoMargin">
						<div class="cancelDiv" style="float:right;">
							<button type="button" tabindex="0" onclick="closemodalCreateProject()" name="-" class="buttonCancelNoMargin">Отмена</button>
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>
</div>


<script type="text/javascript">

	function closemodalCreateProject()
	{
		var modal2 = Dom.get("modalCreateProject");
		modal2.style.display = 'none';
	}

	function closemodalCreate()
	{
		var modal = document.getElementById('modalWindowShadow');
		modal.style.display = 'none';
	}

	require(["jquery"], function($){

		$("#add_project_btn").click(function(){

			Alfresco.util.Ajax.request({
				method: "GET",
				url: "/share/proxy/alfresco/projects/getProjectTemplates",
				successCallback: {
					fn: function (complete) {
						var modal = Dom.get("modalCreateProject");

						if (complete.json.items.length == 0)
						{
							createDoc('btl-project:projectDataType', '<#if projectsFolder.nodeRef??>${projectsFolder.nodeRef}<#else></#if>', false);
							return;
						}

						table = "";
						for (i=0; i<complete.json.items.length; i++)
						{
							var item = complete.json.items[i];
							fArgs = "'" + item.nodeRef + "'"
							table += '<tr onclick="createProjectTemplate(' + fArgs + ')">';
							table += "<td class='templateItem'>" + item.name + "</td>";
							table += "</tr>";
						}

						fArgs = "'btl-project:projectDataType', '<#if projectsFolder.nodeRef??>${projectsFolder.nodeRef}<#else></#if>', false";

						table += '<tr onclick="createDoc(' + fArgs + ')">';
						table += "<td class='templateItem'>Пустой</td>";
						table += "</tr>";

						document.getElementById("templateTable").innerHTML = table;



						modal.style.display = 'block';
					},
					scope: this
				}
			});

		});

		$("#add_task_btn").click(function(){
			createDoc("btl-task:taskDataType", "<#if tasksFolder.nodeRef??>${tasksFolder.nodeRef}<#else></#if>", false);
		});

		$("#add_incoming_doc_btn").click(function(){
			createDoc("btl-incomming:documentDataType", "<#if incomingDocumentsFolder.nodeRef??>${incomingDocumentsFolder.nodeRef}<#else></#if>", false);
		});

		$("#add_application_doc_btn").click(function(){
			createDoc("btl-application:applicationDataType", "<#if internalDocumentsFolder.nodeRef??>${internalDocumentsFolder.nodeRef}<#else></#if>", false);
		});

		$("#calculator_btn").click(function(){
			window.open('${urlLR}');
		});

		$("#arm_btn").click(function(){
			window.open('/share/page/arm/main');
		});

		$("#add_outgoing_doc_btn").click(function(){
			createDoc("btl-outgoing:documentDataType", "<#if outgoingDocumentsFolder.nodeRef??>${outgoingDocumentsFolder.nodeRef}<#else></#if>", false);


			/*	
				document.frameSave  = function(o) {
					document.getElementById('modalWindowShadow').style.display = "none";
					openModalEdit(o);
				}
		
				document.frameCancel  = function(o) {
					document.getElementById('modalWindowShadow').style.display = "none";
				}
				
    		openModal("/share/page/btl-create-content?destination=<#if outgoingDocumentsFolder.nodeRef??>${outgoingDocumentsFolder.nodeRef}<#else></#if>&itemId=btl-outgoing:documentDataType&frame=true");
    		*/
		});

		function openModalEdit(nodeRef)
		{
			document.frameSave = function () {
				document.getElementById('modalWindowShadow').style.display = "none";
			}
			document.frameCancel = function () {
				document.getElementById('modalWindowShadow').style.display = "none";
			}

			openModal("/share/page/btl-edit-metadata?nodeRef=' + nodeRef + '&frame=true");
		}

		$("#add_internal_doc_btn").click(function(){
			createDoc("btl-internal:documentDataType", "<#if internalDocumentsFolder.nodeRef??>${internalDocumentsFolder.nodeRef}<#else></#if>", false);
		});

		$("#search_registry_btn").click(function(){

			window.open("search-registry");
		});

		$("#calendar_btn").click(function(){
			window.open("/share/page/hdp/ws/eventCalendar");
		});

		$("#meetings_btn").click(function(){

			document.frameCancel  = function() {
				document.getElementById('modalWindowShadow').style.display = "none";
			};

			document.frameSave  = function() {
				document.getElementById('modalWindowShadow').style.display = "none";
			};

			openModal("/share/page/dp/ws/meeting-rooms", true);
		});


		$("#add_mail_btn").click(function(){


			var iframeDialog = createFormIFrame("/share/page/arm/mailMessage?iframe=true&formId=mailMessage");

			document.frameCancel  = function() {
				iframeDialog.hide()
			};

			document.frameSave  = function() {
				iframeDialog.hide()
			};

			iframeDialog.show();

		});


		$("#overdue_btn").click(function(){
			document.addEventListener("inWorkTasksLoaded", onClickOverdueBtn);
			$("#menu-inWork-tasks-and-documents_dashlet").trigger("click");
		});

		function onClickOverdueBtn(e){
			//console.info("Event is: ", e);
			$("#filter-date-off-tasks-and-documents_dashlet").trigger("click");
			document.removeEventListener("inWorkTasksLoaded", onClickOverdueBtn);
		}

	});

	createFormIFrame = function(url, show){

		var iframeDialog = new Alfresco.util.createYUIPanel("createFormIFrame", {
			width: "99vw",
			destroyOnHide: true,
			buttons: []
		});

		var message = '<iframe src="' + url + '" style="width:98.9vw; height:92vh; border:hidden;"></iframe>';

		iframeDialog.setBody(message);

		if (show) {
			iframeDialog.show();
		}
		return iframeDialog

	};


	function createProjectTemplate(templateId)
	{
		var modal2 = Dom.get("modalWindowCreateProjectDiv");

		modal2.innerHTML = "<div class='rowNoMargin'> <div style='float:left'> <img src='/share/res/extension/icons/progress.gif' /> </div> <div style='float:left; padding-left: 10px;'> Создаем проект из шаблона...</div>  </div>"

		Alfresco.util.Ajax.request({
			method: "GET",
			url: "/share/proxy/alfresco/project/copyProject?projectId=" + templateId,
			successCallback: {
				fn: function (complete) {
					if (complete.json.id)
						window.location.assign("/share/page/user/admin/btl-edit-metadata?nodeRef=" + complete.json.id + "&createTemplate=true");
				},
				scope: this
			}
		});


	}

	function openModal(url, full)
	{
		var modal = document.getElementById('modalWindowShadow');
		var modalFon = Dom.get("modalFon");
		var formEl = Dom.get("modalWindow");
		if (full)
		{
			modalFon.style.height = "97%";
			modalFon.style.width = "98%";
			if(url.endsWith("meeting-rooms")){
				var buttonCancelModal = Dom.get("buttonCancelModal");
				if(buttonCancelModal) {
					buttonCancelModal.parentElement.style.display = "none";
					formEl.style.height = "99.5%";
				}
			}else {
				formEl.style.height = "97%";
			}
		}
		else
		{
			modalFon.style.height = "90%";
			formEl.style.height = "90%";
		}

		formEl.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="' + url + '">';

		closemodalCreateProject();

		modal.style.display = 'block';
	}

	function createDoc(name, folder, modalForm)
	{

		var modal = document.getElementById('modalWindowShadow');
		var formEl = Dom.get("modalWindow");
		formEl.innerHTML = "";
		Alfresco.util.Ajax.request(
				{
					url: Alfresco.constants.URL_SERVICECONTEXT + "btlab/components/form",
					dataObj:
							{

								htmlid: "createDoc",
								destination: folder,
								itemKind: "type",
								itemId: name,
								mode: "create",
								submitType: "json",
								showCaption: "showCaption",
								showCancelButton: false,
								editInline: "true",
								openEditForm: "true",
								openModalForm: modalForm
							},
					successCallback: {
						fn: function(res) {
							var formEl = Dom.get("modalWindow");
							formEl.innerHTML = res.serverResponse.responseText;
							//YAHOO.util.Event.on('buttonCancelModal', 'click', function() { modal.style.display = 'none';    });
							//jQuery("#tab_tasks_full_modalEditDiv_body-form-grid-tree").trigger("reloadGrid");



						},
						scope: this,
					},

					failureCallback: {
						fn: function () {
						},
						scope: this
					},
					scope:this,
					execScripts:true

				});

		var modal2 = Dom.get("modalCreateProject");
		modal2.style.display = 'none';

		modal.style.display = 'block';

	}

</script>

