
var map;
var markers = [];
var currentCustomer;
var cusMarker;
var directionsDisplay;
var directionsService;
var geocoder;
var selectedMarker;
var selectedDriver;

//==================================================
//  google map init

function initialize() {
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    geocoder = new google.maps.Geocoder;
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 1
    });
    directionsDisplay.setMap(map);
}

//==================================================
//  window events

window.onbeforeunload = function (e) {
    $.connection.hub.stop();
};

//==================================================
//  create hubs

/*set url*/$.connection.hub.url = 'http://localhost:26889/signalr';

var hub = $.connection.myHub;
hub.client.get_done = function (customer) {
    currentCustomer = customer;
    if (currentCustomer) {
        $('#phone').val(currentCustomer.Phone);
        $('#loc').val(currentCustomer.Location);
        $('#note').val(currentCustomer.Note);
        if (currentCustomer.Type == 0)
            $('#ct0').prop('checked', true);
        else
            $('#ct1').prop('checked', true);
        geocode(currentCustomer.Location, function (x, y) {
            $('#x').val(x);
            $('#y').val(y);
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: x, lng: y },
                zoom: 16
            });
            cusMarker = new google.maps.Marker({
                position: { lat: x, lng: y },
                map: map,
                title: 'Customer',
                label: 'Customer',
                draggable : true
            });
            cusMarker.addListener("dragend", function () {
                $('#x').val(cusMarker.getPosition().lat());
                $('#y').val(cusMarker.getPosition().lng());
                geocodeLatLng(geocoder, map, cusMarker.getPosition());
            })
        });
    } else {
        alert('Empty.');
    }
}
hub.client.getDrivers = function (drivers) {
    deleteMarkers();
    if (drivers.length == 0) {
        //alert('No driver ready for now. Or near this position.');
    } else {
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(cusMarker.getPosition());
        for (var k in drivers) {
            var marker = new google.maps.Marker({
                position: { lat: drivers[k].Lat, lng: drivers[k].Lng },
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                driver: drivers[k]
            });
            if (selectedDriver && selectedDriver.ConnectionId == drivers[k].ConnectionId) {
                selectedMarker = marker;
                selectedDriver = marker.driver;
                selectedMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
            }
            markers.push(marker);
            google.maps.event.addListener(marker, "click", function (event) {
                if (confirm('Do you want to choose that driver?')) {
                    if (selectedMarker) {
                        selectedMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                    }
                    selectedMarker = this;
                    selectedDriver = selectedMarker.driver;
                    this.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                    alert('Enter \'Finish\' button to complete job.');
                }
            });
            bounds.extend(marker.getPosition());
            direction(marker.getPosition(), cusMarker.getPosition());
        }
        map.fitBounds(bounds);
    }
}

//==================================================
//  run hubs

$.connection.hub.start().done(function () {
    $('#get').on('click', function () {
        if (!currentCustomer) {
            hub.server.get();
        } else {
            alert('You need finish current job.');
        }
    });
    $('#finish').on('click', function () {
        hub.server.push2Driver(currentCustomer, selectedMarker.driver);
        location.reload();
    });
    setInterval(function () {
        hub.server.callDrivers($('#x').val(), $('#y').val(), 10000, $('input[name=cartype]:checked').val());
    }, 2000);
});

//==================================================
//  google map apis

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

function geocodeLatLng(geocoder, map, latlng) {
    geocoder.geocode({ 'location': latlng }, function (results, status) {
        if (status === 'OK') {
            //console.log(results);
            if (results[0]) {
                $('#loc').val(results[0].formatted_address);
            } else {
                window.alert('No results found');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}