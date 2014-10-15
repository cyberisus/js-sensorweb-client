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
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var WizardController = {
    
    timespan : [ {from: ''},  {till: ''} ],
    
    init: function () {
        this.startPersonalization();
        this.loadDefaultWizardLayout();
        this.loadWizardTimePage();
        this.loadWizardOutlinePage();
        this.bindNavigation();
        
        
        WizardOutlineController.init();
        
        
        
        
    },
    
    startPersonalization: function() {
        
        // save user data to db
        $.when( Personalization.getUserIp() ).then(function(result) {
            var user = Personalization.createUserObject(result);
            Personalization.saveUserData( user );
        });
        
        
         //get last parameters if user was here before
        if(Personalization.supportLocalStorage){
            if(localStorage["sensorweb-wizard-user"] !== "undefined"){
                var userid = localStorage.getItem("sensorweb-wizard-user"); 
                // Get Object and wait till you get it
                Personalization.getLastSearchFromUser( userid ).done(function(obj){
                    Personalization.lastSearch = obj;
                    // Time
                    WizardTimeController.setLastUserSearch();  
                    WizardTimeController.initOnChangeMethods();
                    
                    
                });
                
            } else{
                console.log('ERR: localStorage > no item');
            }
            
        } else {
            console.log('ERR: localStorage not supported!');
        }
        

    },

    loadDefaultWizardLayout: function() {
        var html = Template.createHtml("wizard-default", null);
	$('#wizard').append(html);
    },
    
    loadWizardTimePage : function (startYear, endYear) {
       
        var html = Template.createHtml("wizard-time", {
            id : "TestID",
            labels : "TestLabel"
	});
        
	$('#wizard-content').append(html);
        WizardTimeController.init(startYear, endYear);
    },
    
    loadWizardPhenomenPage : function () {
        var html = Template.createHtml("wizard-phenomen", {
            id : "TestID",
            labels : "TestLabel"
	});
	$('#wizard-content').append(html);
        WizardPhenomenController.init();
    },
    
    loadWizardPlacePage : function () {
        var html = Template.createHtml("wizard-place", {
            id : "TestID",
            labels : "TestLabel"
	});
	$('#wizard-content').append(html);
        WizardPlaceController.init();
    },
        
    loadWizardResultPage : function () {
        var html = Template.createHtml("wizard-result", {
            id : "TestID",
            labels : "TestLabel"
	});
	$('#wizard-content').append(html);
        WizardResultController.init();
    },
    
    loadWizardOutlinePage : function () {
        var html = Template.createHtml("wizard-outline", {
            id : "TestID",
            labels : "TestLabel"
	});
	$('.wizard-outline-entry').append(html);
    },
    
    bindNavigation : function () {
        $('#wizard-nav li').on('click', function (){
            var page = $(this).attr('name');
            $('.wizard-pager').remove();
            $('#wizard-content').empty();
            
            if(page == "wizard-time"){             
                WizardController.loadWizardTimePage()
                WizardTimeController.setLastUserSearch();
            } else if (page == "wizard-phenomen"){
                WizardController.loadWizardPhenomenPage();
            } else if (page == "wizard-place"){
                WizardController.loadWizardPlacePage();
            }else if (page == "wizard-result"){
                WizardController.loadWizardResultPage();
            }else {
                alert('no more pages');
            }

            //WizardController.setActiveNav( $(this) );
        })
    },
    
    setActiveNav : function(elem) {
        $('#wizard #wizard-nav').find('.active').removeClass('active');
        $(elem).addClass('active');
    },
    
    isLoading : function(bool){
        if(bool){
           $('#wizard-loading').fadeIn('slow');
           /*
           setTimeout( function() {
               $('#wizard-loading').addClass('error');
               $('#wizard-loading').append('<p>An unexpected error occurred!</p>');
               setTimeout( function(){
                   $('#wizard-loading p').remove();
                   $('#wizard-loading').removeClass('error'); 
                   $('#wizard-loading').fadeOut('fast'); 
                    
               },35000);
           }, 10000);
            */
        } else {
           $('#wizard-loading').fadeOut('slow');
        }
      
        
    },
    
    
    
    /*
     *  WARNINGS
     */
    setWarnings : function(mode) {    
        switch(mode){
            case 'wrongDiff':
                    $('#wizard-conent-time').prepend(
                        '<p class="wizard-warningbox">The start date can not be greater then the end date.<p>'
                    );
                    break;
                    
            case 'selectionWithNoStation':
                    $('#wizard-conent-phenomen .phenomena-list').before(
                        '<p class="wizard-warningbox">There are no stations for your selection.<p>'
                    );
                    break;
                    
            case 'no-parameters-selected':
                    $('#wizard-conent-result').before(
                        '<p class="wizard-warningbox">You must select at least a time range and one phenomenon<p>'
                    );
                    break;
                    
            case 'noPhenomenonSelected':
                    $('#wizard-conent-place').before(
                        '<p class="wizard-warningbox">You must select at least one phenomenon<p>'
                    );
                    break;
        }
        
        $('.wizard-warningbox').fadeIn('slow');
        setTimeout(function(){
            $('.wizard-warningbox').fadeOut('slow');
        }, 5000);
        
    },
    
}

jQuery.browser = {};
(function () {
    jQuery.browser.msie = false;
    jQuery.browser.version = 0;
    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
        jQuery.browser.msie = true;
        jQuery.browser.version = RegExp.$1;
    }
})();


