'use strict';


var inherits = require('inherits');

var PropertiesActivator = require('bpmn-js-properties-panel/lib/PropertiesActivator');

// Require all properties you need from existing providers.
// In this case all available bpmn relevant properties without camunda extensions.
var processProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps'),
    eventProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps'),
    linkProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps'),
    documentationProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps'),
    idProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps'),
    nameProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps');


// Require your custom property entries.
var actionProps = require('./parts/ActionProps');

// The general tab contains all bpmn relevant properties.
// The properties are organized in groups.
function createGeneralTabGroups(element, bpmnFactory, elementRegistry, translate) {

    var generalGroup = {
        id: 'general',
        label: 'General',
        entries: []
    };
    idProps(generalGroup, element, translate);
    nameProps(generalGroup, element, translate);
    processProps(generalGroup, element, translate);

    var detailsGroup = {
        id: 'details',
        label: 'Details',
        entries: []
    };

    linkProps(detailsGroup, element, translate);
    eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);

    var documentationGroup = {
        id: 'documentation',
        label: 'Documentation',
        entries: []
    };

    documentationProps(documentationGroup, element, bpmnFactory, translate);

    return [
        generalGroup,
        detailsGroup,
        documentationGroup
    ];
}


function createActionTabGroups(element, elementRegistry, factory) {

    // Create a group called "Black Magic".
    var actionGroup = {
        id: 'action-neuron',
        label: 'Actions Neuron',
        entries: []
    };

    // Add the spell props to the black magic group.
    actionProps(actionGroup, element, factory);

    return [
        actionGroup,
    ];
}

function ActionPropertiesProvider(eventBus, bpmnFactory, elementRegistry, translate) {

    PropertiesActivator.call(this, eventBus);

    this.getTabs = function (element) {

        let generalTab = {
            id: 'general',
            label: 'General',
            groups: createGeneralTabGroups(element, bpmnFactory, elementRegistry, translate)
        };

        let actionTab = {
            id: 'actions',
            label: 'Actions',
            groups: createActionTabGroups(element, elementRegistry, bpmnFactory)
        };

        return [
            generalTab,
            actionTab
        ];
    };
}

inherits(ActionPropertiesProvider, PropertiesActivator);

module.exports = ActionPropertiesProvider;
