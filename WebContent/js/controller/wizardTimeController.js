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
    
    isLoaded : false,
    
    init: function(){
        $(document).ready(function() {
             // Init some functions
             WizardTimeController.loadTimeRangeSlider();
             WizardTimeController.loadPresets();
             WizardTimeController.initButtons();  
        });
    },
    
    loadTimeRangeSlider: function () {

            var startValue = $.Link({
                    target: '-tooltip-<div class="tooltip startSliderValue"></div>',
                    //target: $("#wizard-time-startPicker")
                    method: function ( value ) {
                            $("#wizard-time-startPicker").val(value);
                            var theDate = new Date(+value);
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
            
            $("#wizard-dateslider").noUiSlider({
                start: 40,
                    range: {              
                        min: timestamp('2010'),
                        max: timestamp('2015')
                    },
                    connect: true,
                    step: 24 * 60 * 60 * 1000, // * 7
                    start: [ timestamp('2011'), timestamp('2013') ],
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
                $('#wizard-time-startSlider-value').text( moment(date.date).format("DD.MM.YYYY") ); 
                $("#wizard-time-startPicker").trigger( "change" );
            });
            
            $('#wizard-time-endPicker').datepicker({
                position:'above',
                autoclose: true,  
                format: 'yyyy-mm-dd'
            
            }).on('changeDate', function (date){               
                $('#wizard-time-endSlider-value').text( moment(date.date).format("DD.MM.YYYY") );
                $("#wizard-time-endPicker").trigger( "change" );
           });
               
       

    },
    
    loadPresets : function() {
        // Better way?
        $(document).ready(function() {       
            var data = TimeController.timeRangeData;             
            $.each( TimeController.timeRangeData, function( key, timespan ) {
                $.each( timespan, function( key, timespan2 ) {
                    $('#wizard-conent-time #presets').append('<a value="' + timespan2.value + '" class="btn btn-default multiline-button preset-btn">' + timespan2.label + '</a>');
                });
            });
            WizardTimeController.initOnChangeMethods();
        });
    },
    
    initButtons : function(){
        $('#wizard-buttons .btnNext').on('click', function() {
            $('.wizard-pager').remove();
            WizardController.loadWizardPhenomenPage();
            WizardController.setActiveNav( $('#wizard-nav li.phenomen') );
        });
        $('#wizard-buttons .btnSkip').on('click', function() {
            //
        });

    },
    
    initOnChangeMethods : function(){   
        // Handle Clicks on presets
        $('#wizard-conent-time #presets a').on('click', function() {
            $('#wizard-conent-time #presets').find('.selected').removeClass('selected');
            $(this).toggleClass('selected');
            
            // Add time range to outline box 
            var selectedPreset = Time.isoTimespan( $(this).attr('value') );
            WizardOutlineController.addDates(selectedPreset);

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
    
   
}

// Create a new date from a string, return as a timestamp.
function timestamp(str){
    return new Date(str).getTime();   
}