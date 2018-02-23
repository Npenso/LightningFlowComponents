/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
 ({

    init: function(cmp,evt, helper){
        //in the flow, the user is expected to enter the child questions as space delimited strings
        //here we convert them to more useful Lists
        var childCompsLinkedToYes = cmp.get("v.childComponentsLinkedToYes");
        if ((childCompsLinkedToYes) && (childCompsLinkedToYes != "none")) {
           cmp.set("v.childComponentsArrayLinkedToYes", childCompsLinkedToYes.split(" "));
        };

        var childCompsLinkedToNo = cmp.get("v.childComponentsLinkedToNo");
        if ((childCompsLinkedToNo) && (childCompsLinkedToNo != "none")) {
            cmp.set("v.childComponentsArrayLinkedToNo", childCompsLinkedToNo.split(" "));
        };

        helper.initRadioOptions(cmp,evt);
        helper.initListboxOptions(cmp,evt);
        helper.initChildControls(cmp,evt);
    },

    stopPropagation: function(component, event, helper) {
    	  event.stopPropagation();
        console.log("stopping propagation");
	  },

    //when a parent control is clicked, we check how each child control has been set in the flow to respond
    //depending on that passed in status value, we fire an event to tell the appropriate child controls to update their nowVisible settings
    onParentClick: function(cmp, evt, helper) {
        console.log ("entering parent click for component label: " + cmp.get('v.parentQuestionLabel'));
        var parentValue = cmp.get('v.parentQuestion_value');

        var childControlsList = cmp.get('v.childComponentsArrayLinkedToYes')
        	.concat(cmp.get('v.childComponentsArrayLinkedToNo'));

        childControlsList.forEach(function(element) {
            //find out whether this child control should show on a Yes or a No
            helper.lookupName(cmp,element);
            var childName = cmp.get("v.curName");
    		    var statusAttributeName = 'v.' + childName + '_conditionalRelationship';
            var conditionalRelationship = cmp.get(statusAttributeName).toLowerCase();

            //if the current parent value matches the conditional relationship passed in from the flow, show this child control
            var curVisibility = "";
            if ((parentValue == "true" && conditionalRelationship == 'yes') ||
                (parentValue == "false" && conditionalRelationship == 'no') ) {
                	curVisibility = "true";

            } else {
                    curVisibility = "false";
            };

            //if the visibility has changed (cur vis != old vis) fire an event to notify this child control
            var childComponentVisibilityAttributeName = 'v.' + childName  + '_nowVisible';
            if (cmp.get(childComponentVisibilityAttributeName).toString() != curVisibility){
                var updateEvent = $A.get("e.c:ChildControlVisibilityUpdateEvent");
                updateEvent.setParams({"childControlName" : childComponentVisibilityAttributeName});
         		    updateEvent.setParams({"childControlVisibilityChanged" : true});
                updateEvent.setParams({"parentLabel" : cmp.get("v.parentQuestionLabel")});
                updateEvent.fire();
            };

            //persist the visibility status of the child component for the next time this method gets called
            cmp.set(childComponentVisibilityAttributeName, curVisibility);
        });
 	  },

    //when a child control value changes, we need to update the storage attribute here in the parent for use by the flow downstream
    handleChildControlClickedEvent: function(cmp,evt, helper) {
       var clickedControl = evt.getSource();
       helper.updateStorage(cmp, clickedControl);
    }

})
