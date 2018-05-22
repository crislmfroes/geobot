var me = {};
me.avatar = "https://lh6.googleusercontent.com/-lr2nyjhhjXw/AAAAAAAAAAI/AAAAAAAARmE/MdtfUmC0M4s/photo.jpg?sz=48";

var you = {};
you.avatar = "https://a11.t26.net/taringa/avatares/9/1/2/F/7/8/Demon_King1/48x48_5C5.jpg";

var WIT_TOKEN = '5BACP4L2GC3TENO3O6EDTRYNYOCAMD2R';

var PLACES_TOKEN = 'AIzaSyCTJYc6VhF8Ayc91vjhoFFMi_4t7XWdFFg';

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}            

//-- No use time. It is a javaScript effect.
function insertChat(who, text, time){
    if (time === undefined){
        time = 0;
    }
    var control = "";
    var date = formatAMPM(new Date());
    
    if (who == "me"){
        control = '<li style="width:100%">' +
                        '<div class="msj macro">' +
                        '<div class="avatar"><img class="img-circle" style="width:100%;" src="'+ me.avatar +'" /></div>' +
                            '<div class="text text-l">' +
                                '<p>'+ text +'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '</div>' +
                    '</li>';                    
    }else{
        control = '<li style="width:100%;">' +
                        '<div class="msj-rta macro">' +
                            '<div class="text text-r">' +
                                '<p>'+text+'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '<div class="avatar" style="padding:0px 0px 0px 10px !important"><img class="img-circle" style="width:100%;" src="'+you.avatar+'" /></div>' +                                
                  '</li>';
    }
    setTimeout(
        function(){                        
            $("ul").append(control).scrollTop($("ul").prop('scrollHeight'));
        }, time);
    
}

function resetChat(){
    $("ul").empty();
}

function processaDados(response) {
    console.log(response);
    if (response.entities.hasOwnProperty('intent')) {
        if (response.entities.intent[0].value == 'proximidade' && response.entities.hasOwnProperty('place')) {
            pegaLocaisPróximos(response.entities.place);
        }
    }
}

function pegaLocaisPróximos(places) {
    for (place in places) {
        $.ajax({
            url: 'https://maps.googleapis.com/maps/api/place/nearbysearch',
            data: {
                'key': 'AIzaSyCTJYc6VhF8Ayc91vjhoFFMi_4t7XWdFFg',
                'location': {
                    'latitude': -32.0332,
                    'longitude': -52.0986
                },
                'radius': 1000
            },
            dataType: 'json',
            method: 'GET',
            success: processaLocais
        });
    }
}

function processaLocais(response) {
    console.log(response);
}

function processaTexto(text) {
    $.ajax({
        url: 'https://api.wit.ai/message',
        data: {
            'q': text,
            'access_token': WIT_TOKEN
        },
        dataType: 'jsonp',
        method: 'GET',
        success: processaDados
    });
}

$(".mytext").on("keydown", function(e){
    if (e.which == 13){
        var text = $(this).val();
        if (text !== ""){
            insertChat("me", text);              
            $(this).val('');
            processaTexto(text);
        }
    }
});

$('body > div > div > div:nth-child(2) > span').click(function(){
    $(".mytext").trigger({type: 'keydown', which: 13, keyCode: 13});
})

//-- Clear Chat
resetChat();

//-- Print Messages
/*insertChat("me", "Hello Tom...", 0);  
insertChat("you", "Hi, Pablo", 1500);
insertChat("me", "What would you like to talk about today?", 3500);
insertChat("you", "Tell me a joke",7000);
insertChat("me", "Spaceman: Computer! Computer! Do we bring battery?!", 9500);
insertChat("you", "LOL", 12000);*/


//-- NOTE: No use time on insertChat.
