k2App = {
 
initDashboardPageCharts: function() {
   if ($('#dailySalesChart').length != 0 || $('#completedTasksChart').length != 0 || $('#chartEntriesByGroup').length != 0) {

    /* ############## DESPESAS ################ */
    var dataPreferences = {
      labels: ['60%', '16%', '16%', '6%', '2%'],
      series: [60, 16, 16, 6, 2]
    };

    var dataPreferences = {
      //Construir lógica para escolher as cores depois
      series: [{
        value: 80,
        name: "80%",
        className: "barra1",
        meta: "Meta 100",
      },{
        value: 20,
        name: "20%",
        className: "barra2",
        meta: "Meta 100",
      }],
      
    };

    var optionsPreferences = {
      height: '230px'
    };

    var entriesByGroupChart = Chartist.Pie('#chartEntriesByGroup', dataPreferences, optionsPreferences);
    md.startAnimationForLineChart(entriesByGroupChart);

    


   /* ----------==========     Daily Sales Chart initialization    ==========---------- */

    dataDailySalesChart = {
      labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      series: [
        [12, 17, 7, 17, 23, 18, 38]
      ]
    };

    optionsDailySalesChart = {
      lineSmooth: Chartist.Interpolation.cardinal({tension: 0}),
      low: 0,
      high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
      chartPadding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
    }
    var dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);
    md.startAnimationForLineChart(dailySalesChart);



     /* ----------==========     Completed Tasks Chart initialization    ==========---------- */

     dataCompletedTasksChart = {
       labels: ['12p', '3p', '6p', '9p', '12p', '3a', '6a', '9a'],
       series: [
       [230, 750, 450, 300, 280, 240, 200, 190]
       ]
    };

    optionsCompletedTasksChart = {
       lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0
     }),
       low: 0,
        high: 1000, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
        chartPadding: {
           top: 0,
           right: 0,
           bottom: 0,
           left: 0
        }
     }

     var completedTasksChart = new Chartist.Line('#completedTasksChart', dataCompletedTasksChart, optionsCompletedTasksChart);

      // start animation for the Completed Tasks Chart - Line Chart
      md.startAnimationForLineChart(completedTasksChart);

   }
},

initGoogleMaps: function() {
  var myLatlng = new google.maps.LatLng(40.748817, -73.985428);
  var mapOptions = {
   zoom: 13,
   center: myLatlng,
      scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
      styles: [{
       "featureType": "water",
       "stylers": [{
        "saturation": 43
     }, {
        "lightness": -11
     }, {
        "hue": "#0088ff"
     }]
  }, {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{
     "hue": "#ff0000"
  }, {
     "saturation": -100
  }, {
     "lightness": 99
  }]
}, {
 "featureType": "road",
 "elementType": "geometry.stroke",
 "stylers": [{
  "color": "#808080"
}, {
  "lightness": 54
}]
}, {
 "featureType": "landscape.man_made",
 "elementType": "geometry.fill",
 "stylers": [{
  "color": "#ece2d9"
}]
}, {
 "featureType": "poi.park",
 "elementType": "geometry.fill",
 "stylers": [{
  "color": "#ccdca1"
}]
}, {
 "featureType": "road",
 "elementType": "labels.text.fill",
 "stylers": [{
  "color": "#767676"
}]
}, {
 "featureType": "road",
 "elementType": "labels.text.stroke",
 "stylers": [{
  "color": "#ffffff"
}]
}, {
 "featureType": "poi",
 "stylers": [{
  "visibility": "off"
}]
}, {
 "featureType": "landscape.natural",
 "elementType": "geometry.fill",
 "stylers": [{
  "visibility": "on"
}, {
  "color": "#b8cb93"
}]
}, {
 "featureType": "poi.park",
 "stylers": [{
  "visibility": "on"
}]
}, {
 "featureType": "poi.sports_complex",
 "stylers": [{
  "visibility": "on"
}]
}, {
 "featureType": "poi.medical",
 "stylers": [{
  "visibility": "on"
}]
}, {
 "featureType": "poi.business",
 "stylers": [{
  "visibility": "simplified"
}]
}]

};
var map = new google.maps.Map(document.getElementById("map"), mapOptions);

var marker = new google.maps.Marker({
   position: myLatlng,
   title: "Hello World!"
});

    // To add the marker to the map, call setMap();
    marker.setMap(map);
 },


  ////////////////////////////////////////////////////////////////////
  /// MEUS CÓDIGOS
  ////////////////////////////////////////////////////////////////////

   showNotification: function(from, align, type, message) {
   //type = ['', 'info', 'danger', 'success', 'warning', 'rose', 'primary'];

   //color = Math.floor((Math.random() * 6) + 1);

      $.notify({
         icon: "add_alert",
         message: message
      },{
         type: type,
         timer: 3000,
         placement: {
            from: from,
            align: align
         }
      });
   },

   //###############################
   // Subgroup methods
   //###############################
   fillParentGroupList: function(strGroup, form){
      let group = strGroup;
      dropdown = form.find(".parentGroupList")
      dropdown.empty();
      dropdown.append('<option  disabled>Escolha o tipo de despesa</option>');
      dropdown.prop('selectedIndex', 0);

      const url = '/subgroup/groups/'+group+'/json';

      // Populate dropdown with list of provinces
      $.getJSON(url, function (data) {
         $.each(data, function (key, entry) {
            var option = $('<option></option>').attr('value', entry._id).text(entry.description);
            if(form.attr('id') === "formUpdate" && entry._id === form.find(".subgroupOf").text().trim()){
               console.log(form.find(".subgroupOf").text().trim());
               option.attr('selected', true);
            }
            dropdown.append(option);
            
            //console.log("Preenchendo...");
         })
      });
   },
   
   fillEditSubgroupForm: function(idSubgroup){
   // Populate dropdown with list of provinces
      let url = "/subgroup/"+idSubgroup+"/json";

      $.getJSON(url, function (subgroup) {
         let typeofGroup = (typeof subgroup.subgroupOf === 'undefined')?"group":"subgroup";

         let form = $("#formUpdate");

         //form.find("input[name='typeofGroup']").prop('checked', false); 
         form.attr("action","/subgroup/"+subgroup._id+"?_method=PUT");
         form.find(".subgroupOf").remove();
         if(typeofGroup === "subgroup"){
            form.append("<span class='subgroupOf' style='display: none;' >"+subgroup.subgroupOf+"</span>");
         }
         form.find("select[name='subgroup[group]'] option[value='"+subgroup.group+"']").prop('selected', true).change();
         form.find("input[name='subgroup[description]']").val(subgroup.description);
         form.find("input[name='typeofGroup'][value='"+typeofGroup+"']").prop("checked", true).change();
      });
   },


   //###############################
   // Entries methods
   //###############################
   fillEditMonthConfigForm: function(idSubgroup){
   // Populate dropdown with list of provinces
      let url = "/goal/month-config/"+idSubgroup;

      $.getJSON(url, function (monthConfig) {
         let form = $("#formUpdate");

         //form.find("input[name='typeofGroup']").prop('checked', false); 
         form.attr("action",url+"?_method=PUT");
         form.find("input[name='monthConfig[balanceAccountBank]']").val(monthConfig.balanceAccountBankLabel);
         form.find("input[name='monthConfig[balanceCreditCard]']").val(monthConfig.balanceCreditCardLabel);
         $("#monthWorking").text(monthConfig.monthYearLabel);
      });
   }
}

function changeTypeOfGroup(){
   let actualForm = $(this).parents('form');
   let divParentGroupList = actualForm.find(".divParentGroupList");
   let comboParentGroupList = actualForm.find(".parentGroupList");
   let comboGroupType = actualForm.find(".groupType");
   let divDescription = actualForm.find(".divDescription");


   if($(this).val().trim()==="group"){
      comboParentGroupList.addClass( "disabled").prop( "disabled", "disabled" );
         divParentGroupList.hide(200, function(){
         if(actualForm.attr("id") === "formInsert"){
            divDescription.removeClass("col-md-2");
            divDescription.addClass("col-md-4");
         }
      });
   } else {
      comboParentGroupList.removeClass( "disabled").prop( "disabled", false );
      if(actualForm.attr("id") === "formInsert"){
         divDescription.removeClass("col-md-4").addClass("col-md-2");
      }
      divParentGroupList.show(200);
      //k2App.fillParentGroupList(comboGroupType.val(), comboParentGroupList);
   }
}

$("#formInsert input[name='typeofGroup']").change(changeTypeOfGroup);
$("#formUpdate input[name='typeofGroup']").change(changeTypeOfGroup);

//$(".groupType").change(function(){  
$("form select[name='subgroup[group]'").change(function(){  
   k2App.fillParentGroupList($(this).val(), $(this).parents('form')); 
});

$(".btn-edit-subgroup").on("click", function(){
  let idSubGroup = $(this).val().trim();
  k2App.fillEditSubgroupForm(idSubGroup);
});

//###########################
// Entries
//###########################

$('.setup-month-icon').on('click', function () {
  $("#setupMonth").collapse('show');
  $(this).hide(200);
});

$('#setupMonth').on('hidden.bs.collapse', function () {
  $(".setup-month-icon").show(200);
})


$( function() {
    $( "#inlineDatepicker" ).datepicker({
      showOtherMonths: true,
      selectOtherMonths: true,
      dateFormat: "dd/mm/yy",
      showOn: "both",
      buttonImage: "",
      buttonText: "<i class='fa fa-calendar'></i>",
      buttonImageOnly: false,
      dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
      dayNamesMin: ['D','S','T','Q','Q','S','S','D'],
      dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
      monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
      monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      nextText: 'Próximo',
      prevText: 'Anterior'
    });
  } );

$('#txtDescricao').flexdatalist({
     searchContain: true,
     textProperty: '{description} / {subtipo} / {descGrupo}',
     valueProperty: '*',
     minLength: 1,
     focusFirstResult: true,
     selectionRequired: true,
     searchDelay: 300,
     groupBy: 'descGrupo',
     visibleProperties: ["description","descGrupo","subtipo"],
     searchIn: ["description","descGrupo","subtipo"],
     url: '/subgroup/groups/json',
     noResultsText: 'É necessário <a href="/subgroup">incluir</a> esse grupo/subrupo'
     
});

$('#txtDescricao').on('after:flexdatalist.search', function(event, keyword, data, matchedItems) {
    if(matchedItems.length === 0){
      $("#btnAddEntry").removeClass("btn-success");
      $("#btnAddEntry").addClass("btn-disable").prop( "disabled", "disabled" );
    }else{
      $("#btnAddEntry").addClass("btn-success");
      $("#btnAddEntry").removeClass("btn-disable").prop( "disabled", false );
    }
});

$('.btnApontamento').on('click', function() { 
  if($(this).find("input").val().trim()==="in"){
    $( "#tipoApontamento" ).addClass( "disabled").prop( "disabled", "disabled" );
    $( "#tipoApontamento" ).hide(200, function(){
      $(this).parent().parent().removeClass("col-lg-6");
      $(this).parent().parent().next().removeClass("col-lg-6").addClass("col-lg-12");
    }); 
  } else {
    $( "#tipoApontamento" ).removeClass( "disabled").prop( "disabled", false );
    $( "#tipoApontamento" ).parent().parent().addClass("col-lg-6");
    $( "#tipoApontamento" ).parent().parent().next().removeClass("col-lg-12").addClass("col-lg-6");
    $( "#tipoApontamento" ).show(200);
  }
});

$("form select[name='monthConfig[dateSetup]'").change(function(){  
   k2App.fillEditMonthConfigForm($(this).val(), $(this).parents('form')); 
});


//###################################
// GENERAL
//###################################


$(".money").maskMoney({prefix:' ', allowNegative: true, thousands:'.', decimal:',', affixesStay: false});


$(document).ready(function() {
  $(window).keydown(function(event){
    if( (event.keyCode == 13) /*&& (validationFunction() == false)*/ ) {
      event.preventDefault();
      return false;
    }
  });
});


