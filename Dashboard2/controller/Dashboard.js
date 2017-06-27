

// var base = 'http://uphmis.in/uphmis/';
var base = 'http://192.168.1.100:8080/uphmis225/';

var map;
var tabledata;

$(document).ready(function () {

    // debugger
    var query = decodeURIComponent(window.location.search);
    var indid;
    query = query.substring(1);
    var params = query.split("&");
    for (var i = 0; i < params.length; i++) {
        var param = params[i].split("=");
        switch (param[0]) {
            case "indid":
                indid = param[1];
                break;
        }
    }

    SetOrgunit(indid);

});




function SetOrgunit(indid) {

    // 1. Organisation Unit group
    $.ajax({

        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + 'api/organisationUnitGroups/Y6VJukQY7rJ.json?fields=organisationUnits[id,name,code]',
        success: function (data) {


            var organisationUnits = data.organisationUnits;
            organisationUnits.sort(function (a, b) {
                var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            });
            $.each(organisationUnits, function (index, item) {
                $('#orgUnit').append($('<option></option>').val(item.id).html(item.name).text(item.name)
                );
            });
        },
        error: function (response) {
        }
    });

    indicator_drop(indid);
}


function indicator_drop(indid) {
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + 'api/25/indicatorGroups/' + indid + '.json?fields=id,name,indicators[id,name,code]',
        success: function (data) {

            var dataElements = data.indicators;
            dataElements.sort(function (a, b) {
                var nameA = a.code.toLowerCase(), nameB = b.code.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            });


            $.each(data.indicators, function (index, item) {
                var indicatorName = item.name.substring();
                $('#indicator').append(
                    $('<option></option>').val(item.id).html(item).text(item.name)
                );
            });
            preselect();
        },
        error: function (response) {

        }
    });

}


function preselect() {
    $('#orgUnit option')[1].selected = true;
    $('#indicator option')[1].selected = true;
    CreateDashboard();
}



// On the Button Click Function

function CreateDashboard() {


    var startDate = document.getElementById("startDate").value;
    var endDate = document.getElementById("endDate").value;

    var startDate = moment(startDate);
    var endDate = moment(endDate);

    var result = [];

    if (endDate.isBefore(startDate)) {
        window.alert('Please select end date Accordinlgy');
    }

    var currentDate = startDate.clone();

    while (currentDate.isBefore(endDate)) {
        result.push(currentDate.format("YYYYMM"));
        currentDate.add(1, 'month');
    }


    var date = ("" + result.join(";") + "");

    var orgunitId;
    var indicatorId;

    var orgUnitList = document.getElementById('orgUnit');
    orgunitId = orgUnitList.options[orgUnitList.selectedIndex].value;


    var indicator = document.getElementById('indicator');
    indicatorId = indicator.options[indicator.selectedIndex].value;

    var indicatorName;
    indicatorName = indicator.options[indicator.selectedIndex].innerHTML;

    var e;

    if (orgunitId == "v8EzhiynNtf") {
        table(indicatorId, orgunitId, date);
        createchart(date, orgunitId, indicatorId, indicatorName);
        map_UP(indicatorId, orgunitId, date);
    }
    else {
        state_Table(indicatorId, orgunitId, date);
        State_createchart(date, orgunitId, indicatorId, indicatorName);
        State_Map(indicatorId, orgunitId, date, e)
    }


}

/// Function For map Drill Dwon
function CreateDashboard_Drill(params, e) {

    var startDate = document.getElementById("startDate").value;
    var endDate = document.getElementById("endDate").value;

    var startDate = moment(startDate);
    var endDate = moment(endDate);

    var result = [];

    if (endDate.isBefore(startDate)) {
        window.alert('Please select end date Accordinlgy');
    }

    var currentDate = startDate.clone();

    while (currentDate.isBefore(endDate)) {
        result.push(currentDate.format("YYYYMM"));
        currentDate.add(1, 'month');
    }


    var date = ("" + result.join(";") + "");

    var orgunitId;
    var indicatorId;


    orgunitId = params.target.feature.properties.oid;


    var indicator = document.getElementById('indicator');
    indicatorId = indicator.options[indicator.selectedIndex].value;

    var indicatorName;
    indicatorName = indicator.options[indicator.selectedIndex].innerHTML;



    if (orgunitId == "v8EzhiynNtf") {
        table(indicatorId, orgunitId, date);
        createchart(date, orgunitId, indicatorId, indicatorName);
        map_UP(indicatorId, orgunitId, date);
    }
    else {
        state_Table(indicatorId, orgunitId, date);
        State_createchart(date, orgunitId, indicatorId, indicatorName);
        State_Map(indicatorId, orgunitId, date, params)
    }


}




///////////////////////////////*******************************************************Code for Uphmis Level************************************************************************************* */

// Separtion of code for UPHMIS Level    

// Fisrt for Table
function table(indicatorId, orgunitId, date) {

    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: "" + base + "/api/25/analytics.json?dimension=dx:" + indicatorId + "&dimension=ou:LEVEL-4;" + orgunitId + "&filter=pe:" + date + "&displayProperty=NAME",
        success: function (data) {
            table_data(data);
        },
        error: function (response) {
        }
    });

}


// function for Creating Table data
function table_data(data) {

    $("#dataTable1").hide();
    $("#dataTable").show();

    tabledata = ""
    tabledata = "<thead><tr><th>Organisation Unit/ Data <img src='./JS/updown.png' style='height:20px;cursor:pointer'/> </th><th class='header headerSortUp'>Indicator Value<span><img src='./JS/updown.png' style='height:20px;cursor:pointer'/>  </span> </th></tr></thead>";
    for (var i = 0; i < data.rows.length; i++) {
        tabledata += ("<tr><td>" + data.metaData.names[data.rows[i][1]] + "</td><td>" + data.rows[i][2] + "</td></tr>");
    }
    document.getElementById("dataTable").innerHTML = tabledata;

    $("#dataTable").tablesorter();
}


// cearete charts
function createchart(date, orgunitId, indicatorId, indicatorName) {
    var xaxis = []; //period
    var data1 = []; //values
    var orgunit = '';
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: "" + base + "/api/25/analytics.json?dimension=pe:" + date + "&dimension=ou:" + orgunitId + "&filter=dx:" + indicatorId + "&displayProperty=NAME",
        success: function (data) {
            for (var i = 0; i < data.rows.length; i++) {
                xaxis.push(data.metaData.names[data.rows[i][0]]);
                data1.push(parseInt(data.rows[i][2]));
                orgunit = data.metaData.names[data.rows[i][1]];
            }
            LineChart(orgunit, xaxis, data1, indicatorName);
            columnchart(orgunit, xaxis, data1, indicatorName);
        },
        error: function (response) {
        }
    });

    piechart(orgunitId, indicatorId, date, indicatorName);
    faciltity_Column(orgunitId, indicatorId, date, indicatorName);
    Piechart1(orgunitId, indicatorId, date, indicatorName);
    Divison_Column(orgunitId, indicatorId, date, indicatorName);
}

function LineChart(orgunit, xaxis, data1, indicatorName) {

    var og = orgunit;
    var x = xaxis;
    var y = data1;


    Highcharts.chart('div1', {
        chart: {
            type: 'line'
        },
        title: {
            text: indicatorName
        },

        xAxis: {
            categories: x
        },
        yAxis: {
            title: {
                text: 'Indicators value'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: og,
            data: y
        }]
    });
}


// function for column Chart
function columnchart(orgunit, xaxis, data1, indicatorName) {
    var og = orgunit;
    var x = xaxis;
    var y = data1;


    Highcharts.chart('div3', {
        chart: {
            type: 'column'
        },
        title: {
            text: indicatorName
        },
        xAxis: {
            categories: x
        },
        yAxis: {
            title: {
                text: 'Indicators value'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: og,
            data: y
        }]
    });

}


// Facility Wise distribtuon
function piechart(orgunitId, indicatorId, date, indicatorName) {
    var dataSeriesArrO = new Array();
    var og;
    var factype = [];
    var data1 = [];
    var seriO;
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: "" + base + "/api/25/analytics.json?dimension=FmDv7glZ1V0:nIVbiyAyRrb;UBuxUMmdz1U;JRLIvJzK4H0;gBerHA2rUH0&dimension=ou:" + orgunitId + "&filter=dx:" + indicatorId + "&filter=pe:" + date + "&displayProperty=NAME",
        success: function (data) {


            for (var i = 0; i < data.rows.length; i++) {
                og = data.rows[i][1];
                factype = data.metaData.names[data.rows[i][0]];
                data1 = parseInt(data.rows[i][2]);
                seriO = { "name": factype, "y": data1 };
                dataSeriesArrO.push(seriO);
            }
            createpie(dataSeriesArrO, indicatorName);
        },
        error: function (response) {
        }
    });

}

function createpie(dataSeriesArrO, indicatorName) {

    // Build the chart
    Highcharts.chart('div2', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: indicatorName,
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f} %</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                },
                showInLegend: true
            }
        },
        series: [{
            name: "orgunit",
            data: dataSeriesArrO
        }]
    });

}


// Column Chart for faciltity wise Distribution
//ref
function faciltity_Column(orgunitId, indicatorId, date, indicatorName) {
    var xaxis = []; //period
    var data1 = []; //values
    var orgunit = '';
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + '/api/25/analytics.json?dimension=ou:' + orgunitId + '&dimension=FmDv7glZ1V0:nIVbiyAyRrb;UBuxUMmdz1U;JRLIvJzK4H0;gBerHA2rUH0&filter=dx:' + indicatorId + '&filter=pe:' + date + '&displayProperty=NAME',
        success: function (data) {

            orgunit = data.metaData.names[orgunitId];
            for (var i = 0; i < data.rows.length; i++) {
                xaxis.push(data.metaData.names[data.rows[i][1]]);
                data1.push(parseInt(data.rows[i][2]));
            }
            faciltity_ColumnData(orgunit, xaxis, data1, indicatorName);
        },
        error: function (response) {
        }
    });


}


function faciltity_ColumnData(orgunit, xaxis, data1, indicatorName) {
    var og = orgunit;
    var x = xaxis;
    var y = data1;


    Highcharts.chart('div4', {
        chart: {
            type: 'column'
        },
        title: {
            text: indicatorName
        },
        xAxis: {
            categories: x
        },
        yAxis: {
            title: {
                text: 'Indicators value'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: og,
            data: y
        }]
    });
}



/// Divison wise Distribution
function Piechart1(orgunitId, indicatorId, date, indicatorName) {


    var dataSeriesArrO = new Array();
    var og;
    var xx;
    var factype = [];
    var data1 = [];
    var seriO;
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + 'api/25/analytics.json?dimension=dx:' + indicatorId + '&dimension=ou:LEVEL-3;' + orgunitId + '&filter=pe:' + date + '&displayProperty=NAME',
        success: function (data) {
            for (var i = 0; i < data.rows.length; i++) {
                og = data.rows[i][1];
                xx = data.rows[i][1];
                factype = data.metaData.names[xx];
                data1 = parseInt(data.rows[i][2]);
                seriO = { "name": factype, "y": data1 };
                dataSeriesArrO.push(seriO);
            }
            createpie1(dataSeriesArrO, indicatorName);
        },
        error: function (response) {
        }
    });
}
function createpie1(dataSeriesArrO, indicatorName) {

    // Build the chart
    Highcharts.chart('div5', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: indicatorName
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f} %</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                },
                showInLegend: true
            }
        },
        series: [{
            name: "orgunit",
            data: dataSeriesArrO
        }]
    });

}

// Column Chart for Divison wise Distribution

function Divison_Column(orgunitId, indicatorId, date, indicatorName) {


    var xaxis = []; //period
    var data1 = []; //values
    var orgunit = '';
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + '/api/25/analytics.json?dimension=dx:' + indicatorId + '&dimension=ou:LEVEL-3;' + orgunitId + '&filter=pe:' + date + '&displayProperty=NAME',
        success: function (data) {
            for (var i = 0; i < data.rows.length; i++) {
                xaxis.push(data.metaData.names[data.rows[i][1]]);
                data1.push(parseInt(data.rows[i][2]));
            }
            Divison_ColumnData(orgunit, xaxis, data1, indicatorName);
        },
        error: function (response) {
        }
    });


}


function Divison_ColumnData(orgunit, xaxis, data1, indicatorName) {
    var og = orgunit;
    var x = xaxis;
    var y = data1;


    Highcharts.chart('div6', {
        chart: {
            type: 'column'
        },
        title: {
            text: indicatorName
        },
        xAxis: {
            categories: x
        },
        yAxis: {
            title: {
                text: 'Indicators value'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: indicatorName,
            data: y
        }]
    });
}









// Map
// Yeah hai main function
function map_UP(indicatorId, orgunitId, date) {

    // $('.loader').css('display', 'block');
    var coords;
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + "api/organisationUnits/" + orgunitId + ".json?fields=id,name,coordinates,children[id,name,coordinates]&paging=false",
        success: function (response) {
            // var childcord = [];
            coords = JSON.parse(response.coordinates);
            mapUP_Value(coords, indicatorId, orgunitId, date);
        },
        error: function (response) {
        }
    });
}


function mapUP_Value(coords, indicatorId, orgunitId, date) {
    var orgunitname = [];
    var cordinatess = [];
    var ogid = [];
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + "api/organisationUnits/" + orgunitId + ".json?fields=id,name,coordinates&level=2",
        success: function (response1) {

            for (var i = 0; i < response1.organisationUnits.length; i++) {
                orgunitname.push(response1.organisationUnits[i].name);
                cordinatess.push(JSON.parse(response1.organisationUnits[i].coordinates));
                ogid.push(response1.organisationUnits[i].id);
            }
            MapdataValue(coords, orgunitname, cordinatess, ogid, indicatorId, orgunitId, date);
        },
        error: function (response) {
        }
    });
}

function MapdataValue(coords, orgunitname, cordinatess, ogid, indicatorId, orgunitId, date) {
    var datavalue = [];

    for (i in ogid) {
        var oggid = ogid[i];
        $.ajax({
            async: false,
            type: "GET",
            dataType: "json",
            contentType: "application/json",
            url: base + "api/25/analytics.json?dimension=dx:" + indicatorId + "&dimension=ou:LEVEL-4;" + oggid + "&filter=pe:" + date + "&displayProperty=NAME",
            success: function (response) {
                if (response.rows.length == 0) {
                    datavalue.push(null);
                }
                else {
                    for (var i = 0; i < response.rows.length; i++) {
                        datavalue.push(response.rows[i][2]);
                    }
                }
                createMap(coords, orgunitname, datavalue, cordinatess, ogid);

            },
            error: function (response) {
            }
        });
    }
}


function createMap(coords, orgunitname, datavalue, cordinatess, ogid) {
    var mm = {
        "type": "Feature",
        "geometry": {
            "type": "MultiPolygon",
            "coordinates": coords
        },
        "properties": {
            "name": "MultiPolygon",
            key: "block"
        }
    };

    var mp = [];

    for (var i = 0; i < orgunitname.length; i++) {
        mp.push({
            "type": "Feature",
            "id": "" + i + "",
            "properties": {
                "name": orgunitname[i],
                "density": datavalue[i],
                "oid": ogid[i]
            },
            "geometry":
            {
                "type": "Polygon",
                "coordinates": cordinatess[i][0]
            }
        });

    }

    if (map == 'undefined' || map == null) {

        var mnp = { "type": "FeatureCollection", "features": mp };

        map = L.map('mapid').setView([27.3, 80], 5.5);

        L.tileLayer('?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: '',
            id: 'mapbox.light'
        }).addTo(map);


        // control that shows state info on hover
        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props) {
            this._div.innerHTML = (props ?
                '<b>' + props.name + '</b><br />' + props.density + ''
                : 'Hover over a state');
        };



        info.addTo(map);



        // get color depending on population density value
        function getColor(d) {
            return d == undefined ? '#00BCD4' :
                d > 90 ? '#9C27B0' :
                    d > 90 ? '#008744' :
                        d > 60 ? '#50B948' :
                            d > 30 ? '#FFD302' :
                                '#F85E35';
        }

        function style(feature) {
            return {
                weight: 1.5,
                opacity: 1,
                color: 'white',
                dashArray: '2',
                fillOpacity: 1,
                fillColor: getColor(feature.properties.density)
            };
        }

        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 1
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }

            info.update(layer.feature.properties);
        }

        var geojson;

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
            info.update();
        }

        function zoomToFeature(e) {
            CreateDashboard_Drill(e, e.target.getBounds());
            map.fitBounds(e.target.getBounds());
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }


        geojson = L.geoJson(mm, {
        }).addTo(map);

        geojson = L.geoJson(mnp, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);




        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 30, 60, 90],
                labels = [],
                from, to;


            labels.push('<i style="background: #00BCD4"></i> ' + 'Null Value');

            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + getColor(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(map);
        $('.loader').css('display', 'none');
    }

    else {
        if (map != 'undefined' || map != null) {

            map.remove();

            var mnp = { "type": "FeatureCollection", "features": mp };


            map = L.map('mapid').setView([27, 81], 5.5);


            L.tileLayer('?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                maxZoom: 18,
                attribution: '',
                id: 'mapbox.light'
            }).addTo(map);


            // control that shows state info on hover
            var info = L.control();

            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info');
                this.update();
                return this._div;
            };

            info.update = function (props) {
                this._div.innerHTML = (props ?
                    '<b>' + props.name + '</b><br />' + props.density + ''
                    : 'Hover over a state');
            };

            info.addTo(map);


            // get color depending on population density value
            function getColor(d) {
                return d == undefined ? '#00BCD4' :
                    d > 90 ? '#9C27B0' :
                        d > 90 ? '#008744' :
                            d > 60 ? '#50B948' :
                                d > 30 ? '#FFD302' :
                                    '#F85E35';
            }


            function style(feature) {
                return {
                    weight: 1.5,
                    opacity: 1,
                    color: 'white',
                    dashArray: '2',
                    fillOpacity: 1,
                    fillColor: getColor(feature.properties.density)
                };
            }

            function highlightFeature(e) {
                var layer = e.target;

                layer.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });

                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                    layer.bringToFront();
                }

                info.update(layer.feature.properties);
            }

            var geojson;

            function resetHighlight(e) {
                geojson.resetStyle(e.target);
                info.update();
            }

            function zoomToFeature(e) {
                CreateDashboard_Drill(e, e.target.getBounds());
                map.fitBounds(e.target.getBounds());
            }

            function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: zoomToFeature
                });
            }


            geojson = L.geoJson(mm, {
            }).addTo(map);

            geojson = L.geoJson(mnp, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);



            var legend = L.control({ position: 'bottomright' });

            legend.onAdd = function (map) {

                var div = L.DomUtil.create('div', 'info legend'),
                    grades = [0, 30, 60, 90],
                    labels = [],
                    from, to;


                labels.push('<i style="background: #00BCD4"></i> ' + 'Null Value');
                for (var i = 0; i < grades.length; i++) {
                    from = grades[i];
                    to = grades[i + 1];

                    labels.push(
                        '<i style="background:' + getColor(from + 1) + '"></i> ' +
                        from + (to ? '&ndash;' + to : '+'));
                }

                div.innerHTML = labels.join('<br>');
                return div;
            };

            legend.addTo(map);

        }
        // $('.loader').css('display', 'none');
    }

}

// Map End


///////////////////////////////*******************************************************Code for Uphmis Level************************************************************************************* */






///////////////////////////////*******************************************************Code for District Level************************************************************************************* */


function state_Table(indicatorId, orgunitId, date) {
    // $('.loader').css('display', 'block');
    $.ajax({
        // async: false,
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + "/api/25/analytics.json?dimension=dx:" + indicatorId + "&dimension=ou:LEVEL-5;" + orgunitId + "&filter=pe:" + date + "&displayProperty=NAME",
        success: function (data) {

            _Stable(data);

        },
        error: function (response) {
        }
    });
}
// function for Creating Table data
function _Stable(data) {

    $("#dataTable").hide();
    $("#dataTable1").show();

    var tabledata1 = "<thead><tr><th>Organisation Unit/ Data<img src='./JS/updown.png' style='height:20px;cursor:pointer'/>    </th><th class='header headerSortUp'>Indicator Value<span><img src='./JS/updown.png' style='height:20px;cursor:pointer'/> </span> </th></tr></thead>";
    for (var i = 0; i < data.rows.length; i++) {
        tabledata1 += ("<tr><td>" + data.metaData.names[data.rows[i][1]] + "</td><td>" + data.rows[i][2] + "</td></tr>");
    }
    document.getElementById("dataTable1").innerHTML = tabledata1;
    $("#dataTable1").tablesorter();
    // $('.loader').css('display', 'none');
}


// cearete chart
function State_createchart(date, orgunitId, indicatorId, indicatorName) {
    var xaxis = []; //period
    var data1 = []; //values
    var orgunit = '';

    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + "/api/25/analytics.json?dimension=pe:" + date + "&dimension=ou:" + orgunitId + "&filter=dx:" + indicatorId + "&displayProperty=NAME",
        success: function (data) {

            for (var i = 0; i < data.rows.length; i++) {
                xaxis.push(data.metaData.names[data.rows[i][0]]);
                data1.push(parseInt(data.rows[i][2]));
                orgunit = data.metaData.names[data.rows[i][1]];
            }
            // Trend
            _SLineChart(orgunit, xaxis, data1, indicatorName);
            _SColumnchart(orgunit, xaxis, data1, indicatorName);
        },
        error: function (response) {
        }
    });


    // Facility wise
    _SPiechart(orgunitId, indicatorId, date, indicatorName);
    district_Column(orgunitId, indicatorId, date, indicatorName);

    //Block Wise
    Block_Wise(orgunitId, indicatorId, date, indicatorName);
    Block_Column(orgunitId, indicatorId, date, indicatorName);
}

function _SLineChart(orgunit, xaxis, data1, indicatorName) {

    var og = orgunit;
    var x = xaxis;
    var y = data1;


    Highcharts.chart('div1', {
        chart: {
            type: 'line'
        },
        title: {
            text: indicatorName
        },
        xAxis: {
            categories: x
        },
        yAxis: {
            title: {
                text: 'Indicators value'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: og,
            data: y
        }]
    });

}
// columnchart
function _SColumnchart(orgunit, xaxis, data1, indicatorName) {

    var og = orgunit;
    var x = xaxis;
    var y = data1;


    Highcharts.chart('div3', {
        chart: {
            type: 'column'
        },
        title: {
            text: indicatorName
        },
        xAxis: {
            categories: x
        },
        yAxis: {
            title: {
                text: 'Indicators value'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: og,
            data: y
        }]
    });

}

// Pie Chart for District wise Distribution
function _SPiechart(orgunitId, indicatorId, date, indicatorName) {
    var dataSeriesArrO = new Array();
    var og;
    var factype = [];
    var data1 = [];
    var seriO;
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + '/api/25/analytics.json?dimension=ou:' + orgunitId + '&dimension=FmDv7glZ1V0:nIVbiyAyRrb;UBuxUMmdz1U;JRLIvJzK4H0;gBerHA2rUH0&filter=pe:' + date + '&filter=dx:' + indicatorId + '&displayProperty=NAME',
        success: function (data) {
            for (var i = 0; i < data.rows.length; i++) {
                var xx = data.rows[i][1];
                factype = data.metaData.names[xx];
                data1 = parseInt(data.rows[i][2]);
                seriO = { "name": factype, "y": data1 };
                dataSeriesArrO.push(seriO);
            }
            _SCreatepie(dataSeriesArrO, indicatorName);
        },
        error: function (response) {
        }
    });

    // Piechart
    function _SCreatepie(dataSeriesArrO) {
        // Build the chart
        Highcharts.chart('div2', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: indicatorName,
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: "orgunit",
                data: dataSeriesArrO
            }]
        });

    }

}

// Column Chart for District wise Distribution
// working
function district_Column(orgunitId, indicatorId, date, indicatorName) {
    var xaxis = []; //period
    var data1 = []; //values
    var orgunit = '';
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + '/api/25/analytics.json?dimension=ou:' + orgunitId + '&dimension=FmDv7glZ1V0:nIVbiyAyRrb;UBuxUMmdz1U;JRLIvJzK4H0;gBerHA2rUH0&filter=dx:' + indicatorId + '&filter=pe:' + date + '&displayProperty=NAME',
        success: function (data) {
            orgunit = data.metaData.names[orgunitId];
            for (var i = 0; i < data.rows.length; i++) {
                xaxis.push(data.metaData.names[data.rows[i][1]]);
                data1.push(parseInt(data.rows[i][2]));
            }
            district_ColumnData(orgunit, xaxis, data1, indicatorName);
        },
        error: function (response) {
        }
    });

}


function district_ColumnData(orgunit, xaxis, data1, indicatorName) {
    var og = orgunit;
    var x = xaxis;
    var y = data1;


    Highcharts.chart('div4', {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: indicatorName
        },
        xAxis: {
            categories: x
        },
        yAxis: {
            title: {
                text: 'Indicators value'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: og,
            data: y
        }]
    });
}


/// Divison wise Distribution
function Block_Wise(orgunitId, indicatorId, date, indicatorName) {


    var dataSeriesArrO = new Array();
    var og;
    var xx;
    var factype = [];
    var data1 = [];
    var seriO;
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + '/api/25/analytics.json?dimension=dx:' + indicatorId + '&dimension=ou:LEVEL-5;' + orgunitId + '&filter=pe:' + date + ';&displayProperty=NAME',
        success: function (data) {
            for (var i = 0; i < data.rows.length; i++) {
                og = data.rows[i][1];
                xx = data.rows[i][1];
                factype = data.metaData.names[xx];
                data1 = parseInt(data.rows[i][2]);
                seriO = { "name": factype, "y": data1 };
                dataSeriesArrO.push(seriO);
            }

            BlockWise_Pie(dataSeriesArrO, indicatorName);
        },
        error: function (response) {
        }
    });
}

function BlockWise_Pie(dataSeriesArrO, indicatorName) {
    // Build the chart
    Highcharts.chart('div5', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: indicatorName,

        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f} %</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                },
                showInLegend: true
            }
        },
        series: [{
            name: "orgunit",
            data: dataSeriesArrO
        }]
    });

}

// Column Chart for Block wise Distribution

function Block_Column(orgunitId, indicatorId, date, indicatorName) {

    var xaxis = []; //period
    var data1 = []; //values
    var orgunit = '';
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + '/api/25/analytics.json?dimension=dx:' + indicatorId + '&dimension=ou:LEVEL-5;' + orgunitId + '&filter=pe:' + date + '&displayProperty=NAME',
        success: function (data) {
            for (var i = 0; i < data.rows.length; i++) {
                xaxis.push(data.metaData.names[data.rows[i][1]]);
                data1.push(parseInt(data.rows[i][2]));
            }
            Block_ColumnData(orgunit, xaxis, data1, indicatorName);

        },
        error: function (response) {
        }
    });
}

function Block_ColumnData(orgunit, xaxis, data1, indicatorName) {
    var og = orgunit;
    var x = xaxis;
    var y = data1;


    Highcharts.chart('div6', {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: og
        },
        xAxis: {
            categories: x
        },
        yAxis: {
            title: {
                text: 'Indicators value'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: indicatorName,
            data: y
        }]
    });
}



// Map

function State_Map(indicatorId, orgunitId, date, e) {
    // $('.loader').css('display', 'block');
    var coords;
    // var childcord = [];

    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: "" + base + "/api/organisationUnits/" + orgunitId + ".json?fields=id,name,coordinates,children[id,name,coordinates]&paging=false",
        success: function (response) {
            // childcord = [];
            coords = JSON.parse(response.coordinates);

            states_Map(coords, indicatorId, orgunitId, date, e)
        },
        error: function (response) {
        }
    });
}


function states_Map(coords, indicatorId, orgunitId, date, e) {
    var cordinatess = [];
    var orgunitname = [];
    var ogid = [];
    $.ajax({
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        url: base + "/api/organisationUnits/" + orgunitId + ".json?fields=id,name,coordinates&level=1",

        success: function (response1) {

            for (var i = 0; i < response1.organisationUnits.length; i++) {
                orgunitname.push(response1.organisationUnits[i].name);
                ogid.push(response1.organisationUnits[i].id);
                if (response1.organisationUnits[i].coordinates == 'undefined' || response1.organisationUnits[i].coordinates == null) {
                    cordinatess.push([[[]]]);
                }
                else {
                    cordinatess.push(JSON.parse(response1.organisationUnits[i].coordinates));
                }
            }

            State_MapDV(coords, orgunitname, cordinatess, ogid, indicatorId, orgunitId, date, e);
        },
        error: function (response) {
        }
    });
}

function State_MapDV(coords, orgunitname, cordinatess, ogid, indicatorId, orgunitId, date, e) {
    var datavalue = [];
    for (i in ogid) {
        var oggid = ogid[i];
        $.ajax({
            async:false,
            type: "GET",
            dataType: "json",
            contentType: "application/json",
            url: "" + base + "/api/25/analytics.json?dimension=dx:" + indicatorId + "&dimension=ou:LEVEL-5;" + oggid + "&filter=pe:" + date + "&displayProperty=NAME",
            success: function (response) {
                if (response.rows.length == 0) {
                    datavalue.push(null);
                }
                else {
                    for (var i = 0; i < response.rows.length; i++) {
                        datavalue.push(response.rows[i][2]);
                    }
                }

                _SCreateMap(coords, orgunitname, datavalue, cordinatess, e);

            },
            error: function (response) {
            }
        });
    }

}





function _SCreateMap(coords, orgunitname, datavalue, cordinatess, e) {
    // $('.loader').css('display', 'block');


    var lat_long = coords[0];
    var lts = lat_long[0];
    var finalLatLong = lts[115];

    if (e == undefined) {
        var lat = finalLatLong[1];
        var long = finalLatLong[0];
    }
    else {
        var lat = e.latlng.lat;
        var long = e.latlng.lng;
    }

    var mm = {
        "type": "Feature",
        "geometry": {
            "type": "MultiPolygon",
            "coordinates": coords
        },
        "properties": {
            "name": "MultiPolygon",
            key: "block"
        }
    };

    var mp = [];

    for (var i = 0; i < orgunitname.length; i++) {
        mp.push({
            "type": "Feature",
            "id": "" + i + "",
            "properties": {
                "name": orgunitname[i],
                "density": datavalue[i]
            },
            "geometry":
            {
                "type": "Polygon",
                "coordinates": cordinatess[i][0]
            }
        });

    }

    if (map == 'undefined' || map == null) {

        // map.remove();


        var mnp = { "type": "FeatureCollection", "features": mp };

        map = L.map('mapid').setView([lat, long], 12);

        L.tileLayer('?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: '',
            id: 'mapbox.light'
        }).addTo(map);


        // control that shows state info on hover
        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props) {
            this._div.innerHTML = (props ?
                '<b>' + props.name + '</b><br />' + props.density + ''
                : 'Hover over a state');
        };

        info.addTo(map);


        // get color depending on population density value
        function getColor(d) {
            return d == undefined ? '#00BCD4' :
                d > 90 ? '#9C27B0' :
                    d > 90 ? '#008744' :
                        d > 60 ? '#50B948' :
                            d > 30 ? '#FFD302' :
                                '#F85E35';
        }

        function style(feature) {
            return {
                weight: 1.5,
                opacity: 1,
                color: 'white',
                dashArray: '2',
                fillOpacity: 1,
                fillColor: getColor(feature.properties.density)
            };
        }

        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }

            info.update(layer.feature.properties);
        }

        var geojson;

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
            info.update();
        }

        function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }




        geojson = L.geoJson(mm, {
        }).addTo(map);

        geojson = L.geoJson(mnp, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);

        map.fitBounds(geojson.getBounds(), {
            padding: [10, 10]
        });
        // Back Button
        var Button = L.control({ position: 'bottomleft' });

        Button.onAdd = function (map) {
            var div = L.DomUtil.create('div');
            div.innerHTML = "<button onclick='CreateDashboard()'>Back</button>";
            return div;
        }
        Button.addTo(map);
        /***End of Back Button */


        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 30, 60, 90],
                labels = [],
                from, to;


            labels.push('<i style="background: #00BCD4"></i> ' + 'Null Value');


            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + getColor(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(map);

        // $('.loader').css('display', 'none');
    }
    else {
        if (map != 'undefined' || map == null) {
            map.remove();
        }

        var mnp = { "type": "FeatureCollection", "features": mp };
        map = L.map('mapid').setView([lat, long], 12);

        L.tileLayer('?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: '',
            id: 'mapbox.light'
        }).addTo(map);

        // control that shows state info on hover
        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props) {
            this._div.innerHTML = (props ?
                '<b>' + props.name + '</b><br />' + props.density + ''
                : 'Hover over a state');
        };

        info.addTo(map);


        // get color depending on population density value
        function getColor(d) {
            return d == undefined ? '#00BCD4' :
                d > 90 ? '#9C27B0' :
                    d > 90 ? '#008744' :
                        d > 60 ? '#50B948' :
                            d > 30 ? '#FFD302' :
                                '#F85E35';
        }


        function style(feature) {
            return {
                weight: 1.5,
                opacity: 1,
                color: 'white',
                dashArray: '2',
                fillOpacity: 1,
                fillColor: getColor(feature.properties.density)
            };
        }

        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }

            info.update(layer.feature.properties);
        }

        var geojson;

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
            info.update();
        }

        function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }

        geojson = L.geoJson(mm, {
        }).addTo(map);

        geojson = L.geoJson(mnp, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);

        map.fitBounds(geojson.getBounds(), {
            padding: [10, 10]
        });
        // Back Button
        var Button = L.control({ position: 'bottomleft' });

        Button.onAdd = function (map) {
            var div = L.DomUtil.create('div');
            div.innerHTML = "<button onclick='CreateDashboard()' style='background:white;'>Back</button>";
            return div;
        }
        Button.addTo(map);
        /***End of Back Button */

        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 30, 60, 90],
                labels = [],
                from, to;


            labels.push('<i style="background: #00BCD4"></i> ' + 'Null Value');

            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + getColor(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(map);
        // $('.loader').css('display', 'none');
    }




}



///////////////////////////////*******************************************************Code for District Level************************************************************************************* */