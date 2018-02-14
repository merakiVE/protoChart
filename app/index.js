'use strict';

let fs = require('fs');
let debounce = require('lodash/function/debounce');
let BpmnModeler = require('bpmn-js/lib/Modeler');
let axios = require('axios');

const urls = require('./api');

let propertiesPanelModule = require('bpmn-js-properties-panel');
let propertiesProviderModule = require('./provider/action');
let actionDescriptor = require('./descriptors/action');
//let magicModdleDescriptor = require('./descriptors/magic');


let container = document.getElementById('js-drop-zone');
let canvas = document.getElementById('js-canvas');

let bpmnModeler = new BpmnModeler({
    container: canvas,
    propertiesPanel: {
        parent: '#js-properties-panel'
    },
    additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule
    ],
    moddleExtensions: {
        action: actionDescriptor
    }
});

let newDiagramXML = fs.readFileSync(__dirname + '/../resources/newDiagram.bpmn', 'utf-8');

function createNewDiagram() {
    openDiagram(newDiagramXML);
}

function openDiagram(xml) {

    bpmnModeler.importXML(xml, function (err) {

        if (err) {
            container.classList.remove('with-diagram');
            container.classList.add('with-error');

            container.querySelector('.error pre').innerHTML = err.message;

            console.error(err);
        } else {
            container.classList.remove('with-error');
            container.classList.add('with-diagram');
        }
    });
}

function saveSVG(done) {
    bpmnModeler.saveSVG(done);
}

function saveDiagram(done) {
    bpmnModeler.saveXML({format: true}, function (err, xml) {
        done(err, xml);
    });
}

function registerFileDrop(container, callback) {

    function handleFileSelect(e) {
        e.stopPropagation();
        e.preventDefault();

        let files = e.dataTransfer.files;

        let file = files[0];

        let reader = new FileReader();

        reader.onload = function (e) {

            let xml = e.target.result;

            callback(xml);
        };

        reader.readAsText(file);
    }

    function handleDragOver(e) {
        e.stopPropagation();
        e.preventDefault();

        e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    container.addEventListener('dragover', handleDragOver, false);
    container.addEventListener('drop', handleFileSelect, false);
}


////// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
    window.alert(
        'Looks like you use an older browser that does not support drag and drop. ' +
        'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
    registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById('js-create-diagram').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        axios
            .get(urls.API_CVDI + '/neurons')
            .then((response) => {
                window.localStorage.setItem('neurons_data', JSON.stringify(response.data.data));
            })
            .catch((err) => {
                console.log(err);
                alert("Error no se pudo obtener la data de los neurons");
            });

        createNewDiagram();
    });

    let downloadLink = document.getElementById('js-download-diagram');
    let downloadSvgLink = document.getElementById('js-download-svg');

    downloadLink.addEventListener('click', () => {
        return saveDiagram((err, xml) => {
            setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
        });
    });

    /*
      $('.buttons a').click(function(e) {
        if (!$(this).is('.active')) {
          e.preventDefault();
          e.stopPropagation();
        }
      });*/

    const setEncoded = (link, name, data) => {
        let encodedData = encodeURIComponent(data);

        if (data) {

            if (link) {
                link.classList.add('active');
                link.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData);
                link.setAttribute('download', name);
            }

        } else {
            link.classList.remove('active');
        }
    };

    const exportArtifacts = debounce((e) => {

        saveSVG((err, svg) => {
            setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
        });

        saveDiagram((err, xml) => {
            setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
        });
    }, 500);

    bpmnModeler.on('commandStack.changed', exportArtifacts);

});
