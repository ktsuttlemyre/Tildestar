// Avoid `console` errors in browsers that lack a console.
(function() {
	var method;
	var noop = function () {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
}());

// Place any jQuery/helper plugins in here.
jQuery.fn.exists = function(passThrough){
	if(passThrough==true){
		return (this.length)?this:undefined;
	}
	return (this.length)?true:false;
}
//see if obj is jquery object
jQuery.isjQuery=function(obj){
	return (obj instanceof jQuery);
}
jQuery.i$=jQuery.isjQuery;

//http://stackoverflow.com/questions/3176962/jquery-object-equality
$.fn.equals = function(compareTo,scope) {
	var l=this.length;

	//check length; if they are not the same then not a match
	if (!compareTo || l != compareTo.length) { //fail fast
		return false;
	}

	//if it is exact copy
	if($.data( this ) == $.data( compareTo )){
		return true;
	}

	// idk if I trust this code yet
	//if(this.selector === compareTo.selector && this.context === compareTo.context){
	//	return true;
	//}

	for (var i = 0; i < l; ++i) {
		if(this[i] === compareTo[i]){ //assuming the array is the same this might be faster
			continue;
		}
		for (var j = 0; j < l; ++j) { //it may be in a different order
			if ( i==j || this[i] === compareTo[j]) {
				continue;
			}
		}
		return false;
	}
	return true;
};

//https://groups.google.com/forum/?fromgroups=#!topic/jquery-en/FQ1Jk6qWa_0
//http://jquery.lukelutman.com/plugins/px/jquery.px.js
//which you can call like so:

// $('#example').px('font-size');

// One known bug is that it won't work for elements that don't accept 
// content, like <img /> or <input />.
(function($){
     
    var $px = $(document.createElement('div')).css({
        position: 'absolute'
    });
 
    $.fn.px = function(prop) {
        var val;
        if($.browser.msie) {                        
            $px
            .clone()
            .css('width', this.css(prop))
            .appendTo(this[0])
            .each(function(){
                val = $(this).width() + 'px';
            })
            .remove();
        } else {
            val = this.css(prop);
        }
        return val;
    };
 
})(jQuery);

/*
* FillText.js v 0.5
*
* Copyright 2013, Kyle Suttlemyre
*
*
NON-EXCLUSIVE COPYRIGHT LICENSE
The creator (Kyle Suttlemyre), hereby grants you a non-exclusive, royalty-free, revocable license to
(1) reproduce, (2) display publicly, (3) modify or incorporate, in whole or in part, into any project,
service or publication, and/or (4) distribute by any medium; the copyrightable material included below,
as may be amended from time to time.

This permission is subject to the following conditions:

1. You agree to recognize the original creator(s) in distributed source and
published in credits or list of authors.

2. This Agreement is effective immediately and will last indefinitely from the
date of publish. You may terminate this agreement at any time and without notice
to the creator by stopping all use of the Licensed Information.

3. The Copyright Owner retains all other rights in the copyright work, including
without limitation, the right to copy, distribute, publish, display or modify 
the copyright work, and to transfer, assign or grant license of any such rights 

You agree to these conditions by including the source into any of your products or 
services

Original inspiration for this work originated from
FitText.js 1.1 by Dave Rupert http://daverupert.com
*/

!(function( $ ){
var debug = false;

var isEditable=function(e){
			var editable = e.attr('contenteditable');
			if(editable=='false'){editable=false;}; //normalization of undefined and "true"
			///*toggle*/ editable=!editable;
			return editable;
}


//This must be done because css changes are somtimes batched
var pollingDefer= function (func,opts) {
	if(!opts.laggingLayout){
		return func();
	}
	//opts.e.css('font-size',"2px");
	
	//var textAlign = opts.widthRef.e.css('text-align');
	//opts.widthRef.css('text-align','left');
	//console.log('doodie',opts.e,opts.e.css('font-size'))
	var parent = opts.widthRef;
	var initWidth = parent.width();
	var counter=0;
	var max = 10;
	var id=setInterval(function() { 
		if(counter==0){//first run
			func.apply(undefined, []); //sometimes the first run causes a repain/reflow?
			//more info http://stackoverflow.com/a/6956049
			//http://functionsource.com/post/dont-be-trigger-happy-how-to-not-trigger-layout
		}
		if(initWidth!=parent.width()){
			func.apply(undefined, []); 
			console.log('counter',counter)
			clearInterval(id);
			return;
		}
		if(counter++ >= max){
			console.log('counter',counter)
			clearInterval(id);
		}
	}, 20);//seems as if chrome debounces somewhere between 100 and 40ms
}

	var defaultOptions = {
		global:{
			'min-font-size'	: 2
			,'max-font-size': Number.POSITIVE_INFINITY
			,'min-width'	: Number.NEGATIVE_INFINITY
			,'max-width'	: Number.POSITIVE_INFINITY
			,rateTech 		: 'throttle'
			,rateTechTime 	: 100
			,laggingLayout	: false
			,editable		: false
			,onEditComplete	: false
		}
		,user:null

	}

	//allow users to set the options from $.fluidtext();
	$.fluidtext=function(options){
		$(window).fluidtext('options',options);
		return options;
	};

	var UID = -1;
	$.fn.fluidtext = function( ratio, options ) {
		//normalize to lowercase; if string
		if($.type(ratio)=='string'){
			ratio = ratio.toLowerCase();

			//if we are trying to trigger a resize or resample do it here and close out;
			if(ratio == 'resample'|| ratio == 'resize'){
				return this.each(function(){
					var e = $(this)
					if(e.hasClass('fluidtext')){
						e.trigger($.Event(ratio+'.fluidtext'));
					}else{
						e.find('.fluidtext').fluidtext('resize').end();
					}
				});
			}
			if(ratio=='delete'||ratio=="remove"){
				return this.remove();
			}

			if(ratio == 'options'){//if the first argument is 'options' then set the global options with the next param
				if(options.rateTech){ //check the rate tech to make sure it is legit
					var param =options.rateTech.toLowerCase()
					if(['throttle','debounce','none'].indexOf(param)==-1){
						console.error('FluidText: The parameter '+options.rateTech+'is not acceptable');
					}else{
						options.rateTech=param;
					}
				}
				defaultOptions.user = $.extend(true,{},defaultOptions.global,options)
				return this;
			}

		}

		// Setup options
		var o = $.extend(true, {}, (defaultOptions.user || defaultOptions.global), options);


	return this.each(function(){
		var  e = $(this),fontSize,fluid,width,widthRef;
		var opts = $.extend(true, {}, o); //clone
		var r = ratio;
		var ratioRef = (r=='parent')?'parent':(r=='fluid')?'fluid':null;

		
		//keeps the text from falling out of it's container
		e.css('line-height','normal').addClass('fluidtext');

		var init = function(event){
		// Store the object
		fontSize = parseFloat(e.css("font-size").replace('px',''));
		
		//make sure fluid works by changing it to inline-block to get the width then back to original
		if(ratioRef=='fluid'){
			var tmp = e.css('display');
			width = e.css('display','inline-block').width();
			//alert(e.px('font-size'))
			//if(e.px('font-size')<=0){
				//e.css('font-size','1px')
			//}
			e.css('display',tmp);
		}else{
			width=e.width();
		}

		widthRef = (ratioRef)?e.parent():e;
		r = (!ratioRef)?parseFloat(r)*parseFloat(10):(parseFloat(width)/parseFloat(fontSize));
			// console.warn('init',e.css('display'),e.width(),r,widthRef.width());
			
			//set all properties to an object so they are passed by ref
			opts.e=e
			,opts.widthRef=widthRef
			,opts.r=r
			,opts.ratioRef=ratioRef
			//,opts['max-font-size']=max
			//,opts['min-font-size']=min;
			//console.log('opts',opts)

		}
		init();
		
	//console.log(args[0],fluid,r,width,widthRef.width(),fontSize)
	// Resizer() resizes items based on the object width divided by the r * 10
	var resizer = function (opts) {
		//var width = (r=='parent')?e.parentNode.offsetWidth:e.offsetWidth;
		return function(){//console.warn('resize',opts.e.css('display'),opts.e.width(),opts.r,opts.widthRef.width());
			//constrain requested width
			var width = opts.widthRef.width();

	


			//alert(e.text())
			var widthExtreme = opts['max-width']; 
			if(widthExtreme <= width){
				width=widthExtreme;
			}else if( (widthExtreme=opts['min-width']) >= width || isNaN(width)){
				width=widthExtreme;
			}
			
			//calculate
			var fontSize = Math.floor(parseFloat(width) / opts.r);


			//constrain max-font-size
			var sizeExtreme=opts['max-font-size'];
			if(sizeExtreme<=1){
				sizeExtreme=opts.widthRef.height()*sizeExtreme;
			}

			if(sizeExtreme <= fontSize){
				fontSize=sizeExtreme;
			}else if((sizeExtreme=opts['min-font-size']) >= fontSize || isNaN(fontSize)){
				fontSize=sizeExtreme;
			}
			
			debug && console.log('resizing','parent width',opts.widthRef,opts.widthRef.width(),'chosen',width,'calc font size',Math.floor(parseFloat(width) / opts.r),'chosen',fontSize)
			//set font-size css
			opts.e.css('font-size',fontSize+"px");
			}}(opts)
	
	// Call once to set.
	pollingDefer(resizer,opts);
	
	//if there is a throttle lib then use it
	var resizerThrottled=resizer;
	if(opts.rateTech!='none'){
		if(_ &&_[opts.rateTech]){
			resizerThrottled=_[opts.rateTech](resizer,opts.rateTecTime);
		}else if($.throttle) {
			// https://github.com/cowboy/jquery-throttle-debounce
			resizerThrottled=$.throttle(opts.rateTecTime, resizeFunction);
		}
		// Call on resize. Opera debounces their resize by default. 
	}
	$(window).on('resize', resizerThrottled);


	var id = UID++;
		




	e.bind('resample.fluidtext'/*+(id++)*/, function(event) {
		init(event);
		pollingDefer(resizer,opts);
	});

	e.bind('resize.fluidtext'/*+(id++)*/, function(event) {
		pollingDefer(resizer,opts);
	});

	e.bind("input.fluidtext",function(e){
		console.log(e)
		init(e)
		resizer()
	})
	//document.getElementById("editor").addEventListener("input", function() {
    //alert("input event fired");
	//}, false);
	


	var resample=function(){e.trigger($.Event('resample.fluidtext'));};
	/*read 'copy',*/
	var eventTriggers = {allowed:/*write*/ 'cut focus keypress input textInput DOMNodeInserted',
						blocked:'drop paste'};

	//add the editable function only when clicked
	if(opts.editable){
		//e.attr('contenteditable',true);
		// e.click(function(){
		// 	console.log('editing on')
		// 	if(!isEditable(e)){
		// 		e.attr('contenteditable',true);
		// 		//e.css('postion','relative').append($('<span/>').addClass('close-circle'));
		// 		e.on(eventTriggers.allowed,resample)
		// 		e.on(eventTriggers.blocked,false)
		// 		_.defer(resample); //go ahead and sample
		// 		return false;
		// 	}
		// }).blur(function(){
		// 	if(isEditable(e)){
		// 		console.log('editing off')
		// 		e.attr('contenteditable',false);
		// 		e.off(eventTriggers.allowed,resample);
		// 		e.off(eventTriggers.blocked,false);
		// 		opts.onEditComplete && opts.onEditComplete.call(e[0],_.escape(e.html().replace(/<\/div>/g,"").replace(/<div>/g,"\n").replace(/<br\s*[\/]?>/gi, "\n")));
		// 		_.defer(resample); //go ahead and sample
		// 	}
		// });
	}
	
	//for debuging
	//e.click(function(){
	//	e.trigger($.Event('resize.fluidtext'));
	//})
	
	
		

		
	});
  }
	//on document Load handle data tags
	$(function(){
		$('[data-fluidtext]').each(function(){
			console.log('found')
			//parse arguments
			var argOrder =[/*'ratio',*/'min-font-size','max-font-size','min-width','max-width']
			,e= $(this)
			,args = (e.attr('data-fluidtext') || "fluid").split(" ")
			,ratio = args.shift()
			,o = {}; 

			//fill out the temp options object with the args
			$.each(args,function(index,value){
				o[argOrder[index]]=value;
			})

			//call FluidText as typical
			e.fluidtext(ratio,o);
		})
	});
})( jQuery );

//<div style="width:50%; height:500px; background-color:lightblue; padding:10px 20px 10px 10px; position:relative">
//    <!--<div data-fittext='parent' style='display:inline-block;'>Fidsdfasdfasdfasdffffffffffffffffffffffffffffffext</div>-->
//    <span data-fittext='parent' style='display:inline-block;background-color:antiquewhite;'>FitText</span>
//    <div data-fittext='.31' style='display:block;background-color:lightgreen'>FitText</div>
//    <div data-fittext='parent' style='display:block;background-color:lightgreen'>FitText</div>
//    <div data-fittext='fill' style='display:block;background-color:lightgreen'>FitText</div>
//    <!--<div data-fittext='0.191'>Test</div>-->
//    <div style="margin:0px auto;">just text</div>
//</div>

//usage "comressor minFontSize maxFontSize"
//<div data-fittext='0.3 1 47'>FitText</div>
//<div data-fittext='0.191'>Test</div>
//function(){
	/*if($){
		$('[data-fittext]').each(function(){
			var t = $(this)
			if($().fitText){
				t.fitText.apply(t,t.attr('data-fittext').split(" "));
			}
		})
		return;
	}*/


	
//}(jQuery)


//$("div:eq(0)").fitText(0.3);
//$("div:eq(1)").fitText(0.191);

/* attempted to add auto calculation of compressor to java native but found out that
offsetWidth is not consistant
console.log('======================doin')

//http://stackoverflow.com/questions/5265089/getting-the-calculated-font-size-of-a-div
function elementCurrentStyle(element, styleName){
	if (element.currentStyle){
		var i = 0, temp = "", changeCase = false;
		for (i = 0; i < styleName.length; i++)
			if (styleName[i] != '-'){
				temp += (changeCase ? styleName[i].toUpperCase() : styleName[i]);
				changeCase = false;
			} else {
				changeCase = true;
			}
		styleName = temp;
		return element.currentStyle[styleName];
	} else {
		return getComputedStyle(element, null).getPropertyValue(styleName);
	}
}


//usage "comressor minFontSize maxFontSize"
//<div data-fittext='0.3 1 47'>FitText</div>
//<div data-fittext='0.191'>Test</div>
//function(){
	// if($){
	//     $('[data-fittext]').each(function(){
	//         var t = $(this)
	//         if($().fitText){
	//             t.fitText.apply(t,t.attr('data-fittext').split(" "));
	//         }
	//     })
	//     return;
	// }
	var txts = document.querySelectorAll('[data-fittext]');
	var getData = function(e,v){
		return (e.dataset)?e.dataset[v]:e.getAttribute('data-' +v );
	}
	 
	for(var i=0,l=txts.length;i<l;i++){
		// Store the object
		var e = txts[i];
		var args = (getData(e,'fittext') || "1").split(" ");
		var widthNode = (args[0]=='parent')?e.parentNode:e;
		var fontSize =parseFloat(elementCurrentStyle(e,"font-size").replace('px',''));
		//if(args[0]=='parent'){
		//e.parentNode.style.backgroundColor="red";
		//}
			opts = {
				compressor : .3,//(args[0]=='parent')?parseFloat(e.offsetWidth)/parseFloat(e.parentNode.offsetWidth):parseFloat(args[0]),
				//compressor : (args[0]=='parent')?parseFloat((e.offsetWidth*fontSize)/Math.pow(e.parentNode.offsetWidth,2)):parseFloat(args[0]),
				minFontSize : parseFloat( (args[1] || Number.NEGATIVE_INFINITY) ),
				maxFontSize : parseFloat( (args[2] || Number.POSITIVE_INFINITY) )
			};
	var fix = 1//parseFloat(((args[0]=='parent')?2:1))
	console.log('compressor',e,opts.compressor,fontSize,fix)
	// Resizer() resizes items based on the object width divided by the compressor * 10
	var resizer = function (e,widthNode,opts,fix) {
		//var width = (compressor=='parent')?e.parentNode.offsetWidth:e.offsetWidth;
		return function(){console.warn(widthNode.offsetWidth);e.style.fontSize=(Math.max(Math.min( parseFloat(widthNode.offsetWidth) / (opts.compressor*10), opts.maxFontSize), opts.minFontSize)/fix)+"px";}
	}(e,widthNode,opts,fix)
	
	// Call once to set.
	resizer();
	
	// Call on resize. Opera debounces their resize by default. 
	if (window.addEventListener){
		window.addEventListener('resize', resizer, false); 
	// IE 8 and under
	} else if (window.attachEvent){
		window.attachEvent('resize', resizer);
	}
	}
//}(jQuery)


//$("div:eq(0)").fitText(0.3);
//$("div:eq(1)").fitText(0.191);
*/




// The following is adapted from...

/*
 * TypeHelpers version 1.0
 * Zoltan Hawryluk, Nov 24 2009.  
 * 
 * Released under the MIT License. http://www.opensource.org/licenses/mit-license.php
 *http://wellcaffeinated.net/articles/2012/01/25/font-smoothing-detection-modernizr-style/
 *  example CSS
 *
#statusMsg {
    font-size: 18px;
    padding: 1em;
}
.no-fontsmoothing #statusMsg {
    font-family: arial;
}

.fontsmoothing #statusMsg {
    font-family: 'Spirax', cursive;
}
 */
 
Modernizr.addTest('fontsmoothing', function() {
    // IE has screen.fontSmoothingEnabled - sweet!      
    if (typeof(screen.fontSmoothingEnabled) != "undefined") {
        return screen.fontSmoothingEnabled;
    } else {

        try {

            // Create a 35x35 Canvas block.
            var canvasNode = document.createElement("canvas")
              , test = false
              , fake = false
              , root = document.body || (function () {
                    fake = true;
                    return document.documentElement.appendChild(document.createElement('body'));
              }());
            
            canvasNode.width = "35";
            canvasNode.height = "35"

            // We must put this node into the body, otherwise 
            // Safari Windows does not report correctly.
            canvasNode.style.display = "none";
            root.appendChild(canvasNode);
            var ctx = canvasNode.getContext("2d");

            // draw a black letter "O", 32px Arial.
            ctx.textBaseline = "top";
            ctx.font = "32px Arial";
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";

            ctx.fillText("O", 0, 0);

            // start at (8,1) and search the canvas from left to right,
            // top to bottom to see if we can find a non-black pixel.  If
            // so we return true.
            for (var j = 8; j <= 32; j++) {
                for (var i = 1; i <= 32; i++) {
                    var imageData = ctx.getImageData(i, j, 1, 1).data;
                    var alpha = imageData[3];

                    if (alpha != 255 && alpha != 0) {
                        test = true; // font-smoothing must be on.
                        break;
                    }
                }
            }
            
            //clean up
            root.removeChild(canvasNode);
            if (fake) {
                document.documentElement.removeChild(root);
            }
            
            return test;
        }
        catch (ex) {
            root.removeChild(canvasNode);
            if (fake) {
                document.documentElement.removeChild(root);
            }
            // Something went wrong (for example, Opera cannot use the
            // canvas fillText() method.  Return false.
            return false;
        }
    }
});

$(function(){
    $('#statusMsg').html("Your computer "+ 
        (Modernizr.fontsmoothing? "has": "does not have")+
        " font smoothing enabled.");
});


//http://stackoverflow.com/questions/4652468/is-there-a-javascript-function-that-reduces-a-fraction
// Reduce a fraction by finding the Greatest Common Divisor and dividing by it.
function reduce(numerator,denominator){
	if (isNaN(numerator) || isNaN(denominator)){return NaN};
	var gcd = function gcd(a,b){
	return b ? gcd(b, a%b) : a;
	};
	gcd = gcd(numerator,denominator);
return [numerator/gcd, denominator/gcd];
}

function calculateAspect(width,height,constrain,percent){
	var ans = 0;
	constrain=constrain.toLowerCase()
	if(constrain=='height'){
		ans= 100/(height/width) 
	}else{
		ans= 100/(width/height) 
	}
	return (percent)? ans.toFixed(2)+'%':ans;
}


/*
Dell Latitude:
	Core: Single 32 bit 
		Intel Pentium Mobile 1.6
		Cache 512KB
		MHz 1200
	HardDrive: 17.4 gb
	RAM: 1gb
	CD read/write drive
	Includes: docking station and power cord


Gateway Touch screen Tablet/Laptop:
	Core: Single 32 bit 
		Intel Pentium Mobile 1.5
		Cache 1024kb
		MHz 1500
	HardDrive: 39.4 gb
	RAM: .5gb
	DVD read drive
	Includes: power cord stylus*/

//inspiration
//http://stackoverflow.com/questions/1227286/get-class-list-for-element-with-jquery
//By user: ripper234 - http://stackoverflow.com/users/11236/ripper234
	$.fn.classList = function() {
		var t = this[0]
		if(!t){
			return [];
		}
		if(t.classList){
			return t.classList;
		}
		return t.className.split(/\s+/);
	};
//insparation
//http://stackoverflow.com/questions/324486/how-do-you-read-css-rule-values-with-javascript
//by user: insdel - http://stackoverflow.com/users/40807/insdel
function getStyle(className) {
	for(var i=0,l=document.styleSheets.length;i<l;i++){
		var s = document.styleSheets[i]
		var classes = s[0].rules || s[0].cssRules
		for(var j=0,k=classes.length;j<k;j++) {
			if(classes[j].selectorText==className) {
				return (classes[j].cssText) ? classes[j].cssText : classes[j].style.cssText;
			}
		}
	}
}
//example use
//getStyle('.test')