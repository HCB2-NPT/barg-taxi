
var map;
var driverMarker;
var cusMarker;
var directionsDisplay;
var directionsService;
var stateDriver = 0;

function customConfirm(msg, duration, okCallback, cancelCallback) {
    var state = false;

    var el = document.createElement("div");
    el.setAttribute("style", "position:absolute;top:40%;left:20%;background-color:black;width:400px;height:100px");
    el.style.alignContent = "stretch";

    var text = document.createElement("p");
    var t = document.createTextNode(msg);
    text.style.backgroundColor = "#7FFF00";
    text.style.alignContent = "center";
    text.style.margin = "10px 10px 10px 10px";
    text.appendChild(t);
    el.appendChild(text);

    var btnOK = document.createElement("input");
    btnOK.type = "button";
    btnOK.value = "OK";
    btnOK.name = "btnOK";
    btnOK.style.marginLeft = "10px";
    btnOK.addEventListener('click', function () {
        state = true;
        okCallback();
        el.parentNode.removeChild(el);
    });

    el.appendChild(btnOK);

    var btnCancel = document.createElement("input");
    btnCancel.type = "button";
    btnCancel.value = "Cancel";
    btnCancel.name = "btnCancel";
    btnCancel.style.marginLeft = "10px";
    btnCancel.addEventListener('click', function () {
        state = true;
        cancelCallback();
        el.parentNode.removeChild(el);
    });

    el.appendChild(btnCancel);

    setTimeout(function () {
        if (!state) {
            cancelCallback();
            el.parentNode.removeChild(el);
        }
    }, duration);
    document.body.appendChild(el);
}

//==================================================
//  google map init

function initialize() {
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 1
    });
    directionsDisplay.setMap(map);
}

//==================================================
//  window events

window.onbeforeunload = function (e) {
    hub.server.driverDisconnect();
    $.connection.hub.stop();
};

//==================================================
//  create hubs

/*set url*/$.connection.hub.url = 'http://localhost:26889/signalr';

var hub = $.connection.myHub;
hub.client.notifyRequest = function (customer) {
    customConfirm(String.format('You have a request from Phone: \'{0}\'! Will you accept this request??\nIf you accept this, Map will be show the location.', customer.Phone),
        6000,
        function () {
            geocode(customer.Location, function (x, y) {
                if (cusMarker) {
                    cusMarker.setMap(null);
                    cusMarker = null;
                }
                cusMarker = new google.maps.Marker({
                    position: { lat: x, lng: y },
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    title: 'Customer',
                    label: 'Customer'
                });
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(driverMarker.getPosition());
                bounds.extend(cusMarker.getPosition());
                map.fitBounds(bounds);
                direction(driverMarker.getPosition(), cusMarker.getPosition());
            });
            hub.server.driverDriving(customer);
        },
        function () {
            hub.server.driverCancel(customer);
        })
}

//==================================================
//  run hubs

$.connection.hub.start().done(function () {
    hub.server.driverConnect();
    $('#ready').on('click', function () {
        if (driverMarker) {
            driverMarker.setMap(null);
            driverMarker = null;
        }
        if (cusMarker) {
            cusMarker.setMap(null);
            cusMarker = null;
        }
        geocode($('#loc').val(), function (x, y) {
            $('#x').val(x);
            $('#y').val(y);
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: x, lng: y },
                zoom: 16
            });
            driverMarker = new google.maps.Marker({
                position: { lat: x, lng: y },
                map: map,
                title: 'My Location',
                label: 'My Location'
            });
            hub.server.driverReady(/*$('#loc').val(), */x, y, $('input[name=cartype]:checked').val());
        });
        stateDriver = 1;
    });
    setInterval(function () {
        if (stateDriver == 1) {
            var x = parseFloat($('#x').val()) + (((Math.random() * 10) - 5) / 10000);
            var y = parseFloat($('#y').val()) + (((Math.random() * 10) - 5) / 10000);
            $('#x').val(x);
            $('#y').val(y);
            if (driverMarker) {
                driverMarker.setPosition(new google.maps.LatLng(x, y));
            }
            hub.server.driverMove(x, y);
        }
    }, 5000);
});

//==================================================
//  google map apis

function geocode(address, callback) {
    $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(address) + '&key=AIzaSyBWb7yvtzkK3Tgpt_-PnWhaW2OhQ99Rv3k',
        dataType: 'json',
        timeout: 30 * 1000
    })
    .done(function (data) {
        callback(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
    })
    .fail(function () {
        alert('Geocode was not successful!')
    })
}

function direction(from, to) {
    var request = {
        origin: from,
        destination: to,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
        }
    });
}