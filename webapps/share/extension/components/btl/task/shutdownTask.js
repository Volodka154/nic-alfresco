function shutdownTask(redirect)
{
	
	if (window.parent.document != document)
	{
	 	//window.parent.document.frameCancel();
	 	window.location.reload()
	}
	else
	{
		window.location.replace(redirect);
	}
}