////////////////////////////////////////////////////////////////////////////////
//Stallion shim code that needs to be integrated into stallion
///////////////////////////////////////////////////////////////////////////////

!(function(window,document,undefined,$){
Stallion = (typeof Stallion != 'undefined')? Stallion: {}; //stallion shim


Stallion.cast={}
Stallion.cast.jquery=function (input){
	//accepts a selector, dom, jquery, or array of those and returns jquery
	//TODO finish this

	//convert array of selectors into jquery
	//var array = ['thing1', 'thing2'];
	//var object = {};
	//object.space = {};
	//$.each(array, function () {
	//	object.space[this] = $('#node-' + this);
	//});
	return $(input);
}

Stallion.require = function(id,callback,ifLoaded){
	//id can be a list of nested dependancies or a path

	return ""	
}


//TODO make this return an object
Stallion.keyboard = function(keyMap,actionMap){

};

Stallion.keyboard.mapToCode ={
/*function(e){
	self.is = function(key){
		return (e.which==Stallion.key[key])?e:false;
	}
	return function(){e.witch}
}*/
		'backspace' : 8,
		'tab' : 9,
		'enter' : 13,
		'shift' : 16,
		'ctrl' : 17,
		'alt' : 18,
		'pause-break' : 19,
		'caps-lock' : 20,
		'escape' : 27,
		'space' : 32,
		'page-up' : 33,
		'page-down' : 34,
		'end' : 35,
		'home' : 36,
		'left-arrow' : 37,
		'up-arrow' : 38,
		'right-arrow' : 39,
		'down-arrow' : 40,
		'insert' : 45,
		'delete' : 46,
		'0' : 48,
		'1' : 49,
		'2' : 50,
		'3' : 51,
		'4' : 52,
		'5' : 53,
		'6' : 54,
		'7' : 55,
		'8' : 56,
		'9' : 57,
		'a' : 65,
		'b' : 66,
		'c' : 67,
		'd' : 68,
		'e' : 69,
		'f' : 70,
		'g' : 71,
		'h' : 72,
		'i' : 73,
		'j' : 74,
		'k' : 75,
		'l' : 76,
		'm' : 77,
		'n' : 78,
		'o' : 79,
		'p' : 80,
		'q' : 81,
		'r' : 82,
		's' : 83,
		't' : 84,
		'u' : 85,
		'v' : 86,
		'w' : 87,
		'x' : 88,
		'y' : 89,
		'z' : 90,
		'left-windows' : 91,
		'right-windows' : 92,
		'select-key' : 93,
		'numpad 0' : 96,
		'numpad 1' : 97,
		'numpad 2' : 98,
		'numpad 3' : 99,
		'numpad 4' : 100,
		'numpad 5' : 101,
		'numpad 6' : 102,
		'numpad 7' : 103,
		'numpad 8' : 104,
		'numpad 9' : 105,
		'multiply' : 106,
		'add' : 107,
		'subtract' : 109,
		'decimal' : 110,
		'divide' : 111,
		'f1' : 112,
		'f2' : 113,
		'f3' : 114,
		'f4' : 115,
		'f5' : 116,
		'f6' : 117,
		'f7' : 118,
		'f8' : 119,
		'f9' : 120,
		'f10' : 121,
		'f11' : 122,
		'f12' : 123,
		'num-lock' : 144,
		'scroll-lock' : 145,
		'semi-colon' : 186,
		'equals' : 187,
		'comma' : 188,
		'dash' : 189,
		'period' : 190,
		'forward-slash' : 191,
		'grave-accent' : 192,
		'open-bracket' : 219,
		'backslash' : 220,
		'close-bracket' : 221,
		'quote' : 222
	}

Stallion.keyboard.mapToString={}
_.each(Stallion.keyboard.mapToCode,function(value,key,obj){
	Stallion.keyboard.mapToString[value]=key;
})
console.log(Stallion.keyboard.mapToString)
var keyState = Stallion.keyboard.keyState = {};
/*
body,
				{keydown:{
							enter:function(e){e.preventDefault()}
						},
				keyup:{
						right-arrow:function(){maximizeThumb(currentThumbnailFull.next(),0);}
						left-arrow:function(){maximizeThumb(currentThumbnailFull.prev(),0);}
					},
				keyRepeat:{

					}
				};
				*/
Stallion.keyboard.hook=function(element,map){
	alert('NO')
	var actions =['keyup','keypress','keydown','keyrepeat'];
	_.each(actions,function(value,index,obj){
		if(!obj[value]){
			obj[value]
		}	
	})
	

	element.keydown(function(e) {
					var key = e.which, state = keyState[key];
					if(state){ //if it is already down
						var fn = map['keyrepeat'][key];
						if(fn){
							fn(e);
						}
						return;
					} //if it is the first time going down
					//now set it down
					keyState[key]=true;
					//do action
					var fn = map['keydown'][key];
					if(fn){
						fn(e);
					}
			})
			.keyup(function(e) {
				var key = e.which, state = keyState[key];
				keyState[key]=false; //now it is up
				//do action
				var fn = map['keyup'][key];
				if(fn){
					fn(e);
				}
				})
			.keypress(function(){

				});
}

Stallion.events = {};

//add debug menu
var StallionDebugMenu=$(function(){ //on document load set this
	StallionDebugMenu=tildestar.modal('StallionDebug',$('<div/>').attr({'id':'StallionDebug'}).html(
	'<ul class="responsive-utilities-test">'+
		'<li class="visible-phone icon-mobile-phone" name="phone"> 40%</li>'+
		'<li class="visible-tablet icon-tablet" name="tablet"> 60%</li>'+
		'<li class="icon-laptop" style="display:none;"></li>'+
		'<li class="visible-desktop icon-desktop" name="desktop"> 80%</li>'+
		'<li class="visible-portrait icon-resize-vertical" name="portrait" style="color:white; vertical-align:bottom;"></li>'+
		'<li class="visible-landscape icon-resize-horizontal" name="landscape" style="color:white; vertical-align:bottom;"></li>'+
	'</ul>'),{close:false,cancel:function(){Stallion.event('ToggleStallionDebugMenu');return false;}},{'class':'visible-robots',modal:{backdrop:false}});
});
Stallion.keyboard.binds=[];
var DOC= $(document);
var postEvent =function(event){Stallion.event(event)};

var funcFalse=function(){return false};

Stallion.event=function(event,data){
	DOC.trigger(event,data);
}
Stallion.event.register=function(func,key,event,element){
	if(func===false){
		func=funcFalse;
	}
	if($.type(key)!='number'){
		key=Stallion.keyboard.mapToCode[key];
	}

	DOC.on(event,func);
	Stallion.keyboard.binds[key]=func;
	}


//default key binds
Stallion.event.register(function(){
	//StallionDebugMenu.modal('toggle'); don't use this
	StallionDebugMenu.toggleClass('visible-robots');
},'numpad 0','ToggleStallionDebugMenu');


Stallion.widgets={}
Stallion.widgets.css={}

Stallion.widgets.css.loadChosenCSS=function(){
	if($.cookie("css")) {
		$("link").attr("href",$.cookie("css"));
	}
}

Stallion.widgets.css.loadChosenCSS();

Stallion.Spy={};
Stallion.Spy.responsive=function(){
	var thresholdWarn=500;
	var thresholdAlert=2000;

	var dateThen = Date.now();
	
	var lagCheck =function(){
			var delta = (Date.now()-dateThen);
			if( delta >= thresholdWarn){
				
				if(delta >= thresholdAlert){
					//alert('Lagging a lot',delta)
					console.error('Lagging a lot '+delta)
				}else{
					console.warn('Lagging',delta)
				}

			}
			dateThen=Date.now();
			_.defer(lagCheck);

		}
	lagCheck();
}

//Stallion.Spy.responsive();





//example Stallion.recursive({one:"gg",{two:8}},function(pwd){console.log(pwd.val)})
Stallion.recursive = function(obj,func,initO){
	var o = initO,isRoot=true,initObj=obj;

	if($.isFunction(func)){
		func={leaf:func};
		func.startBranch=function(){};
		func.endBranch=func.startBranch;
	}


	var recursive = function(value,key,obj) { 
		var depth = null; //TODO make this count the dept
		if (_.isObject(value)) {
			var saveRoot=isRoot;
			if(isRoot){
				isRoot=false;
			}
			var pwd = {value:value,
				key:key,
				obj:initObj,
				isRoot:isRoot,
				depth:depth,
				branch:obj,
				o:o}
			func.startBranch(pwd);
			_.each(value, recursive) 
			isRoot=saveRoot;
			pwd.isRoot=isRoot;
			func.endBranch(pwd);
		}else{
			func.leaf({value:value,
				key:key,
				obj:initObj,
				isRoot:isRoot,
				depth:depth,
				branch:obj,
				o:o});
		}
	}


	_.each( obj, recursive);
	return o;
}

Stallion.widgets.css.themeSwitcher=function(selector,themeMap){
	var parent = Stallion.cast.jquery(selector);
	

	var switcher = Stallion.recursive(themeMap,
					{leaf:function(pwd){
						pwd.o.last().append(
						$("<li/>")
						.attr("role","presentation")
						//create the link
						.append($('<a role="menuitem" tabindex="-1" href="#"></a>')
								.text(pwd.key)
								.click(function(){ //add click listener
									$("link").attr("href",pwd.value); //append a new stylesheet to the doc
									$.cookie("css",$(this).attr('rel'), {expires: 365, path: '/'}); //save this prefrence for the user
									return false; //make sure the link does not go anywhere
								})
							)
						)
					},
					startBranch:function(pwd){
						if(pwd.isRoot){
							pwd.o.append($('<a class="dropdown-toggle" role="button" data-toggle="dropdown" href="#"></a>').text(pwd.key).append($('<b class="caret"></b>')))
						}
					},
					endBranch:function(pwd){

					}
				},
				$('<div/>')
			);

    //http://www.jquery4u.com/dynamic-css-2/jquery-change-css-file-2/



    parent.append(switcher);


}

Stallion.Sleuth={}
Stallion.Sleuth.reportEventsFor=function(elem){
	elem=$(elem)

	elem.on(getEventsList(elem), function(e) {
    	console.log(e);
	});
}



		window.Stallion=Stallion;
})(window,document,undefined,jQuery)

!(function(window,document,undefined,$){

	tildestar={};
	tildestar.DOM={}
	//insparation
	////http://stackoverflow.com/questions/744319/get-css-rules-percentage-value-in-jquery
	//By user: gumbo - http://stackoverflow.com/users/53114/gumbo
	tildestar.DOM.getCssRule = function(rule,prop){
		//classnames start with a .

		var rules=document.styleSheets[0].rules || document.styleSheets[0].cssRules;
		for (var i=0; rules.length; i++) { //TODO turn into hash
			var r = rules[i];
				if (r.selectorText && r.selectorText.toLowerCase() == rule) {
					if(prop){
						return r.style.getPropertyValue(prop);
					}else{
						return true;
					}	
				}
			}
		return undefined;
	}


	//http://www.developer.nokia.com/Community/Wiki/How_to_disable_dragging_of_images_and_text_selection_in_web_pages
	tildestar.html = function disableDragging(element) {
	  // this works for FireFox and WebKit in future according to http://help.dottoro.com/lhqsqbtn.php
	  element.draggable = false;
	  // this works for older web layout engines
	  element.onmousedown = function(event) {
	                event.preventDefault();
	                return false;
	              };
	  var styleSet = false;

	  if($ instanceof JQuery){
	  	$(element).bind('dragstart', function(event) { event.preventDefault() });
	  	  if(Tildestar.DOM.getCssRule('.select-none')){
	  		$(element).addClass('select-none');
	  		styleSet=true;
		  }
	  }
	  if(!styleSet){ //TODO set the select to none
	  	//-webkit-touch-callout: none;
		//-webkit-user-select: none;
		//-khtml-user-select: none;
		//-moz-user-select: none;
		//-ms-user-select: none;
		//user-select: none;
	  }
	}



	tildestar = {};
	tildestar.convertLayout=function(e,param){


		}

	tildestar.alert=function(type,header,message){
		if(type=='warning'){
			type='block';
		}

		$(document.body).append($(''+
			'<div class="position-relative alert alert-'+type+'">'+
			'<button type="button" class="close" data-dismiss="alert">&times;</button>'+
			'<h4>'+header+'</h4>'+
			'<span>'+message+'</span>'+
			'<button type="button" data-dismiss="alert" class="btn btn-warning" style="margin:1em">OK</button>'+
			'</div>'
			))
	}

	tildestar.uri={};
	tildestar.uri.fragment=function(){
		var uri= new URI(),fragment = uri.fragment(),
		query='',loc='',exp=fragment.indexOf('!'),que=fragment.indexOf('?');
		var queryOBJ={};

		if(fragment.length!=0){	
		loc = (exp<=que)?fragment.substring(exp+1,que):fragment.substring(exp+1);
		query = (exp<=que)?fragment.substring(que+1):fragment.substring(que+1,exp);
		queryOBJ = URI.parseQuery(query); 
		}

		return {queryHash:function(){return queryOBJ},
				removeQuery:function(key,value){URI.removeQuery(queryOBJ,key,value)},
				isEmpty:function(){return $.isEmptyObject(queryOBJ)},
				normalize:function(){
					var tmp = uri.normalizeHash().fragment("").fragment(queryOBJ);
					uri=tmp},
				load:function(){
					//history.pushState("", document.title, uri.fragment("").toString());
					// slice off the remaining '#' in HTML5:    
					if (typeof window.history.replaceState == 'function') {
					  history.replaceState({}, '', uri.fragment("").toString());
					}
				}
			}

		

	}


	tildestar.uri.consumeFragment=function(){
		var fragment = tildestar.uri.fragment()
	 
		if(fragment.isEmpty()){
			return;
		}

		var hashProtocol = {
				serverMessage:
					{unauthenticated:function(){tildestar.alert('warning','Unauthenticated','Wrong username/password combination');}
					}
				};

			

			var fun_,func;
			_.each(fragment.queryHash(),function(value,key){
				fun_ = hashProtocol[key];
				func = (fun_!=undefined)?fun_[value]:undefined;
				if(func){
					func();
					fragment.removeQuery(key, value);
				}
			});

			fragment.normalize();
			fragment.load();
	}
	tildestar.DOM={}


	/**
	 * [tmpl description]
	 * @param  {[string,DOM element]} id, raw template string OR DOM element that is a result of a tmpl
	 * @param  {[object]} data object data to be added to template
	 * @param  {[function]} append function :used to append old data to new data
	 * @return {[type]}
	 */
	tildestar.tmpl=function $_tmpl(id,data,handlers){
		var func,html;

		if(typeof id == 'string'){//if it is a string see if we have it as a template
			func=tildestar.tmpl.templates[id];
			if(!func){ //if it does not exist in the hash then see if it will compile
				//TODO cache the compiled functions for later
				func=tildestar.tmpl.compile(id);
			}
		}else{ //it is an element
			var tmplData=tildestar.dataDash(id); //see if it exists already
			//alert(id[0].id+' '+JSON.stringify(tmplData))
			func=tmplData.tmpl;
			data = (handlers.dataAppend)?handlers.dataAppend(tmplData.data,data):data; //if we have an append function use it
			//alert('json'+JSON.stringify(data))
		}

		html=func(data);

		//create the dom elements by placing the text into .innerHTML of a hidden offscreen div
		var stage = tildestar.tmpl.stage
		stage.innerHTML=html;
		tildestar.dataDash(stage.children,{data:data,tmpl:func},undefined,false);	
		return $(stage.children).remove();
	}
	defaultTmplCompileOpts={ 'variable': 'data' };

	tildestar.tmpl.templates={}
	/**
	 * [compileTemplates by gettting them from HTML and turning them into in 
	 * memory precompiled underscore templates. they are expected to be script
	 * tags given the special type=text/underscore-tmpl ]
	 * idea from here
	 * http://stephenwalther.com/archive/2010/11/30/an-introduction-to-jquery-templates.aspx
	 * @return {[none]}
	 */
	tildestar.tmpl.compile=function(str){
		if(!str){ //if no string then this is initalize//precomile all the things!!!!
			//if(document.styleSheets && document.styleSheets[0] && document.styleSheets[0].addRule){
			//	document.styleSheets[0].addRule('.tmpl','display: none',-1)
			//}else{
				$('html > head').append($('<style>.tmpl{display:none;}</style>'));
			//}
			
			//make mustache
			var syntax = {
				mustache:{ //http://stackoverflow.com/questions/9002203/backbone-underscore-template-in-mustache-format-causing-error-on-pound-hash-sy
					evaluate:    /\{\{#([\s\S]+?)\}\}/g           // {{# console.log("blah") }}
					,interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g  // {{ title }}
					,escape:      /\{\{\{([\s\S]+?)\}\}\}/g          // {{{ title }}}
					}
				,erb:{
					evaluate: /<%([\s\S]+?)%>/g
					,interpolate: /<%=([\s\S]+?)%>/g
					,escape: /<%-([\s\S]+?)%>/g
					}
				};
			syntax['']=syntax.mustache;
			syntax['_']=syntax.erb;

			_.templateSettings =syntax.mustache;
			var tmplDiv = $('<div/>').attr('id','tmpl').css({display:'none',position:'absolute'});
			tildestar.tmpl.stage = tmplDiv[0];
			$(document.body).append(tmplDiv);

			var compileOpts=null; //{ 'variable': 'data' }//TODO get the data variable from the tag and fill out the variable var here

			//find them all in the HTML
			$('script[type="text/x-underscore-tmpl"]').each(function(){
				var elm = $(this)
				if(tildestar.tmpl.templates[elm.attr('id')]==undefined){//if they are not already compiled... compile :-D
					//set syntax
					var lang = elm.attr('data-syntax');
					lang = (lang)?lang.toLowerCase():'';
					var syn = syntax[lang]
					if(!(syn)){
						throw 'tildestar.tmpl.compile: error in script tag. We currently do not support syntax <script data-syntax="'+lang+'">'
					}

					var variable = elm.attr('data-variable'),compileOpts;
					if(variable){
						variable=variable.toLowerCase();
						compileOpts={'variable':variable};
					}else{
						compileOpts=defaultTmplCompileOpts
					}

					_.templateSettings=syn
					tildestar.tmpl.templates[elm.attr('id')]=_.template(elm.text(),null, compileOpts); //TODO add the variable data so that _ does not use with operator	
				}
			});
			_.templateSettings=syntax['_'];
		}else{

			return _.template(str);
		}
	}
	$(function(){tildestar.tmpl.compile();});//run as soon as the DOM is loaded



	//http://stackoverflow.com/questions/7439570/how-do-you-log-all-events-fired-by-an-element-in-jquery
	/*possible jquery extention?*/
	var getEventsList = function getEventsList(elem) {
	    var ev = [],events = elem.data('events');
	    for(var i in events) { ev.push(i); }
	    return ev.join(' ');
	}


	// http://stackoverflow.com/questions/743876/list-all-javascript-events-wired-up-on-a-page-using-jquery
	!(function($) {
	    $.eventReport = function(selector, root) {
	        var s = [];
	        $(selector || '*', root).andSelf().each(function() {
	            // the following line is the only change
	            var e = $._data(this, 'events');
	            console.log('e',e)
	            if(!e) return;
	            s.push(this.tagName);
	            if(this.id) s.push('#', this.id);
	            if(this.className) s.push('.', this.className.replace(/ +/g, '.'));
	            for(var p in e) {
	                var r = e[p],
	                    h = r.length - r.delegateCount;
	                if(h)
	                    s.push('\n', h, ' ', p, ' handler', h > 1 ? 's' : '');
	                if(r.delegateCount) {
	                    for(var q = 0; q < r.length; q++)
	                        if(r[q].selector) s.push('\n', p, ' for ', r[q].selector);
	                }
	            }
	            s.push('\n\n');
	        });
	        return s.join('');
	    }
	    $.fn.eventReport = function(selector) {
	        return $.eventReport(selector, this);
	    }
	})(jQuery);
	console.log($.eventReport($(window)))
	//http://stackoverflow.com/questions/743876/list-all-javascript-events-wired-up-on-a-page-using-jquery

//hold the state of media we are currently using
Stallion.State={};
Stallion.State.media=null;


	/**
	 * checks to see if all arguments are present
	 */ //TODO not finished
	Stallion.allAre=function(args,value,strict){
		var val=true;
		if(strict){
			for(var i=0, l=args.length,x;i<l;i++){
				if(!args.hasOwnProperty(x=args[i])){return;};
					if(x!=value){
						val = false
						return false;
					}
			}
		}else{
			for(var i=0, l=args.length,x;i<l;i++){
				if(!args.hasOwnProperty(x=args[i])){return;};
					if(x!==value){
						val = false
						return false;
					}
			}
		}
		return val
	}
//original inspiration - http://stackoverflow.com/questions/3099716/javascript-check-if-a-variable-is-the-window
//original by:zzzzbov - http://stackoverflow.com/users/497418/zzzzbov
	tildestar.isWindow=(function () {
	//private vars
    var wStr = Object.prototype.toString.call(window);
    return function $_isWindow(arg) {
        var e,
            str,
            self,
            hasSelf;
        //Safari returns DOMWindow
        //Chrome returns global
        //Firefox, Opera & IE9 return Window
        str = Object.prototype.toString.call(arg);
        if(wStr=='[object DOMWindow]'||
        	wStr=='[object Window]'||
        	wStr=='[object global]'){
            return arg===window;
        }

        ///window objects always have a `self` property;
        ///however, `arg.self == arg` could be fooled by:
        ///var o = {};
        ///o.self = o;
        if (arg.self) {
            //`'self' in arg` is true if
            //the property exists on the object _or_ the prototype
            //`arg.hasOwnProperty('self')` is true only if
            //the property exists on the object
            hasSelf = arg.hasOwnProperty('self');
            try {
                if (hasSelf) {
                    self = arg.self;
                }
                delete arg.self;
                if (hasSelf) {
                    arg.self = self;
                }
            } catch (e) {
                //IE 7&8 throw an error when window.self is deleted
                return true;
            }
        }
        return false;
    }
}());


Stallion.mixin=function(subject,inheritance){
	for(var key in inheritance){
		if(!inheritance.hasOwnProperty(key)){return;};
		subject[key]=_.bind(inheritance.key);
	}
	return subject;
}

	var dUID=0;
	/**
	 * [dataDash this is a way to associate a DOM element with data. Like $.data() except this should
	 *  theoretically be faster]
	 *  Pros: faster, and 100% accurate.
	 *  Side Effects: the element must have an ID or one will be imposed
	 *
	 *  Tech details: if the ID is changed after data is associated then the data will be disassociated
	 *  and cleaned up on the next "garbage collection"
	 *  
	 * @param  {[type]} elem   [description]
	 * @param  {[type]} data   [description]
	 * @param  {[type]} toJson [if true we will save the json parsed data to data-json]
	 * @return {[type]}        [description]
	 */
	tildestar.dataDash=function(elem,data,nameSpace,toJson){
		//check to see if it is a constructor
		if(!elem){
			if(Stallion.allAre(arguments,undefined,'strict')){//as long as all values are undefined then
				if( !(this instanceof tildestar.dataDash) ){return new tildestar.dataDash();}; //if they used the new operator then don't do this
				//constructor logic
				
			}
			return;
		}

		//if new is not called and it is a function then this should set var 'self' to an object
		//console.log(this)
		//alert('isWindow= '+tildestar.isWindow(this)+'\n'+Object.prototype.toString.call(this)+'=='+Object.prototype.toString.call(window))
		//alert(this==document.body.innerHTML)
		
		var self = (this==tildestar||tildestar.isWindow(this))
			?window.tildestar.dataDash
			:this;


		//was not a constructor use as function
		console.log('getting data associated',elem)
		console.log('setting data',data)

		if(elem instanceof jQuery){
			elem = elem.get();
		}

		if(data==undefined){//get data
			var id;
			if(elem.length == 1){
				elem=elem.pop();
			}else if (elem.length>1){
				alert('YOU SHOULD NOT SEE THIS@!')
				console.warn('check dis',elem)

				var datas=[];
				for(var x=null, i=0,l=elem.length;i<l;i++){
					x=elem[i];
					id=(typeof x == "string")?x:x.id;

					datas.push( 
						(nameSpace)?self.data[id][nameSpace]:self.data[id]
						||
						(nameSpace)?self.data[id][nameSpace]={}:self.data[id]={}
						);
				}
				return datas;
			}

			id =(typeof elem == "string")?elem:elem.id;
			var ans = (nameSpace)?self.data[id][nameSpace]:self.data[id];
			if(ans){
				return ans;
			}
			return (nameSpace)?self.data[id][nameSpace]={}:self.data[id]={} ;
			
		}

		if(!elem.length){//make array if not
			elem=[elem];
		}
		//set data
		for(var x=null, i=0,l=elem.length;i<l;i++){
			var x=elem[i];
			var id = x.id;

			//a side effect of this script is that it will force the element to have an ID if it does not
			//do{
				if(!id){
					id=self.prefix+dUID++;	//TODO make random if we have a collision
					if(self.data[id]){ //if it is already in the data then we have a collision :-/
						console.error('dataDash collision on id',id,'with element ',x,' and data ',data) ;
					}
				}

				//query the DOM to see if it exists
			//}while()  //document.getElementById(id))
			x.id=id; //this is unique; so set it.
			
			//check that is only used to make sure the x does not exist in the data
			//keeps recursive memory leaks from happinging
			/*if(!surpassChecks || !self.surpassChecks){
				//check for circular ref and turn to JSON string
				Stallion.recursive(data,function(pwd){
					if(pwd.value===x){
						throw 'You may not save a recursive structure to dataDash. If you wish to override this please set self.surpassChecks=true';
						return false;
					}
				});
			}*/

			//set a data-json attribute
			if(toJson){
				var json = JSON.stringify(data);
				if(x.dataset){
					x.dataset['json'] =	json;
				}else{
					x.setAttribute('data-json',json);
				}
			}

			//add the data to the bank;
			var d = self.data;
			if(!d[id]){
				d[id]={};
			}

			if(nameSpace){
				d[id][nameSpace]=data;
			}else{
				d[id]=data;
			}

			//set the data on the DOM element
			/*if(!x._){
				x._={};
			}
			x._.dataDash=data;*/
		}
		return data;
	}
	tildestar.dataDash.prototype.surpassChecks=false;
	tildestar.dataDash.prototype.data={};
	tildestar.dataDash.prototype.prefix='UID:';
	tildestar.dataDash.prototype.clean=function(){
			var data = (this==tildestar||tildestar.isWindow(this))
			?window.tildestar.dataDash.data
			:this.data;
		for(var key in data){
			if(!data.hasOwnProperty(key)){continue};
			!document.getElementByID(key) && delete data[key];
		}
	}

	Stallion.mixin(tildestar.dataDash,tildestar.dataDash.prototype);


	var bindWrapper=function(bind){
			var modal=$(this).closest('.modal');
			if(bind){
				if(bind()===false){
					return;
				}
				modal.modal('hide');
			}
			console.warn('no action associated with ',modal)
		};

	var modalUID=0;
	/**
	 * Create a a modal window. Currently uses bootstrap.js
	 * @param  {[jQuery DOM or string]} title [title text]
	 * @param  {[DOM, jQuery or string]} body   [the main part of this modal]
	 * @param  {[object]} choice [object of functions to do for ok,cancel,close if they return false then the modal does not hide]
	 * @param  {[object]} opts   [options object. property "modal" is sent to the .modal() method in Bootstrap. property "class" is the class name given to the modal]
	 * @return {[jQuery]}        [returns jQuery modal DOM object]
	 */
	tildestar.modal=function(title,body,choice,opts){
		//choice=(choice)
		//	?$.extend(true,choice,tildestar.modal.defaults.choice)
		//	:{}; //if it was given choices extend them otherwise return regular object
		if(!choice){
			choice={};
		}

		if(title.indexOf && title.indexOf("Modal:")==0){
			tildestar.modal.toggle(title,body);
		}
		if($.type(title)=='string'){
			title=$('<h3>').text(title)
		}
		var UID = modalUID++;
		
		var footer = $('<div/>').addClass('modal-footer')
		
		var closeX;
		if(choice.close===undefined){
			closeX=$('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>');
		}else{
			closeX=$('<button type="button" class="close" aria-hidden="true">×</button>').click(_.partial(bindWrapper,(choice.close===false)?choice.cancel:choice.close))//data-dismiss="modal" aria-hidden="true"
		}

		if(choice.cancel){
			footer.append($('<button class="btn">Cancel</button>').click(_.partial(bindWrapper,choice.cancel)))//data-dismiss="modal" aria-hidden="true"
		}
		if(choice.ok){
			footer.append($('<button class="btn btn-primary">OK</button>').click(_.partial(bindWrapper,choice.ok)))
		}

		var modal=$('<div/>').attr({id:'Modal:'+UID,tabindex:-1,role:'dialog'}).addClass('modal hide fade')
				modal.append($('<div/>').addClass('modal-header')
						.append(closeX)
						.append(title)
				).append($('<div/>').addClass('modal-body').html(body)
				).append(footer)

		$(document.body).append(modal.modal(opts.modal));
		if(opts){
			if(opts['class']){
				modal.addClass(opts['class']);
			}
		}

		return modal;
	}
	tildestar.modal.toggle=function(id,show){
		var elem=$('#'+id)
		if(show){
			elem.show()
		}else if(show===false){
			elem.hide()
		}else{
			elem.toggle()
		}
		return elem
	}
	tildestar.modal.defaults={};
	tildestar.modal.defaults.choice={
		ok:bindWrapper,
		cancel:bindWrapper
	}

	window.tildestar=tildestar;
})(window,document,undefined,jQuery)


$(function(){ //Document Ready
	var debug=Stallion.debug || window.debug;

	//screen protection
	
	var keyboard = Stallion.keyboard;
	//add Global keybinds
	$(document).keydown(function(e){
		var code=e.which;
		var func=keyboard.binds[code];
		debug && console.log('stallion keyhook',code,keyboard.mapToString[code],e);
		if (func){
			var done = func(e);
			return (done===undefined)?true:done;
		}
		return true;
	});

//http://jsperf.com/jquery-element-creationyay/3
//Stallion.DOM=function(name) { return $(document.createElement(name)); }
//var HTML
Stallion.mediaChangeListener=new (function(){
	//Media Query event emmiter
	//this listens to an element that has a ul where each element will
	//hide given an apporpreate view width (from bootstrap)
	//it then emits a mediaChange event though jquery.trigger
	//if the media has changed.
	var body = $(document.body);
	var respondUtilTest = $(".responsive-utilities-test");	
	var currentMedia = null;
	var currentOrientation = null;

	var mediaClassMap = {desktop:'desktop no-tablet no-phone'
						,tablet:'no-desktop tablet no-phone'
						,phone:'no-desktop no-tablet phone'
						,landscape:'landscape'
						,portrait:'portrait'}
	var mediaQuery=function(){
		var newMedia=respondUtilTest.children(':visible').attr('name');
		if(currentMedia!=newMedia){
			debug && console.log('mediaChange',currentMedia,newMedia);
			var data = {from:currentMedia,to:newMedia};
			Stallion.event('mediaChange',data);
			Stallion.State.media=newMedia;
			body.removeClass(mediaClassMap[currentMedia]).addClass(mediaClassMap[newMedia])
			currentMedia=newMedia;
		}
		return newMedia;
	};
	//set the state and go ahead and fire the first event
	Stallion.State.media=mediaQuery();
	//once the doc is read lets add a resize listener
	$(document).ready(function() {
		$(window).resize(mediaQuery);
	})

	this.addHandler=function(func){
		$(document).on('mediaChange',func);
		return this;
	}

	this.start=function(){
		mediaQuery();
		return this;
	}
	
});

		tildestar.uri.consumeFragment();
	})



//detect copy and paste events
//http://www.mkyong.com/jquery/how-to-detect-copy-paste-and-cut-behavior-with-jquery/