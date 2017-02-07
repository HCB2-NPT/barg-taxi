
var map;
var markers = [];
var directionsDisplay;
var directionsService;

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
    if (confirm(String.format('You have a request from Phone: \'{0}\'! Will you accept this request??\nIf you accept this, Map will be show the location.', customer.Phone))) {
        geocode(customer.Location, function (x, y) {
            markers.push(new google.maps.Marker({
                position: { lat: x, lng: y },
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                title: 'Customer',
                label: 'Customer'
            }));
            var bounds = new google.maps.LatLngBounds();
            for (var k in markers) {
                bounds.extend(markers[k].getPosition());
            }
            map.fitBounds(bounds);
            if (markers.length >= 2) {
                direction(markers[0].getPosition(), markers[1].getPosition());
            }
        });
        hub.server.driverDriving(customer);
    } else {
        hub.server.driverCancel(customer);
    }
}

//==================================================
//  run hubs

$.connection.hub.start().done(function () {
    hub.server.driverConnect();
    $('#ready').on('click', function () {
        deleteMarkers();
        geocode($('#loc').val(), function (x, y) {
            $('#x').val(x);
            $('#y').val(y);
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: x, lng: y },
                zoom: 16
            });
            markers.push(new google.maps.Marker({
                position: { lat: x, lng: y },
                map: map,
                title: 'My Location',
                label: 'My Location'
            }));
            hub.server.driverReady($('#loc').val(), x, y, $('input[name=cartype]:checked').val());
        });
    });
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

function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function clearMarkers() {
    setMapOnAll(null);
}

function deleteMarkers() {
    clearMarkers();
    markers = [];
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