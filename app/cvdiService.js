const lo = require('lodash');

let cvdiService = {
    getNeuronsData: function () {
        return JSON.parse(window.localStorage.getItem('neurons_data'));
    },
    getDataSelectActions: function () {
        let data = [];
        lo.forEach(this.getNeuronsData(), (neuron) => {
            lo.forEach(neuron.actions, (action) => {
                data.push({
                    name: action.name,
                    value: action.id
                })
            })
        });
        return data;
    },
    getDataSelectNeurons: function () {
        let data = [];
        lo.forEach(this.getNeuronsData(), (neuron) => {
            data.push({
                name: neuron.name,
                value: neuron.id
            });
        });
        return data;
    },
    validateAction: function (id_neuron, id_action) {

        let match = false;

        lo.forEach(this.getNeuronsData(), (neuron) => {
            if (neuron.id === id_neuron) {
                lo.forEach(neuron.actions, (action) => {
                    if (action.id === id_action) {
                        match = true;
                    }
                });
            }
        });
        return match;
    }

};

module.exports = cvdiService;

