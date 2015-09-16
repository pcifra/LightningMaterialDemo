/**
 * Helper for the ToDoAppHelper Lightning component. Functions defined here are used to
 * perform work for the application and track some state.
 **/
({
  readyState: 0, // 0: initial, 1: configured, 2: loading, 3: loaded
  needsInit: {},

  /**
   * Executed as part of the requirejs script loading process.  It configures and loads
   * the third party dependencies required by the application.
   **/
  initScripts: function(component) {
    var self = this;

    // If readyState is 3, do nothing
    if (this.readyState === 3) {
      // Set things up using the helper
      self.initHandlers(component, event);
      return;
    }

    self.needsInit[component.getGlobalId()] = component;

    // If requirejs hasn't been loaded, do nothing
    if (typeof requirejs === "undefined") {
      return;
    }

    // Initial readyState, configure requirejs
    if (self.readyState === 0) {
      requirejs.config({
        baseUrl: "/resource/",
        paths: {
          jquery: "/resource/jquery/jquery",
          angular: "/resource/angular/angular",
          angularAnimate: "/resource/angularanimate/angular-animate",
          angularStrap: "/resource/angularstrap/dist/angular-strap",
          angularStrapTpls: "/resource/angularstrap/dist/angular-strap.tpl",
          angularAria: "/resource/AngularMaterial/dist/angular-aria/angular-aria",
          angularMaterial: "/resource/AngularMaterial/dist/angular-material/angular-material"
        },
        shim: {
          angular: {deps: ["jquery"]},
          angularAnimate: {deps: ["angular"]},
          angularStrap: {deps: ["angular"]},
          angularStrapTpls: {deps: ["angularStrap"]},
          angularMaterial: {deps:["angular", "angularAria"]},
          angularAria: {deps:["angular"]}
        }
      });
      self.readyState = 1;
    }

    // Configured, load the resources
    if (self.readyState === 1) {
      self.readyState = 2;
      requirejs(["jquery", "angular", "angularAnimate", "angularStrap", "angularStrapTpls", "angularAria","angularMaterial"],
        function(_jq, _bs, _a, _aa, _ast, _as, _m) {
          self.readyState = 3;
          // Set the ready flag to indicate JS libs are loaded
          self.ready = true;

          // Call initHandlers for all components in needsInit
          for (var id in self.needsInit) {
            self.initHandlers(self.needsInit[id]);
            delete self.needsInit[id];
          }
        });
    }
  },

  /**
   * Final step of loading scripts at app initialization.
   * This function is executed after all the third party dependencies have been
   * loaded, the initial dom has rendered, and the angular app is ready to be bootstrapped.
   *
   * @param {Component} component - The lightning component.
   **/
  initHandlers: function(component) {

    // Create the angular module for the application.
    angular.module('DemoApp', [
      'ngAnimate',
      'mgcrea.ngStrap',
      'ngMaterial'
    ])
      /**
       * The ToDoListAppCtrl controller.  This controller is data bound to the
       * base dom.  It's primary function is to read the lightning attributes and
       * configured for the component and assign them to scope variables to be used in the
       * html. 
       */
      .controller('ToDoListAppCtrl', function($scope, ItemFactory) {
        // Main controller functions would be put here
      })

      .directive('todolist', function(ItemFactory){
		    return {
		    	restrict: 'EA',
          controller: function($scope, ItemFactory) {
            $scope.ItemFactory = ItemFactory;
            $scope.newitem = { task: ""};
            $scope.selectedItems = [];
            /**
             * Submit handler for the new project form.
             */
            $scope.submit = function() {
              // Fire the ToDoAppNewTask lightning event for procesing.
              var task = $scope.newitem.task;
              $scope.newitem.task = '';
              $A.get("e.c:ToDoAppNewItem")
                .setParams({ "task": task}).fire();
            };
            /**
             * Toggle handler for the items checkbox
             */
            $scope.toggle =  function (item) {
              var idx = $scope.selectedItems.indexOf(item.task__c);
              if (idx > -1) $scope.selectedItems.splice(idx, 1);
              else $scope.selectedItems.push(item.task__c);
            };
            /**
             * Update handler for creating new items.
             */
            $scope.update = function() {
              // Fire the ToDoAppUpdateTask lightning event for procesing
              $A.get("e.c:ToDoAppUpdateItems")
                .setParams({ "tasks": $scope.selectedItems}).fire();
            };

          },
          template:
            '<md-toolbar>' +
            '<h2 class="md-toolbar-tools">' +
            '<span>To Do List</span>' +
            '</h2></md-toolbar>' +
            '<md-tabs style="min-height: 800px" class="md-dynamic-height md-border-bottom"><md-tab label="List">' +
            '<md-content class="md-padding">' +
            '<md-list>' +  
            '<md-list-item ng-repeat="item in ItemFactory.items">' +
            '<md-checkbox ng-click="toggle(item)"></md-checkbox>' +
            '<p> {{item.task__c}} </p>' +
            '<md-icon class="md-secondary" aria-label="Chat">' +
            '</md-list>' +
            '<md-input-container style="padding: 2em">' +
            '<label>New Task</label>' +
            '<input required name="itemTask" ng-model="newitem.task">' +
            '</div>' +
            '</md-input-container>' +
            '<md-content>' +
            '<section layout="row" layout-sm="column" layout-align="center center">' +
            '<md-button class="md-raised md-primary" ng-click="update()">Update</md-button>' +
            '<md-button class="md-raised" ng-click="submit()">Add</md-button>' +
            '</section></md-content>'+
            '</md-content>' +
            '</md-tab><md-tab label="other stuff"></md-tab></md-tabs>'
		    };
      });
    this.addFactories(component);

    // Now that the module is ready bootstrap the application to the DOM.
    angular.bootstrap(component.find("base").getElement(), ['DemoApp']);
  },

    /**
   * Load the ToDoItems for the organization.
   *
   * @param {Component} component - The component object.
   */
  getItems: function(component) {
    var action = component.get('c.getToDoItems');
    var self = this;
    action.setCallback(this, function(items) {
      // If successful call the function to set the items attribute.
      if (items.getState() === "SUCCESS") {
        self.setItemsAttribute(component, items.getReturnValue());
      }
    });
    $A.enqueueAction(action);
  },


  /**
   * Create a new item using the ToDoAppController.  On successful create
   * will update the view items attribute and fire the ToDoAppNewTask
   * event.
   *
   * @param {Component} component - The component object.
   * param {String} name - The name of the new item.
   */
  createItem: function(component, task) {
    var action = component.get('c.addToDoItem'),
      paramsObj = {
        task: task,
      };
    action.setParams(paramsObj);
    var self = this;
    action.setCallback(this, function(result) {
      // If successful call the function to update the projects attribute.
      if (result.getState() === "SUCCESS") {
        self.getItems(component);
      } else if (result.getState() === "ERROR") {
        // On a failure if there is an error report it.
        var errors = result.getError();
        if (errors) {
          $A.logf("Errors", errors);
          if (errors[0] && errors[0].message) {
            $A.error("Error message: " + errors[0].message);
          }
        } else {
          $A.error("Unknown error");
        }
      } else {
        // Totally unknown state, show an alert.
        alert("Action state: " + result.getState());
      }

    });
    $A.enqueueAction(action);

  },

  /**
   * Update ToDo items using the ToDoItemsController.  On successful update
   * will update the view items attribute and fire the ToDoAppUpdateTasks
   * event.
   *
   * @param {Component} component - The component object.
   * param {String} name - The name of the new Project.
   */
  updateItems: function(component, tasks) {
  	console.log('updateItems, tasks are ', tasks);
    var action = component.get('c.updateToDoItems'),
      paramsObj = {
        tasks: $A.util.json.encode(tasks),
      };
    action.setParams(paramsObj);
    var self = this;
    action.setCallback(this, function(result) {
      // If successful call the function to update the items attribute.
      if (result.getState() === "SUCCESS") {
        self.getItems(component);
      } else if (result.getState() === "ERROR") {
        // On a failure if there is an error report it.
        var errors = result.getError();
        if (errors) {
          $A.logf("Errors", errors);
          if (errors[0] && errors[0].message) {
            $A.error("Error message: " + errors[0].message);
          }
        } else {
          $A.error("Unknown error");
        }
      } else {
        // Totally unknown state, show an alert.
        alert("Action state: " + result.getState());
      }

    });
    $A.enqueueAction(action);

  },


  /**
   * Utility function used to set the items view attribute and fire the
   * ToDoItemsLoad event.
   *
   * @param {Component} component - The component object.
   * @param {ToDoItems} items[] - The array of items to be set.
   */
  setItemsAttribute: function(component, items) {
    component.set("v.items", items);
    $A.get("e.c:ToDoAppItemsLoad")
      .setParams({ "items": items }).fire();
  },

  /**
   * The following section of function are the glue that tie the lightning data and angular
   * application together.  Because the lightning data scope exists outside of the angular
   * services it was required to monitor lightning events and update the service data when
   * it was indicated that lightning specific data had changed.
   */

  /**
   * Used to update the angular ItemsService when the lightning projects are updated.
   * @param {Component} component - The component object.
   * @param {Object} projects[] - The items that were updated.
   */
  updateItemsService: function(component, items) {
    var ItemFactory, $rootScope;
    console.log('updateItemsService with items', items);
    // Only execute if angular has been loaded.  If not loaded the service will update
    // when created.
    if (angular) {
      $injector = angular.element(component.find("base").getElement()).injector();
      // The $injector will only be found after angular has been bootstrapped.
      if ($injector) {
        $injector = angular.element(component.find("base").getElement()).injector(),
          ItemFactory = $injector.get('ItemFactory');
        $rootScope = $injector.get('$rootScope');

        // Update the service value, clean the loading value, and trigger an angular digest.
        ItemFactory.items = items;
        $rootScope.$apply();
      }
    }
  },


  /**
   * Utility function used to update the loading state of the angular application.
   *
   * @param {Component} component - The component object.
   * @param {Boolean} loading - When true the loading mask will be shown.
   */
  updateAppLoading: function(component, loading) {
    var $rootScope, $injector;
    // Only execute if angular has been loaded.  If not loaded the service will update
    // when created.
    if (angular) {
      // The $injector will only be found after angular has been bootstrapped.
      $injector = angular.element(component.find("base").getElement()).injector();
      if ($injector) {
        $rootScope = $injector.get('$rootScope');
        $rootScope.appLoading = loading;
        $rootScope.$apply();
      }
    }

  },

    /**
   * Utility used to add factories to the angular application.
   * @param {Component} component - The component object.
   */
  addFactories: function(component) {
    angular.module('DemoApp')
      /**
       * The ItemsFactory.  This factory will contain the current projects loaded
       * from the SF apex controller.
       */
      .factory('ItemFactory', function() {
        // When created load the projects attribute from the lightning view.
        var items = component.get("v.items"),
          itemFactory = {
            items: items
          };
        return itemFactory;
      });
    }
})