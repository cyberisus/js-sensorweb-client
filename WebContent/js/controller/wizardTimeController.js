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
    Created on : 05.08.2014, 14:17:13
    Author     : Boenki
*/

var WizardTimeController = {
    
    isLoaded    : false,
    years  : {'startYear' : '', 'endYear': ''},
    
    init: function(startYear, endYear){
        $(document).ready(function() {
            WizardController.isLoading(false);  
             // Init some functions
             WizardTimeController.initNaviLayout();
             WizardTimeController.loadTimeRangeSlider(startYear, endYear);
             WizardTimeController.loadPresets();
             WizardTimeController.initButtons();  
             WizardTimeController.checkOutlineBox();
             
             
             
             
             
            var startDate = moment(WizardOutlineController.selectedDate.from).isValid() ? WizardOutlineController.selectedDate.from : moment("2011-01-01").format("YYYY-MM-DD")
            var endDate = moment(WizardOutlineController.selectedDate.till).isValid() ? WizardOutlineController.selectedDate.till : moment("2013-01-01").format("YYYY-MM-DD")

            $('#wizard-time-startPicker').val(moment(startDate).format("YYYY-MM-DD"));
            $('#wizard-time-endPicker').val(moment(endDate).format("YYYY-MM-DD"));
            $('#wizard-time-startSlider-value').text(moment(startDate).format("DD.MM.YYYY"));
            $('#wizard-time-endSlider-value').text(moment(endDate).format("DD.MM.YYYY"));    
            $("#wizard-time-startPicker").trigger( "change" );
            $("#wizard-time-endPicker").trigger( "change" );
            
            //console.log('+++++++ TIME DIFF ++++++++');
            
            var mode = null;
            var from = "2014-09-21T00:00:00+02:00";
            var till = "2014-09-27T23:59:59+02:00";
            
            // zum testen
            //console.log("Anfang letzer Woche: " + moment().startOf('week').subtract(7, 'days').format('YYYY-MM-DD') );
            //console.log("Ende letzer Woche: " + moment().startOf('week').subtract(1, 'days').format('YYYY-MM-DD') );
            
            // This week
            if( moment(from).format('YYYY-MM-DD') == moment().startOf('week').format('YYYY-MM-DD')  
                    && moment(till).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') )
            {
                mode = "thisweek";
                //console.log('TEST: THIS WE');
            }
            // Last week
            if( moment(from).format('YYYY-MM-DD') ==  moment().startOf('week').subtract(7, 'days').format('YYYY-MM-DD')  
                    && moment(till).format('YYYY-MM-DD') == moment().startOf('week').subtract(1, 'days').format('YYYY-MM-DD') )
            {
                mode = "lastweek";
                //console.log('TEST: Last WE');
            }
            
        });
    },
    
    initNaviLayout: function(){
        $('#wizard #wizard-nav').find('.active').removeClass('active');
        $('#wizard #wizard-nav').find('.active-last').removeClass('active-last');
        $('#wizard #wizard-nav .time').addClass('active-last');     
    },

    
    loadTimeRangeSlider: function (startYear, endYear) {

            var startValue = $.Link({
                    target: '-tooltip-<div class="tooltip startSliderValue"></div>',
                    method: function ( value ) {
                            $("#wizard-time-startPicker").val(value);
                            var theDate = new Date(+value);
                            //var theDate = new Date(+value);
                            $(this).html(
                                    '<strong>Value: </strong>' +
                                    '<span class="pfeil"></span><span  id="wizard-time-startSlider-value">' + moment(theDate).format("DD.MM.YYYY") + '</span>'        
                            );
                            $('#wizard-time-startPicker').val( moment(theDate).format("YYYY-MM-DD") );  
                            $("#wizard-time-startPicker").trigger( "change" );
                    } 
            });
            
            var endValue = $.Link({
                    target: '-tooltip-<div class="tooltip endSliderValue"></div>',
                    method: function ( value ) {
                            $("#wizard-time-endPicker").val(value);                          
                            var theDate = new Date(+value);
                            $(this).html(
                                    '<strong>Value: </strong>' +
                                    '<span class="pfeil"></span><span  id="wizard-time-endSlider-value">' + moment(theDate).format("DD.MM.YYYY") + '</span>'    
                            );
                            $('#wizard-time-endPicker').val( moment(theDate).format("YYYY-MM-DD") ); 
                            $("#wizard-time-endPicker").trigger( "change" );
                    } 
            });
            
            var from = moment(WizardOutlineController.selectedDate.from).isValid() ? WizardOutlineController.selectedDate.from : "2011-01-01T00:00:00+01:00";
            var till = moment(WizardOutlineController.selectedDate.till).isValid() ? WizardOutlineController.selectedDate.till : "2013-01-01T00:00:00+01:00";
            /*
            $('#wizard-time-startPicker').val( moment(from).format("YYYY-MM-DD") ); 
            $('#wizard-time-endPicker').val( moment(till).format("YYYY-MM-DD") ); 
            $("#wizard-time-startPicker").trigger( "change" );
            $("#wizard-time-endPicker").trigger( "change" );
            */
            console.log("TIME: Start-Parameter: " + from + " - " + till);
            
            // Create labels for slider 
            if (startYear == null) startYear = '2010';   
            if (endYear == null) endYear = '2015'; 

            WizardTimeController.years.startYear = startYear;
            WizardTimeController.years.endYear = endYear;

            var years = parseInt(endYear) - parseInt(startYear);
            for(var i = parseInt(startYear); i<= parseInt(endYear); i++ ){
                $('#wizard-conent-time .slider-labels.five-labels').append("<li><span>|</span><div>" + i + "</div></li>");
            }
            $('#wizard-conent-time .slider-labels.five-labels li').css('width', 'calc(100% / ' + years + ')');
            
            
            $("#wizard-dateslider").noUiSlider({
                start: 40,
                    range: {              
                        min: timestamp(startYear),
                        max: timestamp(endYear)
                    },
                    connect: true,
                    step: 24 * 60 * 60 * 1000, // * 7
                    start: [ timestamp(from), timestamp(till) ],
                    serialization: {
                            lower: [ startValue ],
                            upper: [ endValue ],
                        format: {
                            decimals: 0   
                        }
                    }
            });
            
            $('#wizard-time-startPicker').datepicker({
                position:'above',
                autoclose: true,
                format: 'yyyy-mm-dd'
            
            }).on('changeDate', function (date){
                $("#wizard-dateslider").noUiSlider({
                    start: [ timestamp(moment(date.date).format("YYYY-MM-DD")), timestamp($('#wizard-time-endPicker').val()) ]
                 }, true);
                //$('#wizard-time-startSlider-value').text( moment(date.date).format("DD.MM.YYYY") ); 
                //$("#wizard-time-startPicker").trigger( "change" );
            });
            
            $('#wizard-time-endPicker').datepicker({
                position:'above',
                autoclose: true,  
                format: 'yyyy-mm-dd'
            
            }).on('changeDate', function (date){  
                $("#wizard-dateslider").noUiSlider({
                    start: [ timestamp($('#wizard-time-startPicker').val()), timestamp(moment(date.date).format("YYYY-MM-DD")) ]
                 }, true);
                //$('#wizard-time-endSlider-value').text( moment(date.date).format("DD.MM.YYYY") );
                //$("#wizard-time-endPicker").trigger( "change" );
           });
           
           
       
            
            

    },
    
    loadPresets: function() {
        // Better way?
        $(document).ready(function() {
            var data = TimeController.timeRangeData;
            $.each(TimeController.timeRangeData, function(key, timespan) {
                $.each(timespan, function(key, timespan2) {
                    $('#wizard-conent-time #presets').append('<a value="' + timespan2.value + '" class="btn btn-default multiline-button preset-btn">' + timespan2.label + '</a>');
                });
            });

            WizardTimeController.initOnChangeMethods();

        });
    },
    
    initButtons : function(){
        
        $('#wizard-buttons .btnNext').on('click', function() {
            $('.wizard-pager').remove();
            $('#wizard-content').empty();
            WizardController.loadWizardPhenomenPage();
        });
        $('#wizard-buttons .btnSkip').on('click', function() {
            $('.wizard-pager').remove();
            $('#wizard-content').empty();
            WizardController.loadWizardResultPage();
        });
        
        // Add one year to SliderUI
        $('#wizard-conent-time .addOneYearBefore').on('click', function() {       
            $('.wizard-pager').remove();
            $('#wizard-content').empty();
            var newStartYear = parseInt(WizardTimeController.years.startYear) - 1;
            WizardController.loadWizardTimePage(newStartYear.toString(), '2015');
            WizardTimeController.setLastUserSearch();  
        });
        // Add five year to SliderUI
        $('#wizard-conent-time .addFiveYearBefore').on('click', function() {       
            $('.wizard-pager').remove();
            $('#wizard-content').empty();
            var newStartYear = parseInt(WizardTimeController.years.startYear) - 5;
            WizardController.loadWizardTimePage(newStartYear.toString(), '2015');
            WizardTimeController.setLastUserSearch();  
        });

    },
    
    initOnChangeMethods : function(){   

        // Handle Clicks on presets
        $('#wizard-conent-time #presets a, #wizard-conent-time .lastpreset a').on('click', function() {

            var selectedPreset = {'from': '', 'till':'', 'mode': ''};

            if( moment($(this).attr('value')).isValid() ){
                if( $(this).attr('time') == "from" ) {   
                    selectedPreset.from = moment($(this).attr('value'));
                    selectedPreset.till = $('#wizard-time-endPicker').val();
                } else if( $(this).attr('time') == "till" ) {
                    selectedPreset.from = $('#wizard-time-startPicker').val();
                    selectedPreset.till = moment($(this).attr('value'));
                } else {
                    alert("ERROR!")
                }
            } else {
                
                selectedPreset = Time.isoTimespan( $(this).attr('value') );
            }
            // Add time range to outline box 
            WizardOutlineController.addDates(selectedPreset);
            // Update slider and datepicker
            
            //$('#wizard-time-startSlider-value').text(moment(selectedPreset.from).format("YYYY-MM-DD"));
            //$('#wizard-time-endSlider-value').text(moment(selectedPreset.till).format("YYYY-MM-DD"));
            // Update datepicker
            $('#wizard-time-startPicker').val(moment(selectedPreset.from).format("YYYY-MM-DD"));
            $('#wizard-time-endPicker').val(moment(selectedPreset.till).format("YYYY-MM-DD"));
            $("#wizard-time-startPicker").trigger( "change" );
            $("#wizard-time-endPicker").trigger( "change" );
            //Update slider
            $("#wizard-dateslider").noUiSlider({
                    start: [ timestamp(moment(selectedPreset.from).format("YYYY-MM-DD")), timestamp(moment(selectedPreset.till).format("YYYY-MM-DD")) ]
            }, true);
            
            $('#wizard-conent-time #presets, #wizard-conent-time .lastpreset a').find('.selected').removeClass('selected');
            $(this).addClass('selected'); 

        });
        // Handle changes on datepicker
        $('#wizard-time-startPicker').change(function(e) {      
            $('#wizard-conent-time #presets').find('.selected').removeClass('selected');
            // Add time range to outline box
            var timespan = {'from' : $('#wizard-time-startPicker').val() ,'till' : $('#wizard-time-endPicker').val() , 'mode' : ''};
            WizardOutlineController.addDates(timespan);  
            timespan = [];
            WizardTimeController.evaluateDate(e);
        });
        $('#wizard-time-endPicker').change(function(e) {
            $('#wizard-conent-time #presets').find('.selected').removeClass('selected');
            // Add time range to outline box
            var timespan = {'from' : $('#wizard-time-startPicker').val() ,'till' : $('#wizard-time-endPicker').val() , 'mode' : ''};
            WizardOutlineController.addDates(timespan);  
            timespan = []; 
            WizardTimeController.evaluateDate(e);
        });
  
    },
    
    evaluateDate : function (ev) {
        var startdate   = moment($('#wizard-time-startPicker').val());
        var enddate     = moment($('#wizard-time-endPicker').val());
        var diff        = startdate.diff(enddate);
        
        if (diff > 0) {
            WizardController.setWarnings('wrongDiff');
        }
    },
    
    checkOutlineBox : function(){
        var from = WizardOutlineController.selectedDate.from;
        var till = WizardOutlineController.selectedDate.till;
        var mode = WizardOutlineController.selectedDate.mode;
        
        if(mode !== "" && mode !== undefined){
            console.log("MODE gewaehlt: " + mode);
        } else if(from !== "" && till !== ""){
            $('#wizard-time-startPicker').val(moment(from).format("YYYY-MM-DD"));
            $('#wizard-time-endPicker').val(moment(till).format("YYYY-MM-DD"));
            $('#wizard-time-startSlider-value').text(moment(from).format("YYYY-MM-DD"));
            $('#wizard-time-endSlider-value').text(moment(till).format("YYYY-MM-DD"));
        }
    },
    
    
    setLastUserSearch: function(){
        var searchObj = Personalization.lastSearch;
        if($.isEmptyObject(searchObj) || searchObj.search_id < 1){
            $('#lasttimeselection').append('It is your first search.');
        } else {
            $('#lasttimeselection').append('<p class="lastpreset">' + 
                    'From: <a time="from" value="'+ searchObj.time_from + '" class="btn btn-default multiline-button preset-btn">' + 
                    moment(searchObj.time_from).format('YYYY-MM-DD') + '</a> ' + 
                    ' Till: <a time="till" value="'+ searchObj.time_till + '" class="btn btn-default multiline-button preset-btn">' + 
                    moment(searchObj.time_till).format('YYYY-MM-DD') + '</a> ' + 
                    '</p>');
            WizardTimeController.initOnChangeMethods();
        }

        
    }
    
   
}

// Create a new date from a string, return as a timestamp.
function timestamp(str){
    return new Date(str).getTime();   
}