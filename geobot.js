var me = {};
var you = {};
if (!localStorage.getItem('me')) {
    me.avatar = "./img/user.png";
    me.messages = [];
} else {
    me = JSON.parse(localStorage.getItem('me'));
}

var mapas = [];
var mensagens = [];

if (!localStorage.getItem('you')) {
    you.avatar = "./img/bot.png";
    you.messages = [];
    you.maps = [];
} else {
    you = JSON.parse(localStorage.getItem('you'));
}

function saveLocal() {
    if (storageAvailable('localStorage')) {
        localStorage.setItem('me', JSON.stringify(me));
        localStorage.setItem('you', JSON.stringify(you));
    }
}


var WIT_TOKEN = '5BACP4L2GC3TENO3O6EDTRYNYOCAMD2R';

var localizacao = {};

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function insertMap(options, places, mapConfig, time, date, index, callback) {
    if (time === undefined) {
        time = 0;
    }
    if (date === undefined) {
        date = new Date();
    } else {
        date = new Date(date);
    }
    var id = 'map' + date.getTime();
    control = '<li style="width:100%">' +
        '<div class="msj-rta macro">' +
        '<div class="text texr-r">' +
        '<div id="' + id + '" class="map">' +
        '</div>' +
        '</div>' +
        '<div class="avatar"><img class="img-circle" style="width:100%;" src="' + you.avatar + '" /></div>' +
        '</div>' +
        '</li>';

    $("ul").append(control).scrollTop($("ul").prop('scrollHeight'));
    if (mapConfig === undefined) {
        mapConfig = {
            'zoom': 11,
            'center': localizacao
        }
        you.maps.push({
            'type': 'map',
            'config': mapConfig,
            'data': date,
            'options': options,
            'places': places
        });
        saveLocal();
    }
    var div = document.getElementById(id);
    console.log(id, date, div);
    var mapa = new google.maps.Map(div, {
        'zoom': mapConfig.zoom,
        'center': mapConfig.center
    });
    mapas.push(mapa);
    if (options == 'proximidade') {
        service = new google.maps.places.PlacesService(mapa);
        console.log(places);
        for (place of places) {
            request = {
                'location': localizacao,
                'radius': 1000,
                'type': place.value
            }
            service.nearbySearch(request, function (results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        createMarker(results[i], mapa);
                    }
                }
            });
        }
    }
    if (callback !== undefined) {
        callback(index + 1);
    }
}

function createMarker(place, map) {
    var marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map
    });
}

//-- No use time. It is a javaScript effect.
function insertChat(who, text, time, save, data = new Date(), index, callback) {
    if (time === undefined) {
        time = 0;
    }
    var control = "";
    var date = formatAMPM(data);
    var messageData = {
        'type': 'text',
        'text': text,
        'data': data,
        'who': who
    }
    if (who == "me") {
        if (save === true) {
            me.messages.push(messageData);
            saveLocal();
        }
        control = '<li style="width:100%">' +
            '<div class="msj macro">' +
            '<div class="avatar"><img class="img-circle" style="width:100%;" src="' + me.avatar + '" /></div>' +
            '<div class="text text-l">' +
            '<p>' + text + '</p>' +
            '<p><small>' + date + '</small></p>' +
            '</div>' +
            '</div>' +
            '</li>';
    } else {
        if (save === false) {
            you.messages.push(messageData);
            saveLocal();
        }
        control = '<li style="width:100%;">' +
            '<div class="msj-rta macro">' +
            '<div class="text text-r">' +
            '<p>' + text + '</p>' +
            '<p><small>' + date + '</small></p>' +
            '</div>' +
            '<div class="avatar" style="padding:0px 0px 0px 10px !important"><img class="img-circle" style="width:100%;" src="' + you.avatar + '" /></div>' +
            '</li>';
    }
    setTimeout(
        function () {
            $("ul").append(control).scrollTop($("ul").prop('scrollHeight'));
            if (callback !== undefined) {
                callback(index + 1);
            }
        }, time);
}

function insertMessages(index) {
    if (index === undefined) {
        index = 0;
    }
    if (index < mensagens.length) {
        mensagem = mensagens[index];
        if (mensagem.type === 'text') {
            insertChat(mensagem.who, mensagem.text, 0, false, new Date(mensagem.data), index, insertMessages);
        }
        if (mensagem.type === 'map') {
            console.log(mensagem);
            insertMap(mensagem.options, mensagem.places, mensagem.config, 0, mensagem.data, index, insertMessages);
        }
    }
}

function resetChat() {
    $("ul").empty();
    navigator.geolocation.getCurrentPosition(function (position) {
        localizacao.lat = position.coords.latitude;
        localizacao.lng = position.coords.longitude;
        mensagens = you.messages.concat(me.messages).concat(you.maps);
        mensagens = mensagens.sort(function (a, b) {
            if (new Date(a.data).getTime() < new Date(b.data).getTime()) {
                return -1;
            } else {
                return 1;
            }
        });
        insertMessages();
    });
}

function processaDados(response) {
    if (response.entities.hasOwnProperty('intent')) {
        if (response.entities.intent[0].value == 'proximidade' && response.entities.hasOwnProperty('place')) {
            insertMap('proximidade', response.entities.place);
        }
    }
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

function initBot() {
    $(".mytext").on("keydown", function (e) {
        if (e.which == 13) {
            var text = $(this).val();
            if (text !== "") {
                insertChat("me", text, undefined, true);
                $(this).val('');
                processaTexto(text);
            }
        }
    });

    $('body > div > div > div:nth-child(2) > span').click(function () {
        $(".mytext").trigger({ type: 'keydown', which: 13, keyCode: 13 });
    });


    //-- Clear Chat
    resetChat();

}

function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}


//-- Print Messages
/*insertChat("me", "Hello Tom...", 0);  
insertChat("you", "Hi, Pablo", 1500);
insertChat("me", "What would you like to talk about today?", 3500);
insertChat("you", "Tell me a joke",7000);
insertChat("me", "Spaceman: Computer! Computer! Do we bring battery?!", 9500);
insertChat("you", "LOL", 12000);*/


//-- NOTE: No use time on insertChat.
