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
{ group: 'fixa', description: "Moradia", 
    goals:[{
        date: date1,
        valueOfGoal: 1000.50
    }] 
},
{ group: 'fixa', description: "Cuidados Pessoais" },
{ group: 'fixa', description: "Empréstimo"},
{ group: 'variavel', description: "Lazer" },
{ group: 'variavel', description: "Almoço" },
{ group: 'variavel', description: "Lanche" },
{ group: 'variavel', description: "Transporte"},
{ group: 'variavel', description: "Veículo" },
]

var subgruposEmprestimo = [
{ group: 'fixa',    description: "FCO" /*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Previ"/*,    subgroupOf: subgroupSaved._id */},
{ group: 'fixa',    description: "Cooperforte"/*,    subgroupOf: subgroupSaved._id */ },
];


var monthsConfig = [
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
        User.register(new User({username: "thadeu.soares@gmail.com"}), "senha", function(err, user){
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
    subgruposEmprestimo.forEach(function(subgrupo){
        Subgroup.findOne({description: "Empréstimo"}, function(err, foundSubgroup){
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