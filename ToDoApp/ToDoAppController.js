/**
 * The lighting controller object for the ToDoApp component.
 **/
({

  /**
   * Executed at initialization of the application.  Used to pre-populate data
   * needed to build the View.
   *
   * @param {Component} component - The lightning component.
   * @param {Event} event - The event that triggered the execution of this function.
   * @param {Helper} helper - The lightning component helper associated with the component.
   **/
  doInit: function(component, event, helper) {
    helper.getItems(component);
  },
  /**
   * Part of the script loading functionality.  It will be executed after requirejs
   * has loaded and is ready to process other third party requires.
   *
   * @param {Component} component - The lightning component.
   * @param {Event} event - The event that triggered the execution of this function.
   * @param {Helper} helper - The lightning component helper associated with the component.
   **/
  initScripts: function(component, event, helper) {
    helper.initScripts(component);
  },

  /**
   * Handler for the lightning event ToDoItemsLoad.  This calls the helper function
   * that will update the angular components that depend on the lightning data related to the
   * items attribute.
   *
   * @param {Component} component - The lightning component.
   * @param {Event} event - The event that triggered the execution of this function.
   * @param {Helper} helper - The lightning component helper associated with the component.
   */
  processItemsLoad: function(component, event, helper) {
    helper.updateItemsService(component, event.getParam('items'));
  },

  /**
   * Handler for the lightning event ToDoAppNewTask  This calls the helper function
   * that will trigger the creation of a new ToDo item based on data provided in the UI.
   *
   * @param {Component} component - The lightning component.
   * @param {Event} event - The event that triggered the execution of this function.
   * @param {Helper} helper - The lightning component helper associated with the component.
   */
  createNewItem: function(component, event, helper) {
    helper.createItem(component, event.getParam('task'));
  },

    /**
   * Handler for the lightning event ToDoAppUpdateTask.  This calls the helper function
   * that will trigger the update of a ToDo item based on data provided in the UI.
   *
   * @param {Component} component - The lightning component.
   * @param {Event} event - The event that triggered the execution of this function.
   * @param {Helper} helper - The lightning component helper associated with the component.
   */
  updateItems: function(component, event, helper) {
    helper.updateItems(component, event.getParam('tasks'));
  },

})