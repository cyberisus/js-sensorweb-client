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
var ListSelectionController = {
		
	category : {
		type : "category",
		heading : "Category",
		call : Rest.categories
	},
	
	station : {
		type : "feature",
		heading : "Station",
		call : Rest.features			
	},
	
	phenomenon : {
		type : "phenomenon",
		heading : "Phenomenon",
		call : Rest.phenomena
	},
	
	procedure : {
		type : "procedure",
		heading : "Sensor",
		call : Rest.procedures
	},

	init : function() {
		this.entries = {
			category : [ this.category, this.station, this.phenomenon, this.procedure ],
			sensor : [ this.procedure, this.station, this.category, this.phenomenon ],
			station : [ this.station, this.category, this.phenomenon, this.procedure ],
			phenomenon : [ this.phenomenon, this.category, this.station, this.procedure ]
		};
		// show button to start list selection
		$('[data-action="listSelection"]').show();
		$('[data-action="listSelection"]').click(function() {
			ListSelectionController.open();
		});
	},

	open : function() {
		Modal.show("list-selection");
		$('a[data-toggle="tab"]').on('shown.bs.tab', $.proxy(function(e) {
			var tab = $(e.target).data('tab');
			var accordionId = $('#' + tab + ' .panel-group')[0].id;
			$('#' + tab + ' .panel-group').empty();
			// send request
			this.startRequest(tab, 0, {
				service : Status.get('provider').serviceID
			});
			// build html elements
			$.each(this.entries[tab], function(idx, elem){
				elem.accordion = accordionId;
				elem.collapse = accordionId + elem.type;
				$('#' + tab + ' .panel-group').append(Template.createHtml("list-selection-skeleton", elem));
			});
		}, this));
		$('#selectionList a:first').tab('show');
	},

	startRequest : function(tab, index, data) {
		var entry = this.entries[tab][index];
		var apiUrl = Status.get('provider').apiUrl;
		if (entry != null) {
			var promise = entry.call(null, apiUrl, data);
			promise.done($.proxy(function(result) {
				$('#' + tab + ' #' + entry.collapse + ' .panel-body').empty();
				$.each(result, function(idx, e){
					var elem = null;
					if(e.id != null) {
						elem = e;
					} else {
						elem = e.properties;
					}
					var html = Template.createHtml("list-selection-entry", {
						id : elem.id,
						label : elem.label
					});
					$('#' + tab + ' #' + entry.collapse + ' .panel-body').append(html);
				});
				// close other collapse
				$('#' + tab + ' .collapse.in').collapse('hide');
				// open collapse
				$('#' + tab + ' #' + entry.collapse + '.collapse').collapse('show');
				// onclick
				$('#' + tab + ' #' + entry.collapse + ' .panel-body div').on('click', $.proxy(function(e){
					var label = $.trim(e.target.innerHTML);
					$('#' + tab + ' [href=#' + entry.collapse + ']').text(entry.heading + ' - ' + label);
					$('#' + tab + ' #' + entry.collapse).collapse('hide');
					data[entry.type] = e.target.dataset.id;
					this.startRequest(tab, index + 1, data);
				}, this));
			}, this));
		} else {
			// load ts
			Rest.timeseries(null, apiUrl, data).done(function(result) {
				if(result.length == 1) {
					TimeSeriesController.addTS(result[0]);
					Modal.hide();
					Pages.navigateToChart();
				} else {
					alert("found more than one timeseries");
				}
			});
		}
	}	
};