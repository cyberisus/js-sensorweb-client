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
    
    resultcount : parseInt(0),
    allStations : [],
    results     : [{'onstart': 0, 'onend': 0, 'diff':0}],
    
    init : function() {
        console.log("result " + this.resultcount);
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
        //console.log("onStart: " + this.results.onstart + " / onEnd: " + this.results.onend + " Diff: " + this.results.diff);
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
            $("#wizard-conent-phenomen .phenomena-list input:checked").each(function(){
                phenomena.push($(this).val());
            });
            WizardOutlineController.addPhenomena( phenomena );
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
            // Update result counter
            WizardOutlineController.currentResults = $('.outline-resultnumber').text();
            WizardPhenomenController.results.onend = WizardOutlineController.currentResults;
            var diff = WizardPhenomenController.results.onstart - WizardPhenomenController.results.onend;
            WizardPhenomenController.results.diff = diff;
            // Load new page
            $('.wizard-pager').remove();
            $('#wizard-content').empty();
            WizardController.loadWizardPlacePage();
            WizardController.setActiveNav( $('#wizard-nav li.place') );
        });
        $('#wizard-buttons .btnBack').on('click', function() {
            $('.wizard-pager').remove();
            $('#wizard-content').empty();
            WizardController.loadWizardTimePage();
            WizardController.setActiveNav( $('#wizard-nav li.time') );
        });
        $('#wizard-buttons .btnSkip').on('click', function() {
            //
        });     
    },
    
    initOnChangePhenomena : function(){
        
        
    },
    
    updateCounter : function(opt, nr){   
        var number = parseInt( $('.outline-resultnumber').text());
        var num = parseInt(nr);
        switch (opt) {
            case 'add':
                $('.outline-resultnumber').text(number + num);
                break;
            case 'sub':
                $('.outline-resultnumber').text(number - num);
                break;
        } 
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
        console.log(result);
        var stations = [];
        
        
        //
        WizardPhenomenController.allStations = result.slice();
        WizardOutlineController.selectedStations = result.slice();
        
        $.each(result, function(id, elem) {
            // Load timeseries with phenomen labels
            stations.push(elem.properties.id);
            
            //WizardPhenomenController.allStations.push(elem);
            //WizardOutlineController.selectedStations.push(elem);
        });

        this.loadPhenomena(stations);
        
    },
    
    loadPhenomena : function(stations){
        var apiUrl = Status.get('provider').apiUrl;
        var phenomena = [];
         console.log("loadPhenomena");
        $.each(stations, function(id, elem) {
            // Load timeseries with phenomen labels
            phenomena.push(elem);                  
            Rest.stations(elem, apiUrl).done($.proxy(function(results){
                WizardPhenomenController.loadTsFromStation(results);
            }));
            
        });
        console.log("After laodPhenomena");
        
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
            
            console.log("max count: " + this.resultcount);
            // Update max Results for selection
            //WizardOutlineController.updateResultNumber(this.resultcount);
            //
            // Does not work - why?
            WizardController.isLoading(false);
        
    }

}


