(function () {

	var projectsFolderNodeRef = remote.call("/getnoderef?path=btlRepo/Dictionaries/Projects");
	var incomingDocumentsFolderNodeRef = remote.call("/getnoderef?path=btlRepo/Documents/Incoming");
	var outgoingDocumentsFolderNodeRef = remote.call("/getnoderef?path=btlRepo/Documents/Outgoing");
	var internalDocumentsFolderNodeRef = remote.call("/getnoderef?path=btlRepo/Documents/Internal");
	var tasksFolderNodeRef = remote.call("/getnoderef?path=btlRepo/Documents/Tasks");
	var availableActions = remote.call("/action/get-available-actions");

	model.projectsFolder = JSON.parse(projectsFolderNodeRef);
	model.incomingDocumentsFolder = JSON.parse(incomingDocumentsFolderNodeRef);
	model.outgoingDocumentsFolder = JSON.parse(outgoingDocumentsFolderNodeRef);
	model.internalDocumentsFolder = JSON.parse(internalDocumentsFolderNodeRef);
	model.tasksFolder = JSON.parse(tasksFolderNodeRef);
	model.actions = JSON.parse(availableActions).actions;

	var urlLR = remote.call("/common/getUrlLR");
	model.urlLR = JSON.parse(urlLR).value;


	model.canCreateIncomingDocument = false;
	for (var i = 0; i< model.actions.length; i++){
		if (model.actions[i] == "CreateIncomingDocument"){
			model.canCreateIncomingDocument = true;
		}
	}

	var isProjectCreator = remote.call("/groupPermision?user="+user.name+"&group=BTLab_ProjectCreator");
	if (isProjectCreator.status == 200)
	{
		try{
			obj = JSON.parse(isProjectCreator);
			model.isProjectCreator = obj.result;
		}catch(e){
			model.isProjectCreator = "false";
			logger.log("Ошибка isProjectCreator" + e);
		}
	}

	var isAdmin = remote.call("/groupPermision?user="+user.name+"&group=ALFRESCO_ADMINISTRATORS");

	if (isAdmin.status == 200)
	{
		try{
			obj = JSON.parse(isAdmin);
			model.isAdmin = obj.result;
		}catch(e){
			model.isAdmin = "false";
			logger.log("Ошибка isAdmin" + e);
		}
	}

	var isTest = remote.call("/groupPermision?user="+user.name+"&group=TEST");

	if (isTest.status == 200)
	{
		try{
			obj = JSON.parse(isTest);
			model.isTest = obj.result;
		}catch(e){
			model.isTest = "false";
			logger.log("Ошибка isTest" + e);
		}
	}
	else
	{
		model.isTest = "false";
	}


	var settings = remote.call("/user-settingAction");

	setting = JSON.parse(settings).setting;

// logger.log(setting);

	model.visibleActionsLength = setting.length;
	var actions = [];
	for ( var i = 0; i< setting.length; i++)
	{
		var action = setting[i];

		if (action == null) continue;

		if (action.id == "add_incoming_doc_btn" && model.canCreateIncomingDocument != true)
			continue;

		if (action.id == "add_project_btn" && (model.isAdmin != "true" && model.isProjectCreator != "true"))
			continue;


		if (action.visible)
		{
			actions.push(
				{
					"id":action.id,
					"position":action.position
				}
			);
		}
	}

	actions.sort(sortByPosition);

	model.visibleActions = actions;


	function sortByPosition(a, b){
		return a.position - b.position;
	}

})();
