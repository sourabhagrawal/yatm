$(function($){
	
	var Task = Backbone.Model.extend({
		defaults : function(){
			return {
				text : 'A new task',
				done : false,
				order : tasks.nextOrder()
			};
		},
		
		clear : function(){
			this.destroy();
		},
		
		toggle : function(){
			this.save({done : !this.get('done')});
		}
	});
	
	var TaskList = Backbone.Collection.extend({
		model : Task,
		localStorage : new Store("tasks-backbone"),
		nextOrder : function(){
			if(this.length == 0) return 1;
			return this.last().get('order') + 1;
		},
		done : function(){
			return this.filter(function(task){return task.get('done');});
		},
		pending : function(){
			return this.without.apply(this, this.done());
		}
	});
	
	var tasks = new TaskList;
	
	var TaskView = Backbone.View.extend({
		tagName : "li",
		
		taskTemplate : _.template($('#task-template').html()),
		
		events : {
			"click .close" : "destroy",
			"click .toggle" : "toggleTask",
			"dblclick .checkbox" : "edit",
			"blur .edit" : "revert",
			"keypress .edit" : "save"
		},
		
		initialize : function(){
			this.model.bind('destroy', this.remove, this);
			this.model.bind('change', this.change, this);
		},
		
		render : function(){
			this.$el.html(this.taskTemplate(this.model.toJSON()));
			this.$el.toggleClass('done', this.model.get('done'));
			return this;
		},
		
		destroy : function(){
			this.model.clear();
		},
		
		toggleTask : function(){
			this.model.toggle();
		},
		
		change : function(){
			this.$el.html(this.taskTemplate(this.model.toJSON()));
			this.$el.toggleClass('done', this.model.get('done'));
		},
		
		edit : function(){
			this.$el.addClass("editing");
			this.$('.edit').focus();
		},
		
		revert : function(){
			this.$el.removeClass("editing");
		},
		
		save : function(e){
			if (e.keyCode != 13) return;
			var value = this.$('.edit').val();
		    if (!value) this.destroy();
		    this.model.save({text: value});
		    this.$el.removeClass("editing");
		}
	});
	
	var AppView = Backbone.View.extend({
		el : $("body"),
		
		statusTemplate : _.template($('#status-template').html()),
		
		events : {
			"keypress #task-input" : "save",
			"click #mark-all" : "toggleAllDone",
			"click #clear-all" : "clearAllDone"
		},
		
		initialize : function(){
			this.input = this.$('#task-input');
			this.markAllCheckBox = this.$('#mark-all')[0];
			this.clearAllButton = this.$('#clear-all');
			this.status = this.$('#status');
			
			tasks.bind('add', this.add, this);
			tasks.bind('reset', this.addAll, this);
			tasks.bind('all', this.render, this);
			
			tasks.fetch();
		},
		
		render : function(){
			this.status.html(this.statusTemplate({
				done : tasks.done().length,
				pending : tasks.pending().length
			}));
		},
		
		add : function(task){
			var view = new TaskView({model : task});
			this.$('#task-list').append(view.render().el);
		},
		
		addAll : function(){
			tasks.each(this.add);
		},
		
		save : function(e){
			if(e.keyCode != 13) return;
			if(this.input.val() == undefined) return;
			
			tasks.create({text : this.input.val()});
			
			this.input.val('');
		},
		
		toggleAllDone : function(e){
			var done = this.markAllCheckBox.checked;
			tasks.each(function(task){task.save({done : done});});
		},
		
		clearAllDone : function(e){
			_.each(tasks.done(), function(task){task.clear();});
		}
	});

	var app = new AppView;
});
