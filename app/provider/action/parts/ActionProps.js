'use strict';

let entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
let cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
let is = require('bpmn-js/lib/util/ModelUtil').is;
let _ = require('lodash');
let cvdi = require('../../../cvdiService');
let getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

const getValue = (element, businessObject, key) => {
    let value = businessObject && businessObject.get(key);
    let props = {};

    props[key] = (!!value) ? (value) : ('');

    return props;
};

const setValue = (element, values, key) => {
    let props = {};
    props[key] = values[key];

    saveDataValidationActions(element.id, props);

    return cmdHelper.updateBusinessObject(element, getBusinessObject(element), props);
};

const saveDataValidationActions = (key, data) => {
    let data_encode = window.localStorage.getItem(key);
    let data_final = data;

    if (data_encode && data_encode.length > 0) {
        data_final = JSON.parse(data_encode);
        data_final = Object.assign(data_final, data);
    }
    window.localStorage.setItem(key, JSON.stringify(data_final));
};


module.exports = function (group, element, bpmnFactory) {

    if (is(element, 'bpmn:Task')) {
        let data_neurons = cvdi.getDataSelectNeurons();
        let data_actions = cvdi.getDataSelectActions();

        let props_select_neurons = {
            id: 'neuron',
            label: 'Neuron',
            modelProperty: 'neuron',
            selectOptions: data_neurons,
            set: (el, values) => {
                return setValue(el, values, 'neuron');
            },
            get: (el, values) => {
                return getValue(el, getBusinessObject(el), 'neuron')
            }
        };

        let props_select_actions = {
            id: 'action',
            label: 'Action',
            modelProperty: 'action',
            selectOptions: data_actions,
            set: (el, values) => {
                return setValue(el, values, 'action');
            },
            get: (el, values) => {
                return getValue(el, getBusinessObject(el), 'action')
            },
            validate: function (element, value, node, idx) {
                let data = JSON.parse(window.localStorage.getItem(element.id));

                if (data) {
                    if (!data.hasOwnProperty('neuron')) {
                        return {'action': "Not Neuron selected"};
                    }
                    else {
                        if (!cvdi.validateAction(data.neuron, value.action)) {
                            return {'action': "Action not in neuron selected"};
                        }
                    }
                }
            },
        };

        group.entries.push(entryFactory.selectBox(props_select_neurons));
        group.entries.push(entryFactory.selectBox(props_select_actions));
    }
};

