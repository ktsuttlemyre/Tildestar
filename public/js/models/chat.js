 //http://adrianmejia.com/blog/2012/09/11/backbone-dot-js-for-absolute-beginners-getting-started/
$(function(){

  var tmpl = tildestar.tmpl;

  var chatMain = $('#chat-left').append(tmpl('tmpl-chat-main',{id:'chat-main'}).addClass('fill-height position-relative'))
  var parentID='chat-sideBar';
  var $accordion =$('#chat-right').append(tmpl('tmpl-accordion',{id:parentID,innerHTML:''}))
  .append(tmpl('tmpl-accordion-group',{'parentID':parentID,id:'friends-list',innerHTML:'<div class="itemList"><ul></ul></div>',title:'Friends'}))
  .append(tmpl('tmpl-accordion-group',{'parentID':parentID,id:'chat-clients',innerHTML:'<div class="itemList"><ul></ul></div>',title:'Chatters'}).find('.accordion-body').addClass('in').end())
  .append(tmpl('tmpl-accordion-group',{'parentID':parentID,id:'chat-rooms',innerHTML:'<div class="itemList"><ul></ul></div>',title:'Rooms'}));

})

if(tildestar.chat==undefined){
  tildestar.chat={};
}
    tildestar.chat.room = Backbone.Model.extend({
      defaults: {
        title: '',
        completed: false
      }
    });

var ChatView = Backbone.View.extend({
      el: $('#container'),
      // template which has the placeholder 'who' to be substitute later 
      template: _.template("<h3>Hello <%= who %><h3>"),
      initialize: function(){
        this.render();
      },
      render: function(){
        // render the function using substituting the varible 'who' for 'world!'. 
        this.$el.html(this.template({who: 'world!'}));
        //***Try putting your name instead of world.
      }
    });

    var chatView = new ChatView();


