var mongoose = require("mongoose");
var Subgroup = require("./src/models/subgroup");
var User = require("./src/models/user");
var Entry   = require("./src/models/entry");
var MonthConfig   = require("./src/models/month-config");
var { PaymentMethods } = require('./src/models/entry');

var moment = require('moment');
var numeral = require('numeral');
var ptBr = require('numeral/locales/pt-br.js');

moment.locale('pt-br');
numeral.locale('pt-br');


let date1 = moment().startOf('month').toDate();//moment.parse(moment(now, '01-MM-YYYY'),'DD-MM-YYYY');
let date2 = moment().startOf('month').add(-1,'M').toDate();

var subgroups = [

{ group: 'fixa', description: "Moradia", isFavorite: true,
    goals:[{
        date: date1,
        valueOfGoal: 1000.50
   }] 
},
{ group: 'fixa', description: "Filhos"},
{ group: 'fixa', description: "Empregada doméstica"},
{ group: 'fixa', description: "Serviços Domésticos"},
{ group: 'fixa', description: "Empresa"},
{ group: 'fixa', description: "Tel/Internet"},
{ group: 'fixa', description: "Veículo"},
{ group: 'fixa', description: "Seguro Pessoal"},

{ group: 'variavel', description: "Alimentação" },
{ group: 'variavel', description: "Cuidados pessoais" },
{ group: 'variavel', description: "Lanche" },
{ group: 'variavel', description: "Transporte"},
{ group: 'variavel', description: "Veículo" },
]


let subgruposMoradia = [
{ group: 'fixa',    description: "Água" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Aluguel" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Condomínio" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "IPTU", isSazonal:true /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Luz" /*,    subgroupOf: subgroupSaved._id */},
];

let subgruposTelInternet = [
{ group: 'fixa',    description: "NET" /*,    subgroupOf: subgroupSaved._id */},
];

let subgruposFilhos = [
{ group: 'fixa',    description: "Colégio Filho 1" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Colégio Filho 2" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Inglês" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Piano" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Violino" /*,    subgroupOf: subgroupSaved._id */},
];


let subgruposKarina = [
{ group: 'fixa',    description: "1/3 Férias", isSazonal:true /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "13o Terceiro", isSazonal:true /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Férias", isSazonal:true /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Salário Líquido" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Vale Transporte" /*,    subgroupOf: subgroupSaved._id */},

];

let subgruposDomesticos = [
{ group: 'fixa',    description: "Diarista" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "iDomestica" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "13o Terceiro" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "SIMPLES" /*,    subgroupOf: subgroupSaved._id */},
];

let subgruposEmpresa = [
{ group: 'fixa',    description: "Contador" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Impostos" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Pró-labore" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Tarifas Bancárias" /*,    subgroupOf: subgroupSaved._id */},
];

let subgruposVeiculoFixo = [
{ group: 'fixa',    description: "IPVA" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Licenciamento" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Seguro" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Seguro Obrigatório" /*,    subgroupOf: subgroupSaved._id */},
];

let subgruposSeguro = [
{ group: 'fixa',    description: "Vida 1" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Vida 2" /*,    subgroupOf: subgroupSaved._id */},

];



let monthsConfig = [
{ balanceAccountBank: 0.0, balanceCreditCard: 0.0, dateSetup: date1 },
{ balanceAccountBank: 1.1, balanceCreditCard: 2.2, dateSetup: date2 }

]
var items = [
    { tipoApontamento: PaymentMethods.pf01, data: "01/09", descricao: "Inglês", previsto: numeral("500,00"), realizado: numeral("500,00"), codGrupo: "fixo", situacao: 0},
    { tipoApontamento: PaymentMethods.pf02, data: "05/09", descricao: "Faculdade", previsto: numeral("2.100,00"), realizado: numeral("2.100,00"), codGrupo: "fixo", situacao: 0},
    { tipoApontamento: PaymentMethods.pj04, data: "10/09", descricao: "IPTU", previsto: numeral("1.000,00"), realizado: numeral("1.000,00"), codGrupo: "fixo", situacao: 0},
    { tipoApontamento: PaymentMethods.pf03, data: "01/09", descricao: "Compras mercado", previsto: numeral("1.000,00"), realizado: numeral("1.200,00"), codGrupo: "variavel", situacao: -1},
    { tipoApontamento: PaymentMethods.pf03, data: "02/09", descricao: "Café da manhã", previsto: numeral("3.000,00"), realizado: numeral("3.150,00"), codGrupo: "variavel", situacao: -1},
    { tipoApontamento: PaymentMethods.pf03, data: "03/09", descricao: "Cinema", previsto: numeral("200,00"), realizado: numeral("200,00"), codGrupo: "variavel", situacao: 0},
];
//PRIMEIRO

function step1(){
    User.remove({}, function(err){
        if(err){
            console.log(err);
        }
        User.register(new User({username: "welcome@gmail.com"}), "senha", function(err, user){
            if(err){
                console.log(err);
                req.flash("error", err.message);
                return res.render("register");
            }
            console.log("Usuário criado") ;
            Subgroup.remove({}, function(err){
                if(err){
                    console.log(err);
                }
                console.log("removed all subgroups!");
                    //add a few subgroups
                subgroups.forEach(function(seed){
                    //Define the owner
                    seed.owner = {
                        id: user._id,
                        username: user.username
                    };

                    Subgroup.create(seed, function(err, subgroupSaved){
                        if(err){
                            console.log(err)
                        } else {
                            console.log("added a subgroup");
                        }
                    });
                });

            });
            MonthConfig.remove({}, function(err){
                if(err){
                    console.log(err);
                }
                console.log("removed all monthConfigs!");
                monthsConfig.forEach(function(monthConfig) {
                    monthConfig.owner = {
                        id: user._id,
                        username: user.username
                    };
                    MonthConfig.create(monthConfig, function(err, monthSaved){
                        console.log("Meses incluidos");
                    });
                });
            });
        });
    });
}

//SEGUNDO

function step2(){
    subgruposMoradia.forEach(function(subgrupo){
        Subgroup.findOne({description: "Moradia"}, function(err, foundSubgroup){
            //console.log("======>"+foundSubgroup);
            subgrupo.subgroupOf = foundSubgroup._id;
            Subgroup.create(subgrupo, function(err, subgrupoSalvo){
                foundSubgroup.subgroupsInside.push(subgrupoSalvo)
                foundSubgroup.save();
                console.log("Created new subgroup inside subgroup");
            });
        });
    });
    subgruposTelInternet.forEach(function(subgrupo){
        Subgroup.findOne({description: "Tel/Internet"}, function(err, foundSubgroup){
            //console.log("======>"+foundSubgroup);
            subgrupo.subgroupOf = foundSubgroup._id;
            Subgroup.create(subgrupo, function(err, subgrupoSalvo){
                foundSubgroup.subgroupsInside.push(subgrupoSalvo)
                foundSubgroup.save();
                console.log("Created new subgroup inside subgroup");
            });
        });
    });
    subgruposFilhos.forEach(function(subgrupo){
        Subgroup.findOne({description: "Filhos"}, function(err, foundSubgroup){
            //console.log("======>"+foundSubgroup);
            subgrupo.subgroupOf = foundSubgroup._id;
            Subgroup.create(subgrupo, function(err, subgrupoSalvo){
                foundSubgroup.subgroupsInside.push(subgrupoSalvo)
                foundSubgroup.save();
                console.log("Created new subgroup inside subgroup");
            });
        });
    });
    subgruposKarina.forEach(function(subgrupo){
        Subgroup.findOne({description: "Karina"}, function(err, foundSubgroup){
            //console.log("======>"+foundSubgroup);
            subgrupo.subgroupOf = foundSubgroup._id;
            Subgroup.create(subgrupo, function(err, subgrupoSalvo){
                foundSubgroup.subgroupsInside.push(subgrupoSalvo)
                foundSubgroup.save();
                console.log("Created new subgroup inside subgroup");
            });
        });
    });
    subgruposDomesticos.forEach(function(subgrupo){
        Subgroup.findOne({description: "Serviços Domésticos"}, function(err, foundSubgroup){
            //console.log("======>"+foundSubgroup);
            subgrupo.subgroupOf = foundSubgroup._id;
            Subgroup.create(subgrupo, function(err, subgrupoSalvo){
                foundSubgroup.subgroupsInside.push(subgrupoSalvo)
                foundSubgroup.save();
                console.log("Created new subgroup inside subgroup");
            });
        });
    });
    subgruposEmpresa.forEach(function(subgrupo){
        Subgroup.findOne({description: "Empresa"}, function(err, foundSubgroup){
            //console.log("======>"+foundSubgroup);
            subgrupo.subgroupOf = foundSubgroup._id;
            Subgroup.create(subgrupo, function(err, subgrupoSalvo){
                foundSubgroup.subgroupsInside.push(subgrupoSalvo)
                foundSubgroup.save();
                console.log("Created new subgroup inside subgroup");
            });
        });
    });
    subgruposVeiculoFixo.forEach(function(subgrupo){
        Subgroup.findOne({description: "Veículo", group: 'fixa'}, function(err, foundSubgroup){
            //console.log("======>"+foundSubgroup);
            subgrupo.subgroupOf = foundSubgroup._id;
            Subgroup.create(subgrupo, function(err, subgrupoSalvo){
                foundSubgroup.subgroupsInside.push(subgrupoSalvo)
                foundSubgroup.save();
                console.log("Created new subgroup inside subgroup");
            });
        });
    });

    subgruposSeguro.forEach(function(subgrupo){
        Subgroup.findOne({description: "Seguro Pessoal"}, function(err, foundSubgroup){
            //console.log("======>"+foundSubgroup);
            subgrupo.subgroupOf = foundSubgroup._id;
            Subgroup.create(subgrupo, function(err, subgrupoSalvo){
                foundSubgroup.subgroupsInside.push(subgrupoSalvo)
                foundSubgroup.save();
                console.log("Created new subgroup inside subgroup");
            });
        });
    });

}


module.exports = {
    step1,step2
}
