k2App = {
 
initDashboardPageCharts: function() {
   if ($('#chartEntriesByGroupVariavel').length != 0 || $('#chartEntriesByGroupFixa').length != 0) {

    var jsonData = $.ajax({
        url: '/entry/2018/11/agg/json',
        dataType: 'json',
      }).done(function (result) {
        // #############DESPESAS VARIAVEIS ############
        dataPreferencesVariavel = {
          series: [
            { value: result.variavel.amountRealized,  className: "barra1" },
            { value: (result.variavel.valueOfGoal-result.variavel.amountRealized), className: "barra2" }
          ]
        };

        var optionsPreferencesVariavel = {
          height: '230px',
          labelInterpolationFnc: function(value) {
            return Math.round(value / result.variavel.valueOfGoal * 100) + '%';
          }
        };

        dataPreferencesFixa = {
          series: [
            { value: result.fixa.amountRealized,  className: "barra2" },
            { value: (result.fixa.valueOfGoal-result.fixa.amountRealized), className: "barra1" }
          ]
        };

        var optionsPreferencesFixa = {
          height: '230px',
          labelInterpolationFnc: function(value) {
            return Math.round(value / result.fixa.valueOfGoal * 100) + '%';
          }
        };

        var chartEntriesByGroupVariavel = Chartist.Pie('#chartEntriesByGroupVariavel', dataPreferencesVariavel, optionsPreferencesVariavel);
        md.startAnimationForLineChart(chartEntriesByGroupVariavel);

        var chartEntriesByGroupFixa = Chartist.Pie('#chartEntriesByGroupFixa', dataPreferencesFixa, optionsPreferencesFixa);
        md.startAnimationForLineChart(chartEntriesByGroupFixa);

    });
  }
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
      let url = "/month-config/"+idSubgroup;

      $.getJSON(url+"/json", function (monthConfig) {
         let form = $("#formUpdate");

         //form.find("input[name='typeofGroup']").prop('checked', false); 
         form.attr("action",url+"/edit?_method=PUT");
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

$(document).ready(function() {
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
       normalizeString: true,
       url: '/subgroup/groups/json',
       removerAcentos: true,
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

  //Salva separado
  $(".btn-save-goal").on("click", function(){
    $(this).parents("tr").find(".has-danger").each(function(){
      var idSubGroup = $(this).find("input[type='hidden']").val();
      var valueOf = $(this).find("input[type='text']").val();

      var url = "/goal/" + idSubGroup + $("#formUpdateMonthConfig").attr("action").split("/goal")[1];
      $("#formUpdateGoal").attr("action",url);
      $("#formUpdateGoal input").attr("value",valueOf)
      $("#formUpdateGoal").submit();
    });
  });

  //Salva favoritos
  $(".btn-favorite-goal").on("click", function(){
    $(this).parents("tr").find(".has-danger").each(function(){
      var idSubGroup = $(this).find("input[type='hidden']").val();
      var url = "/goal/" + idSubGroup + $("#formUpdateMonthConfig").attr("action").split("/goal")[1];
      url = url.replace("edit","favorite");
      $("#formUpdateGoal").attr("action",url);
      $("#formUpdateGoal").submit();
    });
  });

  //###################################
  // GENERAL
  //###################################


  $(".money").maskMoney({prefix:' ', allowNegative: true, thousands:'.', decimal:',', affixesStay: false});

  $(window).keydown(function(event){
    if( (event.keyCode == 13) /*&& (validationFunction() == false)*/ ) {
      event.preventDefault();
      return false;
    }
  });
});


