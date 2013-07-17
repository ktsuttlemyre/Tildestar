// API for accessing all the goodies
		var MemeCabinet={};

		(function(){ //hide most of the variables from the global scope and keep that scope clean

		//binds that are not the document			
		// Bind to StateChange Event
		History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
			var State = History.getState(); // Note: We are using History.getState() instead of event.state
			History.log(State.data, State.title, State.url);
		});


		//vars
		var thumbnails,reference,previewSpan="span2Responsive thumbnail"
		,markerClass="marker" //the blue highlighed box that moves around; that class
		,referenceClass = "span6 reference"
		,WIN = $(window),DOC = $(document),HTML= $('html'),BODY
		, stageRight;

		//Session data
		var session={
			toID:function(str){
				return str.substr(3);
			},
			user:{ID:1}
			,pushViewedID:function(id){
				session.viewedOrder.push(id);
				if(!session.isViewed[id]){
					session.isViewed[id]=true;
					session.viewedChanged=true;
				}
				session.saveViewed();
			}
			,saveViewed:_.debounce(function(){
						// resource id. and then store an object
						if(!session.viewedChanged){
							return;
						}

						console.log('Saving locally');
						amplify.store('viewed',session.isViewed); //save viewed
						session.viewedChanged=false; //reset
					},5000)
			,isViewed:amplify.store('viewed') || {} //save viewd li:IDs
			,viewedOrder:[]
			,viewedChanged:false
			,loaded:[]
			,json:{}
		};

		MemeCabinet.clearSession=function(){
			session.isViewed={};
			amplify.store('viewed',session.isViewed);
			session = {viewedOrder:[],loaded:[]}
			location.reload()

		}

		DOC.on('mediaChange', function(e,p){
			debug && console.log('mediaChange',p)
			if(p.from!=null){
				location.reload();
			}

		})


		var moveReference = function(event,scrollSpeed){
				var newReference = $(this)

				//do not allow selecting of page-hr
				//these are only key selects since
				//there is not a .click handler :-D
				if(newReference.hasClass('page-hr')){
					//figure out which way they were going
					if(newReference.prev()[0].id == reference[0].id){
						newReference = newReference.next();
					}else{
						newReference = newReference.prev();
					}
					scrollSpeed=0;
				}

				//if there is no ref
				if(!newReference || !(newReference.exists())){
					return;
				}

				//if newRef is reference
				if( mode=='icons' && newReference.hasClass('marker')) {
					actions.changeView('list');
				}else if(newReference[0].id==reference[0].id) {
					return;
				}

				//see who called this function was it a keyboard or a mouse click
				var isKey = event.originalEvent instanceof KeyboardEvent;
				if(isKey){ //if is key
					//scrollSpeed=0; //do a fast scroll
				}else{ //is mouse click
					if(mode == 'icons'){
					 	actions.changeView('list')
					 }
				}
				
				if(mode=='list' && comments){
					actions.toggleStageRight(true);
				}



				//if there was a ref already; then handle it
				if(reference){
					if(mode=='list'){
						var selection = thumbnails.children().first().nextUntil(newReference).andSelf();
						selection.not('.page-hr:last').remove();
						$('.page-hr:first').removeClass('span11').addClass('span12');

						scrollSpeed=0;
					}else{
						//clean it up
						reference.removeClass('pulse')
						.removeClass(referenceClass) //remove all classes
						.addClass(previewSpan);

						//get the next class
						var next = actions.toggleBreaks(false,reference).next()[0] ||reference;
						var prev = reference.prev()[0] || reference;
						actions.resizeText(reference) //fire resize text as it may have gotten smaller
 
						//actions.toggleBreaks(false);
						//if we are moving one li over, then set the scoll speed to 0
						if(next.id==newReference[0].id || prev.id==newReference[0].id){
							scrollSpeed=0;
						}
					}
				}


				//handle what mode we are in
				if(mode == 'list'){
					newReference.removeClass(previewSpan).addClass(referenceClass);
					
					if(comments){
						actions.toggleStageRight(true);
					}
					if(comments){
						actions.toggleBreaks(true,newReference);
					}else{
						newReference.css('clear','left');
					}
				}


				//handle viewed stuff
				reference.addClass('viewed')
				var id = session.toID(reference[0].id);
				session.pushViewedID(id);	

				//change over the reference
				reference=actions.moveHighlight(reference,newReference);
				


				//var ref=reference.find('.memeCell')[0]
				//ref.clientLeft
				//ref.offsetLeft
				//console.log('eeeee',ref.offsetWidth)
				actions.resizeText(reference);

				// push url state
    			History.pushState(null, null, encodeURI("/"+reference[0].id.substr(3)+"/")); // logs {state:1}, "State 1", "?state=1"
					
				//}
				//actions.toggleBreaks(true,reference);
				
				//_.defer(
				//scrollTo(reference,scrollSpeed);
				scrollTo(thumbnails,0,0)
				checkDocLength();
				positionStageRight(reference)
			}

		var positionStageRight = function(reference){
				if(!reference){
					return;
				}
				var offset = reference.offset().top;
				stageRight.css('top',offset+'px')
		}

		var scrollToTolerance = 5;
		var scrollTo =function(reference,scrollSpeed,marginTop){
				if(marginTop==undefined){
					marginTop=(Math.max((WIN.height()/10),30));
				}
				
				var offset = reference.offset().top;
				var pos = offset-marginTop;
				positionStageRight(reference)

				//see if we are already in that area
				var location = BODY.scrollTop();
				if(pos >= location-5 && pos <=location+5 ){
					return;
				}
				
				//do scrolling
				if(scrollSpeed==0){
					BODY.scrollTop(pos)
					return;
				}
				BODY.animate({
					'scrollTop':pos
					}
				, (scrollSpeed || 500)
				,'easeOutQuint'
				,function(){

				});
			
		}


		var resultsPerPage = 25;
		var tmpCounter=0;
		var timerID;
		var loadMore = function(number,callback){
			var query = {};
			//simulated data
			for(var i=0,l=number;i<l;i++){
				var tmp = $.extend(true,{},simAjax[tmpCounter % simAjax.length]);
				tmp.id=tmpCounter;
				query[tmpCounter++]=tmp;
			}

			//add our ajax query to the json local database
			//$.extend(true,json,query); //not this way

			//create DOM objects from data
			_.each(query,function(value,key,obj){
				_.defer(function(){ //causes this stuff to load async when I am not trying to scoll
					var data ={id:'li_'+key};


					value.aspect=(value.aspect)?value.aspect[0]:value.cells[0].aspect[0];

					data.constraint = ((100-value.aspect)/*/2*/)+"%";

					//(wi * hs/hi, hs)

					//handle all the heights based on width
					var media = Stallion.State.media;
					var refWideScreen = {
							ratio:(100/(16/9))*.01
							,width:867
							}
					

					if(DOC.width()){
						if(media=='phone'){ //if it is phone, do not divide the width in half
							refWideScreen.width = DOC.width() - (DOC.width()*.01 /*fudge Padding/margins*/);
						}else{
			
							refWideScreen.width = (DOC.width()/2) - (DOC.width()*.01 /*fudge Padding/margins*/);
						}
					}
					refWideScreen.height=refWideScreen.width*refWideScreen.ratio

						
					var image = {
							ratio:(100/(1/1))*.01
							,width:100
						}
					image.height=image.width*image.ratio
			
					var em = 14;/*px*/
					var targetHeight = (refWideScreen.height-(em*2) );/*2em for bottom toolbar*/
					//alert(value.aspect)
					var inverseRatio = ( targetHeight / (refWideScreen.width* (value.aspect*.01) ) ) 
					var percent = inverseRatio*100;
					//alert(value.aspect)
					

					value.constraintWidth =  percent;//(100*value.cells[0].dimension[1]) 

					value.constraintMinWidth = value.constraintWidth;
					value.constraintMaxWidth = value.constraintWidth;

					//480					

					//add our ajax query to the json local database
					session.json[key]=value;
					debug && console.log(value);

					//check data
					////check aspect ratio
					_.each(value.cells,function(value,key,obj){
						if(!value.aspectRatio){
							var img = value.background[1];
							var aspectPercent= "75%";

							var imgObj = new Image();
							imgObj.name = img;
							imgObj.onload = function(){
								var aspectWidthConstrain=calculateAspect(this.width,this.height,'width',false);
								var aspectHeightConstrain=calculateAspect(this.width,this.height,'height',false);
								debug && console.log(this.name,'= dimension:[',this.width,',',this.height,'],aspect:[',aspectWidthConstrain,',',aspectHeightConstrain,']');
							};
							imgObj.onerror = function(){console.error(this.name,'failed to load')};
							imgObj.src = img;

						}

					});


					value.enforceHeight=true;
					var tmp= tildestar.tmpl('tmpl-thumbnail-li',data)
						.find(".aspect-ratio-inner")
						.prepend(tildestar.tmpl('tmpl-cssBackgroundImage-li',value))
						.end();
					

					//see if it was viewed
					
					if(session.isViewed[session.toID(data.id)]){
						tmp.addClass('viewed');
					}

					//if there is a call back then call it
					//callback && ( callback(),callback=null );
					//if callback && callback now equals 
					// if the result of callback() ==true (callback succeeded so don't call it anymore)=false
					// if result of callback()==false (callback failed) return callback so it may be called again
					callback && (callback = (callback())?false:callback); 

					//check to see if we should page break
					var len = session.loaded.length
					if(len % resultsPerPage==0){
						var pageNumber = len/resultsPerPage;
						var hr = tildestar.tmpl('tmpl-page-hr-li',{id:'pageHR-'+pageNumber
											,pageNumber:pageNumber,dynamicSpan:(Stallion.State.media=="tablet")?"span6":"span4"
											,articles:articles });
						thumbnails.append(hr);

					}
				

					session.loaded.push(key);

					//add the new image
					thumbnails.append(tmp);
					thumbnails.add(tmp);
					tmp.find('.impactCaption').fluidtext('fluid').end()

					//bindActions(tmp); //for whatever reason the aspect css causes the width to be 0 until after this loop has finished
					//so if we defer the binding of the actions (specifically fluidtext) then it works no problem
				})
			});
			_.defer(function(){			
				//check the doc length again
				if(timerID){
					clearTimeout(timerID);
				}
				timerID = _.defer(checkDocLength);
			});

		}
		var addHooks = function(elements){
			elements.each(function(){
				$( "#toggle" ).toggle( "bounce", { times: 3 }, "slow" );
			})
		}
		

		var checkDocLength = function(){
			// ensure that there is always one window below
				if( DOC.height() - (WIN.scrollTop()+WIN.height())<= WIN.height()){
					loadMore(10);
				}
		}

		var setReference = function(){	
			reference = $("#content .thumbnails > :nth-child(2)")//.click(moveReference)
			if(reference.exists()){
				//go ahead and select the first one
				reference.first().addClass(markerClass);
				actions.resizeText(reference);
				actions.changeView('icons');
				$('.page-hr:first').removeClass('span11').addClass('span12');
				return true;
			}
			return false;
		}

		var mode = 'icons' //icons,list;
		, previousMode= null
		, comments = 'force'
		, editor =null
		, editorBackground
		, NAV;

		var actions = {
				changeView:function(m,e){
					if(m=='prev'){
						m=previousMode;
					}
					debug && console.log('new view',m)

					previousMode=mode;
					mode = m;

					if(mode == 'editor'){
						//editorBackground.addClass('slide-hide-down')
						//editorBackground.show()
						editor.removeClass('slide-hide-down');
						editor.removeClass('visible-none');

					}else{//hide editor
						//editorBackground.hide();
						editor.addClass('slide-hide-down');
						//editor.hide();
					}
				},
				moveRight:function(e){
					if(!reference){
						setReference();
					}
					moveReference.call(reference.next(),e);
					e.preventDefault();
				},
				moveLeft:function(e){
					if(!reference){
						setReference();
					}
					moveReference.call(reference.prev(),e);
					e.preventDefault();
				},
				toggleStageRight:function(show,e){
					if(show=='force'){
						show == true;
					}
					else if(show=='toggle'){
						show=!comments;
					}
					else if(show==comments){
						return;
					}
					comments = show;
					debug && console.log('toggle',show,stageRight)
					stageRight=$('#stageRight');
					if(show){
						stageRight.show();
						stageRight.css('display','block')
					}else{
						stageRight.hide();
						stageRight.css('display','none')
					}
					if(mode=='list' && !show){
						reference.css('clear','float').next().css('clear','');
					}else{
						actions.toggleBreaks(show);
					}

				},
				toggleEdit:function(show,meme,e){
					if(show=='toggle'){
						console.warn('not implemented')
					}
					if(show){
						actions.changeView('editor');
						var id = meme.attr('id')
						console.log(meme,'Loading into editor json[',id,']:',session.json[id])
						editorAPI.load(session.json[id]);
					}else{
						editorAPI.close();
					}
					

				},
				toggleReference:function(show,ref,e){
					if(!ref){
						ref=reference;
					}

					if(ref){
						ref.removeClass("reference span6")
						.addClass('pulse '+previewSpan);
					}
					actions.toggleStageRight(show);
					actions.toggleBreaks(false,ref,e);
					actions.resizeText(ref);
					actions.changeView((show)?'list':'icons');
					scrollTo(ref)
				},
				moveHighlight:function(ref,newRef,e){
					if(!ref){
						ref=reference;
					}
					if(!newRef){
						newRef=reference;
					}
					reference.removeClass('marker');
					return newRef.addClass('marker');
				},
				resizeText:function(ref,e){
					if(!ref){
						ref=reference;
					}
					return ref.find('.fluidtext').fluidtext('resize').end();
				},
				toggleBreaks:function(add,ref,e){
					if(!ref){
						ref=reference;
					}
					//if(mode!='icons'){
					//	console.log('yeah')
					//	return ref.pref().css('clear',add).end();
					//}
					add = (add)?'left':'';
					return ref.css('clear',add).next().css('clear',add).end();
				}
		}

		var searchSuggest = function(query,callback){


		}

		var checkAd = function(elem,func){
			if (elem.height() == 0){
				return func();
			}
			return false;
		}


		/*original inspiration
		http://thepcspy.com/read/how_to_block_adblock/
		By: the author of the site?
		*/
		var checkForAdBlock = function(elem,func,deep){
			var ans = undefined;
			if($.type(elem)=="array"){
				$.each(elem, function(value){
					var ans= checkAd(value);
					if(ans){
						return ans;
					}
				});
			}else{
				elem=$(elem)
				elem.each(function(){
				if(!ans){
					ans=checkAd($(this),func);
				};
				})
			}
		}


		var actionButtonEvents={'icon-pencil':function(e){
					actions.toggleEdit('toggle',$(this).closest('.thumbnail').find('.meme'),e);
					scrollTo(reference,0);
					e.preventDefault()},
					'icon-comment':function(e){
					actions.toggleStageRight('toggle',e);
					scrollTo(reference,0);
					e.preventDefault()}
		}

		var refreshTimer;
		
		$(function $_docReadyGallery(){//document ready
			//var iscroll;
			//setTimeout(function () {
			//iscroll = new iScroll('iScroll');
			//}, 100);
			

		
			//init doc dependent vars
			stageRight=$('#stageRight');
			BODY = $(document.body);
			thumbnails=$('#content .thumbnails');
			editor =$('#editor');
			NAV = $('#nav');
			refreshTimer = $('#refreshTimer');
			
			scrollTo(NAV,0,0); //stageRight must be set first
			$('#content ul.thumbnails')
				.on('click','li',function(e){
					var li = $(this)
					console.log(li.is('li'),li)
					if(li.hasClass('span2Responsive')){ //handle li elements that should be max/min on click
						moveReference.call(this,e);
						return false;
					}
				})
				.on('click','a',function(e){
					var li=$(this);
					var elem = li.children('span');
					$.each(elem.classList(),function(key,value){
						var func = actionButtonEvents[value];
						if(func){ //if we have an action for it do it!
							e.stopPropagation();
							func.call(elem,e);
							return false;
						}; 
					})
				});

			//$('.search-site').typeahead({source:searchSuggest,items:8,minLength:1})
			$('#commentTabs a').click(function (e) {
				e.preventDefault();
				$(this).tab('show');
			})

			//set reference
			if(thumbnails.find('> li').length==0){ //if there are no images
				//(WIN.width()/200)*(WIN.height()/300)
				loadMore(10,setReference) //load then set reference
			}else{
				setReference();
			}

			editorBackground=$('#editor-background');
			//handle clicks on document
			
			//$('#content').click(function(e){
			//	//if click is on the HTML document
			//	debug && console.log('click',mode,e.target,editorBackground)
			//	if(mode!='editor'){
			//		 DO NOT DO THIS
			//		if(e.target.id=='content'){
			//			if(mode=='icons'){
			//				return;
			//			}
			//			actions.toggleReference();
			//			actions.changeView('icons');
			//		}
			//		
			//	}else{
			//		
			//	}
			//});

			$('#editor-background').click(function(e){
				if(e.target.id=='editor-background'){
					editorAPI.hide()
				}
			})

		//make sure that the page is always loaded at the top
		WIN.on('popstate', function(){
			//if phone then add scroll to reload
			if(Stallion.State.media=='phone'){
				$('#refreshBar').show();
				scrollTo(NAV,0,0);
			}

			//wait till the pop state before we add the scroll listener
			var refreshTimerIDs = [];
			WIN.scroll(
				_.throttle(function(){
					if(Stallion.State.media=='phone' && WIN.scrollTop()<=5){
						//clear any ids
						_.each(refreshTimerIDs,function(id){
							clearTimeout(id)
						});
						refreshTimer.text("3...");

						//set new timers!
						refreshTimerIDs=[
						/*3*/
						setTimeout(function(){
							refreshTimer.text("2..")
							},500)
						/*2*/
						,setTimeout(function(){
							refreshTimer.text("1.");
							},1500)
						/*1*/
						,setTimeout(function(){
							if(WIN.scrollTop()<=5){
								location.reload();
								refreshTimer.text("Now");
								return;
							};
							refreshTimer.text("3");
							},2500)
						];

						}

					checkDocLength(); //debounce/throttle scrolling ALWAYS!
					}
				,200)); 

			return false; //stop the pop state function
		});


		//handle key events
		var Key = Stallion.keyboard.mapToCode;
		//it is a dirty sparse array, YOLO
		var keysThatStopScroll=['down-arrow','up-arrow','page-up','page-down','home','end']; //dont worry about overwriting these untill you get to 8
		_.each(keysThatStopScroll,function(value,key,obj){
			obj[Key[value]]=true;
		});


		// Stop the animation if the user scrolls. Defaults on .stop() should be fine
		//http://stackoverflow.com/questions/8858994/let-user-scrolling-stop-jquery-animation-of-scrolltop
		$('html, body').bind("scroll DOMMouseScroll mousewheel keydown", function(e){
			var key = e.which;
			if ( e.type === "mousewheel"||
				 keysThatStopScroll[key]){
				//TODO only do this if one of the following happened 2-3 times within 100ms
				BODY.stop().unbind('scroll mousedown DOMMouseScroll mousewheel'); // This identifies the scroll as a user action, stops the animation, then unbinds the event straight after (optional)
			}
		});
			

			$('.carousel-control.right').click(actions.moveRight);
			$('.carousel-control.left').click(actions.moveLeft);

			//handle endless scrolling
			
			
			WIN.resize(function(){
				_.defer(positionStageRight,reference)
			});

			//add to top button
			$('#toTop').click(function(){
				BODY.animate({
					'scrollTop':0
					}
				, 1000);
				return false; //override the # action
			});
			//if they get lost help them find their place
			$('#lost').click(function(){
				scrollTo(reference);
				reference.removeClass('pulse');
				_.defer(function(){reference.addClass('pulse')})
				return false; //override the # action

			});


			BODY.keyup(function(e) {

					var key = e.which;
					if(key == Key['right-arrow']){
						actions.moveRight(e)
					}else if(key == Key['left-arrow']){
						actions.moveLeft(e)
					}else if(key == Key['escape']){
						actions.toggleReference();
					}//else if (key == Key['l']){
					//	actions.changeView('list')
					//}else if (key == Key['i']){
					//	actions.changeView('icons')
					//}//else if(key==Key['space']||key==Key['enter']){
					//	e.preventDefault();
					//	actions.toggleReference(true);
					//}
				}).keydown(function(e) {
					//Stallion.key(e).is('enter').preventDefault();
				//if (e.which == Key['space']) {
				//	e.preventDefault();
					//e.preventDefault();
				//	return false;
				//}
			});
			//XXX checkDocLength();
			//setInterval(checkDocLength,5000)
			
			checkForAdBlock('.sponsor',function(){console.warn('ads are blocked')});
		})//document ready
		$.fluidtext({rateTech:'debounce',rateTechTime:500,laggingLayout:false});//configure fluidtext
 
 		//expose the editor functions
		var editorAPI={};
		!(function $_editor(){//editor code
			var editorStage = $('#editor-stage');

			var bindEditorActions = function(element){
				
					
				return element;

			};

			
			var editorDo ={
				start:function(){
					tildestar.modal('header','text and stuff')
				},
				hide:function(){
						actions.changeView('prev');
				},
				load:function(json){
					//make sure json info is a copy or new
					json = (json)?$.extend(true,{},json):{};
					json.enforceHeight=false; //no
					json.id='newMeme'; //TODO fix this? make it random? idk

					console.log('>>>Editor-Stage: loading json =',json)
					console.warn('data',tildestar.dataDash(editorDo.getMemeDOM()),editorDo.getMemeDOM())
					var meme=tildestar.tmpl(editorDo.getMemeDOM() || 'tmpl-cssBackgroundImage-li'
						,json
						,{dataAppend:function(tmpl,json){
							if(!tmpl || !json){return}
							tmpl.cells.push.apply(tmpl.cells,json.cells);
							return tmpl
						}});
					
					// reset
					editorDo.reset(true);
					//clear and re-add
					var options={width:'20%',height:'100%'}

					if(json.cells.length>1){
						options['float']='left'
					}
					editorStage.append(meme.addClass('').css(options));
					console.warn('data',tildestar.dataDash(editorDo.getMemeDOM()),editorDo.getMemeDOM())

					//after appending the DOM object 

					//we then add fluidtext
					//var fluidText= 
					meme.find('.impactCaption')//.get();
						.fluidtext('fluid',{editable:true,'max-font-size':.5,onEditComplete:function(text){editorStage.trigger('blur')}});
				},
				close:function(){
					editor.addClass('visible-none');
					editorDo.reset(true);
					//editor.hide();
					
					debug && console.log(editor)				
					actions.changeView('list');
				},
				reset:function(clear){
					editorStage.find('.fluidtext').fluidtext('delete');
					editorStage.empty();
					if(!clear){
						editorStage.append(startMeme);
					}
				},
				getMemeDOM:function(){
					var elem= editorStage.find('#newMeme') //children()[0];
					return elem.exists(true);
				},
				generateJSON:function(element){
					return (!element)
						?tildestar.dataDash(editorDo.getMemeDOM(),undefined,'data')
						:tildestar.dataDash(element,undefined,'data');
				},
				save:function(meme){
					if($.type(meme)!='object'){
						throw 'bad input to save'
					}else if($.i$(meme)){
						meme=meme[0];
					}

					//it must be a DOM objet or plain object by now
					if(!$.isPlainObject(meme)){ //convert the DOM to object
						meme = tildestar.dataDash(meme);
					}
					
				$.ajax({
					type: "PUT",
					data: {meme:meme},
					success:function(){
						
					}
				});

				},
				submit:function(json){
					if(!json){
						json=editorDo.generateJSON();
					}
					var jqxhr = $.post("/",json)
						.done(function() { alert("success"); })
						.fail(function() { alert("error"); })
						.always(function() { alert("finished"); });
				},
				newMeme:function(){
					editorDo.reset();

				},
				addCell:function(){
					alert("addcell")
				}
			}
			//expose some actions
			editorAPI.load=editorDo.load;
			editorAPI.hide=editorDo.hide;

			var startMeme=$('<div/>').attr({id:'editor-start'}).addClass('start-meme').append(
				$('<button/>').text('start').click(editorDo.start)
			)



			$(function $_docReadyEditor(){//document ready
			var editorWindow=editor.find('.editor-window');
			//bind a reshow event to the navbar of the editor
			//when the user clicks this the editor reappears
			editor.find('.navbar').click(function(e){ 
				e.preventDefault();
				if(mode=='editor'){ //do nothing if editor
					return;
				}
				console.log('removing',editor)
				actions.changeView('editor');

			});
			//bind a close event for closing the editor perminately
			editorWindow.find('.close-circle').click(function(e){
				e.preventDefault();
				editorDo.close()
				return false; //prevent bubbling up to parents
				//it is important for this false to exist so that the editor does not "reshow"
			})

		//list actions in order
		var dropDownActions=[
			editorDo.newMeme,
			editorDo.addCell,
			editorDo.submit,
			editorDo.close
		]
		//bind the file functions
		var dropDownList = editor.find('.dropdown-menu > li:not(.divider)')
			.each(function(index){
				var elem = $(this);
				elem.click(function(e){e.preventDefault();dropDownActions[index]();return false;});
			})


					var regex = /\((.*?)\)/gi;
					//ADD BINDS!
					editorStage.on('blur',function(){
						var memeDOM=editorDo.getMemeDOM()
						var data = tildestar.dataDash(memeDOM);
						data = data.data || {};

						console.log('dataDash',data,memeDOM)


						//parse rulse for root
						var extract ={
						//	id:'attr id'
							tags:'attr data-tags'
							,author:session.user.ID
							,created: new Date()//'attr data-created'
							,statistics:undefined
							,flow:undefined //fills horizontally
							,cells:undefined
						}

						$.each(extract,function(key,value){
							var val = (value && value.split)?value.split(' '):undefined;
							if(value===undefined || value.length!=2){return;}
							extract[key]=memeDOM[ val[0] ]( val[1] );
						})


						//parse rules for a memeCell
						var cells = extract.cells = [];
						memeDOM.find('.memeCells > .memeCell').each(function(){
							var elem=$(this);
							var cell={};
							//cell.aspect = (/*padding in float*/parseFloat(elem.css('padding-bottom').replace("px",''))
							//				/*÷*// 
							//				/*width*/elem.width()
							//			/*to percent format*/*100)+"%" //NOT PERFECT!!!
							//regex.exec(elem.css('background-image'));
							//cell.background=[
							//	elem.css('background-color')
							//	,RegExp.$1
							//	,elem.css('background-repeat')
							//	//,elem.css('background-attachment')
							//	,elem.css('background-position')
							//	];
							cell['background-size']=elem.css('background-size');

							cell.text=[];
							elem.find('.fluidtext').each(function(){
								var textDOM=$(this);
								cell.text.push({
									'class': textDOM.attr('class')
									,'style': textDOM.attr('style')
									//,textOBJ['align']
									,'value': textDOM.text()
								});
							});
							cells.push(cell);
						})
						console.log('newData',
							tildestar.dataDash(
								memeDOM
								, $.extend(true,data,extract) 
								,'data')
							)
						

					});


		}) //doc ready editor end




		})()//editor scope
		

		})(); //clsure to keep the global space clean!