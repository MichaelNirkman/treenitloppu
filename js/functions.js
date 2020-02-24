function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('time').innerHTML =
        h + ":" + m + ":" + s;
    var t = setTimeout(startTime, 500);
}

function checkTime(i) {
    if (i < 10) { i = "0" + i }; // add zero in front of numbers < 10
    return i;
}

function getBuses(amnt, elem, station) {
    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '{  stop(id: ' + station + ') {    name      stoptimesWithoutPatterns(numberOfDepartures: ' + amnt + ') {     scheduledDeparture  realtimeDeparture  serviceDay   headsign trip{route{shortName}}}  }}' }),
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            var table = document.createElement("table");
            table.id = elem;
            table.className = "bustable"
            var departures = myJson.data.stop.stoptimesWithoutPatterns;
            for (i = 0; i < departures.length; i++) {
                var departure = departures[i];
                var row = table.insertRow(i);
                if (i % 2 != 0) {
                    row.className = "tablerow blue";
                } else {
                    row.className = "tablerow darkerblue";
                }
                var busNumber = row.insertCell(0);
                busNumber.className = "busNumber niceText";
                var routeName = row.insertCell(1);
                routeName.className = "routeName niceText";
                var time = row.insertCell(2);
                time.className = "bustime niceText";
                var timeSecs = departure.realtimeDeparture;
                if (timeSecs > departure.scheduledDeparture) {
                    time.className += " late";
                }
                var curdate = new Date();
                var date = new Date(departure.serviceDay * 1000 + (timeSecs * 1000));
                var date_diff = date - curdate;
                var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
                var convertedTime = new Date(date - tzoffset).toISOString().substr(11, 5);
                if (date_diff < 1500000) {
                    var diffminutes = new Date(date_diff).getMinutes()
                    convertedTime = diffminutes.toString() + " min"
                    if (diffminutes == 0) {
                        convertedTime = "<1 min";
                    }
                }
                busNumber.innerHTML = departure.trip.route.shortName;
                routeName.innerHTML = departure.headsign.split(" via")[0];
                time.innerHTML = convertedTime;
            }
            var oldtable = document.getElementById(elem);
            oldtable.parentNode.replaceChild(table, oldtable);
        });
}

function initializeData(ms = 15000) {
    // When ready...
    window.addEventListener("load", function() {
        // Set a timeout...
        setTimeout(function() {
            // Hide the address bar!
            window.scrollTo(0, 1);
        }, 0);
    });
    navigator.serviceWorker.register('sw.js', {
        scope: 'https://michaelnirkman.github.io/treenitloppu/'
    });
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('sw.js').then(function(registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function(err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
    startTime();
    updateData();
    setInterval(function() {
        updateData()
    }, ms);
}

function updateData() {
    getBuses(5, "malminkartanontie", '"HSL:1320111"');
    getBuses(5, "vihdintie", '"HSL:1320294"');
}