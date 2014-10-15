/*
 * Copyright (C) 2014-2014 52°North Initiative for Geospatial Open Source
 * Software GmbH
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 as published
 * by the Free Software Foundation.
 *
 * If the program is linked with libraries which are licensed under one of
 * the following licenses, the combination of the program with the linked
 * library is not considered a "derivative work" of the program:
 *
 *     - Apache License, version 2.0
 *     - Apache Software License, version 1.0
 *     - GNU Lesser General Public License, version 3
 *     - Mozilla Public License, versions 1.0, 1.1 and 2.0
 *     - Common Development and Distribution License (CDDL), version 1.0
 *
 * Therefore the distribution of the program linked with libraries licensed
 * under the aforementioned licenses, is permitted by the copyright holders
 * if the distribution is compliant with both the GNU General Public
 * License version 2 and the aforementioned licenses.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General
 * Public License for more details.
 */
/*
    Created on : 05.08.2014, 19:00:00
    Author     : Boenki
*/

var WizardPhenomenController =  {
    
    resultcount         : parseInt(0),
    cacheAllStations    : [],
    selectedStaionsInPhe: [],
    results             : [{'onstart': 0, 'onend': 0, 'diff':0}],
    
    init : function() {
        WizardController.isLoading(false);  
        WizardPhenomenController.initNaviLayout();
        WizardController.isLoading(true);
        var provider = Status.get('provider');
        Rest.phenomena(null, provider.apiUrl, {
            service: provider.serviceID
        }).done($.proxy(this.fillPhenomenaList, this));
        this.initButtons();
        
        
        
        // set start counter
        this.results.onstart = WizardOutlineController.currentResults;
        //
        WizardOutlineController.selectedStations = [];
        WizardPhenomenController.selectedStaionsInPhe = [];
        WizardPhenomenController.cacheAllStations = [];

        
        //console.log("onStart: " + this.results.onstart + " / onEnd: " + this.results.onend + " Diff: " + this.results.diff);
        
        
        
    },
    
    initNaviLayout: function(){
        $('#wizard #wizard-nav').find('.active').removeClass('active');
        $('#wizard #wizard-nav').find('.active-last').removeClass('active-last');
        $('#wizard #wizard-nav .time').addClass('active');     
        $('#wizard #wizard-nav .phenomen').addClass('active-last');  
    },
    
    fillPhenomenaList : function(results) {
        var selectedPhenomena = WizardOutlineController.selectedPhenomena;
        $('.outline-resultnumber').text( this.results.onend );
        // Create list
        $.each(results, $.proxy(function(index, elem) {
            //var test = Math.floor((Math.random() * 3));
            var test = 0;
            var check = ($.inArray(elem.label, selectedPhenomena) !== -1) ? "checked" : "";
            
            var phe = '<div><input type="checkbox" ' + check + ' value="' + elem.label + '" hasstations="' + test + '" class="chkPhenomen" data-id="' +elem.id + '"> <label for="' +elem.id + '">' + elem.label +' (+' + test + ')</label></div>';
            $('#wizard-conent-phenomen .phenomena-list').append(phe);
           
        }));
        
        
        
        this.handleChanges();
        this.loadStations();
        
    },
    
    handleChanges : function(){
        // Add all selected phenomena to array and send to OutlineController
        $('#wizard-conent-phenomen .phenomena-list input').change( function() {
            var phenomena = [];
            var phenomenonID = [];
            
            
            $("#wizard-conent-phenomen .phenomena-list input:checked").each(function(){
                phenomena.push($(this).val());
                phenomenonID.push($(this).attr('data-id'));
                console.log("Push change to Arrays");
            });
            WizardOutlineController.addPhenomena( phenomena , phenomenonID);
            console.log(WizardOutlineController.selectedPhenomena);
            console.log(WizardOutlineController.selectedPhenomenaID);
            console.log(WizardOutlineController.currentResults);
            
            // update stations in result
            WizardPhenomenController._createStationObjectsAndSave(WizardPhenomenController.cacheAllStations);
        });
        // Add warning if there are no stations
        $('#wizard-conent-phenomen .phenomena-list input').change( function() {
            if ($(this).is(':checked') && $(this).attr('hasstations') == 0 ){
                WizardController.setWarnings('selectionWithNoStation');
            };
        });
        // Update results in outline box
        $('#wizard-conent-phenomen .phenomena-list input').change( function() {
            if ( $(this).is(':checked') ){
                WizardPhenomenController.updateCounter('add', $(this).attr('hasstations') );
            } else {
                WizardPhenomenController.updateCounter('sub', $(this).attr('hasstations') );
            }
        });
        // Clear warning
        $('#wizard-conent-phenomen .phenomena-list input').focusout( function() {
            $('#wizard-conent-phenomen p.wizard-warningbox').remove();
        });
    },
    
    initButtons : function(){
        $('#wizard-buttons .btnNext').on('click', function() {
            /*
            // Update result counter
            WizardOutlineController.currentResults = $('.outline-resultnumber').text();
            WizardPhenomenController.results.onend = WizardOutlineController.currentResults;
            var diff = WizardPhenomenController.results.onstart - WizardPhenomenController.results.onend;
            WizardPhenomenController.results.diff = diff;
            */
            // Load new page
            $('.wizard-pager').remove();
            $('#wizard-content').empty();
            WizardController.loadWizardPlacePage();
        });
        $('#wizard-buttons .btnBack').on('click', function() {
            $('.wizard-pager').remove();
            $('#wizard-content').empty();
            WizardController.loadWizardTimePage();
            //WizardController.setActiveNav( $('#wizard-nav li.time') );
            WizardTimeController.setLastUserSearch();
        });
        $('#wizard-buttons .btnSkip').on('click', function() {
            //
        });     
    },
    
    initOnChangePhenomena : function(){
        
        
    },
    
    updateCounter: function(opt, nr) {
        var number = parseInt($('.outline-resultnumber').text());
        var num = parseInt(nr);
        switch (opt) {
            case 'add':
                $('.outline-resultnumber').text(number + num);
                break;
            case 'sub':
                $('.outline-resultnumber').text(number - num);
                break;
        }
        // Update result counter
        WizardOutlineController.currentResults = $('.outline-resultnumber').text();
        WizardPhenomenController.results.onend = WizardOutlineController.currentResults;
        var diff = WizardPhenomenController.results.onstart - WizardPhenomenController.results.onend;
        WizardPhenomenController.results.diff = diff;
    },
    
    loadStations : function(){
        console.log("load Stsation");
        var provider = Status.get('provider');
        // get all stations
        Rest.stations(null, provider.apiUrl, {
            service: provider.serviceID
        }).done($.proxy(this.saveStations, this));  

    },
    
    saveStations : function (result){
        // get through stations and take station.id
        
        var stations = [];

        // Qualitativ nicht so viele Informationen wie im PlaceController -> neu s. Zeile 217
        //WizardOutlineController.selectedStations = result.slice();
        
        $.each(result, function(id, elem) {
            // Load timeseries with phenomen labels
            stations.push(elem.properties.id);
            
            //WizardPhenomenController.allStations.push(elem);
            //WizardOutlineController.selectedStations.push(elem);
        });

        this.loadPhenomena(stations);
        
        
    },
    
    _createStationObjectsAndSave: function(results) {
        
        // clear selection
        WizardPhenomenController.selectedStaionsInPhe = [];
        WizardOutlineController.selectedStations = [];
        
        // add new stations
        $.each(results, function(id, stationN) {
            
            

            var tsObj = stationN.properties.timeseries;
            var timeseriesInStation = Object.keys(tsObj);
            // set station
            for (var j = 0; j < timeseriesInStation.length; j++)
            {

                //console.log(results.properties.timeseries[ timeseriesInStation[i] ]);
                //console.log(timeseriesInStation[i]);
                //console.log(results.properties.timeseries[timeseriesInStation[i]].phenomenon.label);

                var phenomenaLabel = stationN.properties.timeseries[timeseriesInStation[j]].phenomenon.label;
                if ($.inArray(phenomenaLabel, WizardOutlineController.selectedPhenomena) !== -1) {
                    // create station object
                    var station = {};
                    station.id = stationN.properties.id;
                    station.coordinates = stationN.geometry.coordinates;
                    station.phenomenID = stationN.properties.timeseries[timeseriesInStation[j]].phenomenon.id;
                    station.phenomenLabel = stationN.properties.timeseries[timeseriesInStation[j]].phenomenon.label;
                    station.tsID = timeseriesInStation[j];
                    station.timeserie = stationN.properties.timeseries[ timeseriesInStation[j] ];
                    // add timeseries to outline
                    WizardOutlineController.selectedStations.push(station);
                    WizardPhenomenController.selectedStaionsInPhe.push(station);
                }
            }

        });
        
    },
    
    loadPhenomena : function(stations){
        var dfd = $.Deferred();
        var apiUrl = Status.get('provider').apiUrl;
        var phenomena = [];
        var count = stations.length;
        var i = 1;
        
            
        $.each(stations, function(id, elem) {
            // Load timeseries with phenomen labels
            phenomena.push(elem);                  
            Rest.stations(elem, apiUrl).done($.proxy(function(results){

                // cache all statios with infos about id, coord and timeseries
                WizardPhenomenController.cacheAllStations.push(results);

                WizardPhenomenController.loadTsFromStation(results);
                
                if(i == count){
                    // looking for a last search
                    WizardPhenomenController.setLastUserSearch();
                    // Create stations objects from cache
                    WizardController.isLoading(false);
                    WizardPhenomenController._createStationObjectsAndSave(WizardPhenomenController.cacheAllStations);
                };
                
                i++;
            }));
            
            
        });

        
        
    },
    
    loadTsFromStation : function(results){
        // get all phenomena

            $.each(results.properties.timeseries, function(id, elem) {
                var phenomID = elem.phenomenon.id;
                var phenomLable = elem.phenomenon.label;
                // Search für checkbox with this label and count++
                var currentNumber = $('#wizard-conent-phenomen .phenomena-list')
                        .find('input[value="' + phenomLable + '"]')
                        .attr('hasstations');
                var number = parseInt(currentNumber) + 1;
                // Update number
                $('#wizard-conent-phenomen .phenomena-list')
                        .find('input[value="' + phenomLable + '"]')
                        .attr('hasstations', number);

                $('#wizard-conent-phenomen .phenomena-list')
                        .find('label[for="' + phenomID + '"]')
                        .text(phenomLable + ' (+' + number + ')');

                this.resultcount = this.resultcount + 1;               
               
            });

    },
    
    
    setLastUserSearch: function(){
        var searchObj = Personalization.lastSearch;  
        if($.isEmptyObject(searchObj) || searchObj.search_id < 1){
            $('.last-selection-phenomenon-container').fadeIn('slow');
            $('#lastphenomenonselection').append('It is your first search.');
        } else{
            $('.last-selection-phenomenon-container').fadeIn('slow');
            var results = searchObj.phenomenon;
            var phenomena = results.split(',');
            $.each(phenomena, function( id, phe ){
                 var pheName = $('#wizard-conent-phenomen .phenomena-list input[data-id="' + phe + '"]').val();
                 $('#lastphenomenonselection')
                         .append('<a value="'+phe+'" class="btn btn-default multiline-button preset-btn">' + pheName + '</a>');
            }); 
            
            
            $('#lastphenomenonselection a').on('click', function() {
                $('#wizard-conent-phenomen .phenomena-list input[data-id="' + $(this).attr('value') + '"]').trigger('click');
                
                /*if(!$('#wizard-conent-phenomen .phenomena-list input[data-id="' + $(this).attr('value') + '"]').is(':checked')){
                    $('#wizard-conent-phenomen .phenomena-list input[data-id="' + $(this).attr('value') + '"]').prop("checked", true).change();
                } */ 
            });
           
        }   
    }

}


