let console_css_style = `
font-weight: 900; 
background: #282C34; 
color: #8AC379; 
font-size: 18px; 
padding: 10px; 
border-radius: 15px;
overflow: hidden;`;

let col_config = [
    {index: 8},
    {index: 9},
    {index: 10},
    {index: 11},
    {index: 24},
    {index: 25},
    {index: 26},
    {index: 39},
    {index: 40},
    {index: 41},
    {index: 42},
    {index: 71},
    {index: 72},
];

let graph_index = [
    {index: 12},
    {index: 13},
    {index: 14},
    {index: 15},
    {index: 16},
    {index: 17},
    {index: 18},
    {index: 19},
    {index: 20},
    {index: 21},
    {index: 22},
    {index: 23}
]

let data_index = {
    position: 0,
    get_size: 100
}

let main_panel, info_panel, table_panel, data_store, myMsg, appData, radar_chart, viel_chart;

async function createInitialStructure() {
    myMsg = Ext.create('Ext.window.MessageBox', {
        // set closeAction to 'destroy' if this instance is not
        // intended to be reused by the application
        closeAction: null
    }).show({
        title: 'We`r so sory',
        message: 'W8 until we get the data'
    });
    myMsg.destroy();
    /*
     * Creamos el panel principal
    */
    let main_panel = new Ext.panel.Panel({
        layout: 'border',
        padding: 20,
        renderTo: Ext.getBody(),
        width: '100%',
        height: '100vh',
        defaults: {
            collapsible: true,
            split: true
        },
        items: [
            
        ]
    });

    /*
     * Creamos la store de los datos, vacia
    */
    data_store = new Ext.data.Store({
        storeId: 'simpsonsStore',
        //fields: table_fields,
        data: [],
        //sorters: [
        //    table_fields[0]
        //]
    });
    /*
     * Creamos la tabla, sin datos
    */
    table_panel = new Ext.grid.Panel({
        //title: data.meta.view.name + " - " + data.meta.view.attribution,
        region: 'center', 
        selModel: 'cellmodel',
        columnLines: true,
        loadMask: true,
        store: data_store,
        //columns: data_cols,
        width: '100%',
        height: '100vh',
        emptyText: 'Estamos intentando hubicar los datos'
    });

    /*
     * Creamos el panel para visualizar toda la info
    */
    info_panel = new Ext.panel.Panel({
        width: '30%',
        title: 'Info. Panel',
        region: 'west', 
        padding: '0px 10% 0px 10%',
    }); 

    radar_chart = new Ext.create({
        xtype: 'polar',
        width: '100%',
        height: 500,
        store: {},
        insetPadding: 20,
        interactions: 'rotate',
        //captions: {
        //    title: 'Radar Charts - Basic',
        //    credits: {
        //        text: 'Data: Browser Stats 2012 - Internet Explorer\n' +
        //            'Source: http://www.w3schools.com/',
        //        align: 'left'
        //    }
        //},
        series: {
            type: 'radar',
            angleField: 'name',
            radiusField: 'value',
            style: {
                fillStyle: '#388FAD',
                fillOpacity: .1,
                strokeStyle: '#388FAD',
                strokeOpacity: .8,
                lineWidth: 1
            }
        },
        axes: [{
            type: 'numeric',
            position: 'radial',
            fields: 'value',
            style: {
                estStepSize: 10
            },
            grid: true
        }, {
            type: 'category',
            position: 'angular',
            fields: 'name',
            style: {
                estStepSize: 1
            },
            grid: true
        }]
    });
    info_panel.add(radar_chart);
    // Añadimos la tabla al centro del panel principal
    main_panel.add(table_panel);
    main_panel.add(info_panel);
}

var app = new Ext.application({
    name : 'E-coordina',
    launch: async function() {
        //Ext.Msg.alert('Status', 'Application - ' + this.getName() + ' lauched correctly');
        createInitialStructure();
        getData().then(data => {
            console.log("%cFull Data Object", console_css_style);
            console.log(data);
            //var save_data = "";
            //for(var i = 0; i < 100; i++) {
            //    console.log(data.data[i]);
            //    save_data += JSON.stringify(data.data[i]);
            //}
            //save_data = save_data.split("][").join("],[");
            //console.log(save_data);
            appData = data;
            myMsg.destroy();
            table_panel.setTitle(data.meta.view.name + " - " + data.meta.view.attribution);
            console.log("%cIncoming Columns", console_css_style);
            console.log(data.meta.view.columns);

            console.log("%cIncoming Rows", console_css_style);
            console.log(data.data);

            let data_cols = [];
            let piter = 0;
            col_config.forEach(elem => {
                let col = {};
                let data_elem = data.meta.view.columns[elem.index]
                if(data_elem.dataTypeName == "number") {
                    col['xtype'] = 'numbercolumn';
                    col['format'] = '0,000';
                    col['align'] = 'right';
                }
                col['dataIndex'] = data_elem.fieldName;
                col['text'] = data_elem.name;
                col['width'] = data_elem.width + 30;
                
                data_cols.push(col);
            });
            
            //console.log(data_cols);

            let table_fields = [];
            let store_data = [];

            data_cols.forEach(elem => {
                table_fields.push(elem.dataIndex);
            });
            //console.log(table_fields);

            //table_fields.push(':sid');

            for(let i = data_index.position; i < data_index.get_size; i++) {
                let store_elem = {};
                let row_data = data.data[i];
                table_fields.forEach(function(elem, index) {

                    store_elem[elem] = row_data[col_config[index].index];
                });
                store_data.push(store_elem);
            }
            data_index.position += 100;

            data_store.setFields(table_fields);
            data_store.setData(store_data);

            table_panel.on('rowdblclick',function(e, record, tr, rowIndex) {
                console.log(rowIndex);
                let datos = appData.data[rowIndex];

                let data = [];
                //console.log(datos);
                radar_chart.setTitle(`${datos[8]}, ${datos[9]}`);
                radar_chart.setConfig('captions', {
                        title: 'Radar Charts - ' + `${datos[8]}, ${datos[9]}`,
                        credits: {
                            text: 'Data: Energy Usage 2010 - City of Chicago\n' +
                                '',
                            align: 'left'
                        }
                    });
                graph_index.forEach(function(elem, index) {
                    var col_name = appData.meta.view.columns[elem.index].name;
                    var elemento = {
                        name: col_name,
                        value: datos[elem.index]
                    }
                    //console.log(col_name);
                    data.push(elemento);
                });

                var chart_store = new Ext.data.Store({
                    fields: ['name', 'value'],
                    data: data
                });

                radar_chart.setStore(chart_store);
                //radar_chart
            });
            //data_store = new Ext.data.Store({
            //    storeId: 'simpsonsStore',
            //    fields: table_fields,
            //    data: store_data,
            //    sorters: [
            //        table_fields[0]
            //    ]
            //});
            
            table_panel.setConfig('columns', data_cols);
            //table_panel.columns = data_cols;
            //console.log(table_panel);
            table_panel.setStore(data_store);
        });
    }
});

async function getData() {
    return new Promise(function(res, rej) {
        let url = 'https://data.cityofchicago.org/api/views/8yq3-m6wp/rows.json?accessType=DOWNLOAD';
        let local = 'data.json'
        fetch('data.json')
            .then(res => res.json())
            .then(data => {
                setTimeout(() => {
                    res(data);
                }, 1000);
            });
    });
}