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
    
    init : function() {
        var provider = Status.get('provider');
        Rest.phenomena(null, provider.apiUrl, {
            service: provider.serviceID
        }).done($.proxy(this.fillPhenomenaList, this));
        this.initButtons();
    },
    
    fillPhenomenaList : function(results) {
        var selectedPhenomena = WizardOutlineController.selectedPhenomena;
        console.log(selectedPhenomena);
        $.each(results, $.proxy(function(index, elem) {
            var test = Math.floor((Math.random() * 3));
            var check = ($.inArray(elem.label, selectedPhenomena) !== -1) ? "checked" : "";
            
            var phe = '<label><input type="checkbox" ' + check + ' value="' + elem.label + '" hasstations="' + test + '" class="chkPhenomen" data-id="' +elem.id + '"> ' + elem.label +' (+' + test + ')</label>';
            $('#wizard-conent-phenomen .phenomena-list').append(phe);
           
        }));
        this.handleChanges();
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
            } else if( $(this).is(':checked') && $(this).attr('hasstations') != 0 ){
                // add to OutlineBox
            };
        });
        // Clear warning
        $('#wizard-conent-phenomen .phenomena-list input').focusout( function() {
            $('#wizard-conent-phenomen p.wizard-warningbox').remove();
        });
    },
    
    initButtons : function(){
        $('#wizard-buttons .btnNext').on('click', function() {
            $('.wizard-pager').remove();
            WizardController.loadWizardPlacePage();
            WizardController.setActiveNav( $('#wizard-nav li.place') );
        });
        $('#wizard-buttons .btnBack').on('click', function() {
            $('.wizard-pager').remove();
            WizardController.loadWizardTimePage();
            WizardController.setActiveNav( $('#wizard-nav li.time') );
        });
        $('#wizard-buttons .btnSkip').on('click', function() {
            //
        });     
    },
    
    initOnChangePhenomena : function(){
        
        
    }
    
    
    
}


