tildestar.buddyList=new (function(){
	var buddyHashMap = {} //TODO replace with Stallion hashmap
	var statusMap = {online:'friendStatusOnline',
					offline:'friendStatusOffline',
					idle:'friendStatusIdle',
					away:'friendStatusAway',
					undefined:'error',
					null:'error'}

	var ul = $('.privateChatContainer ul');
	ul.sortable({
      placeholder: "box64x64",
      axis: "x",
      start: function( event, ui ) {
      	console.log('start')
      },
      change: function( event, ui ) {
	console.log('change')
      },
      sort: function( event, ui ) {
	console.log('sort')
      },
      end: function( event, ui ) {
	console.log('end')
      },
      handle:'.memeIcon'

    });
    ul.disableSelection();


	this.updateUsers=function(users){
		_.each(users,this.updateUser);
	}
	this.updateUser=function(user){

		var userDOM = buddyHashMap[user.id]
		if(userDOM==undefined){ //TODO more robust check  if the buddy has not been added, add him
			var status = $('<div/>').addClass(statusMap[user.status]+' tearDropBR memeIcon');
			var container= $('<span/>');
			var image = $('<img class="media-object tearDropBL" data-src="holder.js/64x64" alt="64x64" style="display:block;width: 64px; height: 64px;">').attr('src',user.image);
			var name = $('<span/>')
								.addClass('memeIconText bold')
								.text(user.name);
			var view = /*$('<div/>').addClass('media').css({,display:'inline'}).append(
					$('<a/>').addClass('pull-left').attr('href','#').append(*/
						container.append(
							status.append(image).append(name)
							)
					//)
				//).append($('<div/>').addClass('media-body').html('<h4 class="media-heading">'+user.name+'</h4>'+user.status))
			var chatStage=$('<div/>').addClass('chatStage tearDropBL well').append(view.addClass('pull-right'))
			var chatMessages = $("<ul/>")
			var chatCanvas=$('<div/>').addClass('chatCanvas tearDropBL well')

			var chatInput="";
			var li = $("<li/>").attr({"id":"userLI-"+user.id}).append(chatStage);
			ul.append(li);
			userDOM={
				status:status,
				container:container,
				image:image,
				name:name,
				view:view,
				li:li,
				chatStage:chatStage,
				chatMessages
				lastMessage:user
			};
			buddyHashMap[user.id]=userDOM;

		}


		userDOM.lastTextMessage=(user.message!=undefined)?user:userDOM.lastTextMessage;

		//update status
		if(user.staus && !userDOM.status.hasClass(statusMap[user.status])){ //if we have a value && it is different
			_.each(statusMap,(function(x){userDOM.status.removeClass(x)})) //remove all of them
			userDOM.status.addClass(statusMap[user.status]); //add the new one
		}

		//update icon
		if(user.image && user.image != userDOM.image.attr('src')){
			userDOM.image.attr('src',user.image)
		}

		//update name
		if(user.name && user.name!=userDOM.name){
			userDOM.name.text(user.name)
		}

		//append message
		if(user.message && user.userEpoc!=userDOM.lastTextMessage.epoch){
			userDOM.chatStage.append($("<span/>").addClass('chatStatement').html("<br>"+user.message))
		}

		
	}

})()


$(document).ready(function() {
	Stallion.widgets.css.themeSwitcher("#themeSwitcher",{
			Layout:{page:"pageLayout.css",fullscreen:"fullscreenLayout.css"},
			Color:{day:"day.css",night:"night.css"}
			});

	Stallion.mediaChangeListener.addHandler(function(e,param){
		console.log(e,param)
		tildestar.convertLayout(e,param)
	}).start();

	var searchUserInput=$('#searchUserInput').hide()
	var blurSearchUserInputTO = null;
	$('#searchUser').click(function(){
		clearTimeout(blurSearchUserInputTO);
		searchUserInput.toggle("drop", { direction: "left" }, "fast",function(){searchUserInput.focus()});
	})
	searchUserInput.blur(function(){
		blurSearchUserInputTO=setTimeout(function(){searchUserInput.hide("drop", { direction: "left" }, "fast")},1000);	
	});
	searchUserInput.typeahead({
		source:['bill','ben','beth','billy'],
		items:3,
		minLength:1})


	tildestar.buddyList.updateUsers([
		{id:'4456',name:'bill',status:'online',image:'apple-touch-icon-114x114-precomposed.png'},
		{id:'4454',name:'steve',status:'away',image:'apple-touch-icon-114x114-precomposed.png'},
		{id:'4453',name:'clint',status:'offline',image:'apple-touch-icon-114x114-precomposed.png'},
		{id:'4452',name:'beth',status:'online',image:'apple-touch-icon-114x114-precomposed.png'},
		{id:'4451',name:'beeatz',status:'idle',image:'apple-touch-icon-114x114-precomposed.png'}
		])
	// tildestar.buddyList.updateUsers([
	// 	{id:'4452',userEpoc:'1360714316',serverEpoc:'1360714326',message:'morbi tristique'},
	// 	{id:'4452',userEpoc:'1360714312',serverEpoc:'1360714322',message:'senectus et netus'},
	// 	{id:'4453',userEpoc:'1360714313',serverEpoc:'1360714323',message:'sociis natoque'},
	// 	{id:'4451',userEpoc:'1360714314',serverEpoc:'1360714324',message:'et malesuada'},
	// 	{id:'4452',userEpoc:'1360714315',serverEpoc:'1360714325',message:'fames ac turpis egestas.'}
	// 	])


});