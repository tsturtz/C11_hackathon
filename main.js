/**
 * Created by LFZ C11 Hackathon TEAM 2 - Yrenia, Danh, Kevin, Dan, and Taylor on 10/26/2016.
 */
$(document).ready(click_handlers);
var global_event = [];
// Danh's Section
var global_zip = null;
var global_venue = [];
var meetUpKey1 = '702403fb782d606165f7638a242a';
var meetUpKey2 = '163736143b31146c5361736d41103459';
/**
 * function geoCoding
 *      converts zip code to longitude and latitude
 *      also calls the getTopics function after success response, if not, it calls our apiThrottled function
 *
 * @param {string} query - user zip code
 */
function geoCoding(search,zip) {
    $.ajax({
        dataType: 'JSON',
        method: 'GET',
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + zip + "&key=AIzaSyDa6lkpC-bOxXWEbrWaPlw_FneCpQhlgNE",
        success: function (response) {
            if(response.status === 'OK')
            {
                var output = response.results[0].geometry.location;
                global_zip = output;
               //console.log("param search is "+ search);
                getTopics(meetUpKey1, search, zip);
            } else {
                var header = "API Error";
                var paragraph = "We cannot process the geocoding API at the moment. Please try again later";
                apiThrottled(header, paragraph);
            }

        }
    })
}
/**
 * function parseEventsForMaps
 *
 * This function loops through our events and parses out bad Open Events that have no venue property objects
 *
 * @param {object} eventObj - event object passed from Meetup Open Events API
 */
function parseEventsForMaps(eventObj) {
    //console.log("Event Object is", eventObj);
    var geocodeArray = [];
    $("#map_left").html("");
    var j = 1;
    var empty_card = $('<div>').addClass('card first-card');
    $("#map_left").append(empty_card);
    for (var i = 0; i < eventObj.length; i++) {

        if (eventObj[i].hasOwnProperty("venue")) {
            //console.log("YES");
            var eventLat = eventObj[i].venue.lat;
            var eventLon = eventObj[i].venue.lon;

            if (eventLat != 0 || eventLon != 0) {
                createEventCard(eventObj[i]);
                global_venue.push(j+") "+eventObj[i].venue.name);

                var addressText = eventObj[i].venue.address_1 + " " + eventObj[i].venue.city + ", " + eventObj[i].venue.state;

                geocodeArray.push({
                    lat: eventLat,
                    lng: eventLon,
                    title: eventObj[i].name,
                    address: addressText,
                    venue: eventObj[i].venue.name
                });
                j++;
            }

        }
    }

    return geocodeArray;
}
// Danh's Section End
/**
 * function click_handlers
 */
function click_handlers() {

    /*
    When the user presses ENTER, it will submit the inputs on the FRONT PAGE
     */

    $(".input-container input").keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            console.log("Front Page Search");
            var userSearch = $('#search').val();
            var userZip = $("#zip").val();
            if (userSearch == '' || userZip == ''){
                Materialize.toast('Please fill in both', 2000, 'white red-text');
                return;
            }
            geoCoding(userSearch, userZip);
            $(".preloader-wrapper").show();
        }
    });

    /*
     When the user presses ENTER, it will submit the inputs on the TOP NAV BAR
     */

    $(".input-nav-container input").keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            console.log("Nav Bar Search");
            var userSearch = $('#nav_search').val();
            var userZip = $("#nav_zip").val();
            if (userSearch == '' || userZip == ''){
                Materialize.toast('Please fill in both', 2000, 'white red-text');
                return;
            }
            geoCoding(userSearch, userZip);
            //youTubeApi(userSearch);
            $(".preloader-wrapper").show();

        }
    });
    /*
        When the user clicks GO , it will submit the inputs on the FRONT PAGE
    */
    $("button#front-go").click(function () {
        var userSearch = $('#search').val();
        var userZip = $("#zip").val();
        if (userSearch == '' || userZip == ''){
            Materialize.toast('Please fill in both', 2000, 'white red-text');
            return;
        }
        geoCoding(userSearch, userZip);
        $(".preloader-wrapper").show();
    });
    /*
     When the user clicks GO , it will submit the inputs on the TOP NAV BAR
     */
    $("button#nav-go").click(function () {
        var userSearch = $('#nav_search').val();
        var userZip = $("#nav_zip").val();
        if (userSearch == '' || userZip == ''){
            Materialize.toast('Please fill in both', 2000, 'white red-text');
            return;
        }
        geoCoding(userSearch, userZip);
        //youTubeApi(userSearch);
        $(".preloader-wrapper").show();
    });

    /*
     When the user clicks on the LOGO it will take it to the first page
     */

    $("#top_search").on("click",".logo-nav",function () {
        //console.log("Logo Clicked!");
        $('#top_search').removeClass('search-top');
        $('#map_left').removeClass('map-left');
        $(".intro-wrapper").animate({top: '0vh'}, 750, function(){

        });
    });

    /*
     When the user clicks on the ROUND CIRCLE BUTTON on the top right off the
     Details Wrapper page, it will move up to the map (using event delegation)
     */

    $(".details-wrapper").on("click",".btn-floating",function () {
        //console.log("Button Up Clicked!");
        $(".intro-wrapper").animate({top: '-100vh'}, 750, function(){

        });
    });

    //Event delegation for card events. On click, dynamically adds specific event info to event description page
    $("#map_left").on("click",".card-content",function () {
        //console.log("HI");
        $(".intro-wrapper").animate({top: '-200vh'}, 750);
        $('.active-card').removeClass('active-card');
        $(this).addClass('active-card');
        //console.log(this);
        createEventDescription(this);
    });
}
/**
 * getTopics - using user-entered interest, generate topics and use first 2 urlkeys
 * @param {string} keyword - user-entered interest
 * @param {number} zipcode - user-entered zipcode
 */
function getTopics(apiKey, keyword, zipcode) {
    //console.log('in get topics ', keyword);
    var meetUpLink;
    var zip = zipcode;
    var userWord = keyword;
    var meetUpKey = apiKey;
    if(keyword === undefined){ //if no topic is passed, do generic search for topics at meetup
        meetUpLink = 'https://api.meetup.com/topics?&page=5&key=' + meetUpKey + '&sign=true';
    }else{ //other use user entered word to search for urlkeys of topics
        meetUpLink = 'https://api.meetup.com/topics?search=' + userWord + '&page=5&key=' + meetUpKey + '&sign=true';
    }
    $.ajax({
        dataType: 'jsonp',
        url: meetUpLink,
        method: 'get',
        success: function (response) {
            //console.log('UrlKeys:', response.results);
            var topics = '';
            if (response['code'] === 'blocked') {
                console.log('First API key is blocked');
                getTopics(meetUpKey2, userWord, zip)
            } else {
                if (response.results.length > 0) { //check the array > 0; is there related topics to user search
                    //console.log('Result is true');
                    for (var i = 0; i < response.results.length; i++) { //for the amount of results, add to string separted by commas
                        //console.log('in for loop');
                        if (i !== response.results.length - 1) { //current topic is not the last in the array of topic returned
                            topics += response.results[i]['urlkey'] + ',';
                        } else {
                            topics += response.results[i]['urlkey']; //last topic, do not add comma
                        }
                    }
                }
                //console.log('Topics', topics);
                getEvents(meetUpKey, topics, zip); //pass the urlkey and zipcode to look for open events
            }
        }
    });
}
/**
 * getEvents - ajax call to meetup api and using urlkey from getTopics gets open events
 * @param {string} keyword - urlkeys from meetup separated by commas
 * @param {string} zip - user-entered zipcode
 */
function getEvents(apiKey, keyword, zip) {
    var userKeyword = keyword;
    var userZip = zip;
    var meetUpKey = apiKey;
    $.ajax({
        dataType: 'jsonp',
        url: 'https://api.meetup.com/2/open_events?key=' + meetUpKey + '&zip=' + userZip + '&topic=' + userKeyword + '&page=20',
        method: 'get',
        success: function (response) {
            var eventList = response.results;
            if(response.results.length > 1) { //check that array containing open events is greater than 1
                //console.log('Event list', eventList);
                //console.log('global zip', global_zip);
                var newEventList = parseEventsForMaps(eventList); //gets latitude and longitude for map
                //console.log("new event list ", newEventList);
                initMap(global_zip, newEventList);
                $(".intro-wrapper").slideDown(750);
                $(".intro-wrapper").animate({top: '-100vh'}, 750, function () {
                    $('#top_search').addClass('search-top');
                    $('#map_left').addClass('map-left'); // added this wed. night - taylor
                    youTubeApi(keyword);
                    $(".preloader-wrapper").hide();
                });
            }else{ //if event is 1 or less, generic topic search urlkey for generic open events
                //getTopics(meetUpKey, undefined, zip);
                $(".preloader-wrapper").hide();
                Materialize.toast('No open events found in your area', 2000, 'white red-text');
            }
        }
    });
}
/**
 * createEventCard - dynamically create and append event info cards
 * @param {object} event - event containing necessary info
 */
function createEventCard(event){
    //console.log('Event card', event);
    var eventId = global_event.length;
    global_event.push(event); //push events used for cards to array for use on event description page
    var eventName = event['name'];
    var date = new Date(event['time']);
    date = parseTime(date);
    var venueName = event.venue.name;
    var address = event.venue.address_1;
    var city = event.venue.city;
    //create html elements with classes
    var $title = $('<span>', {
        class: 'card-title',
        text: eventName
    });

    var $date = $('<p>', {
        text: date
    });
    var $venue = $('<p>', {
        text: venueName
    });
    var $address = $('<p>', {
        text: address + ' ' + ' ' + city
    });
    //append elements to the dom
    var $cardContent = $('<div>', {
        class: 'card-content white-text',
        id: eventId
    }).append($title, $date, $venue, $address);
    var $card = $('<div>', {
        class: 'card red lighten-1'
    }).append($cardContent);
    $('#map_left').append($card);
}
/**
 * parseTime - change date into more readable format
 * @param {object} date - event's date object
 * @returns {string|*} - contains event's date and time
 */
function parseTime(date){
    var day = date.toDateString();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var newDate;
    var amOrPm;
    //console.log('day ', day);
    //24hr format to 12hr format
    if(hour > 12){
        hour -= 12;
        amOrPm = 'pm';
    }else{
        amOrPm = 'am'
    }
    if(minutes === 0){
        minutes = '00';
    }
    //creates date string
    newDate = day + ' ' + hour + ':' + minutes + ' ' + amOrPm;
    //console.log(newDate);
    return newDate;
}


$('#map_left').on('click','.card', function(){
    var $eventName=$('<h1>',{
        text:event[i]['name']
    });
    var $groupName=$('<h5>',{
        text:event[i].group.name
    });
    var $eventDate= $('<h4>',{
        text: new Date(event[i]['time'])
    });
    var $eventAddress= $('<h4>',{
        text:event[i].venue.address_1 + ' ' + event[i].venue.city + ', ' + event[i].venue.state
    });
    var $eventDescription=$('<p>',{
        text:event[i]['description']
    });
    var $eventDetail=$('<div>',{
        class:"event-details"
    }).append($eventName,$groupName,$eventDate,$eventAddress,$eventDescription);

    var $eventPage=$('<div>',{
        class:'details-wrapper white',
    }).append($eventDetail);

});

// function missingPropertyValues(objName) {
//     for(var i=0 in event) {
//         console.log(objName[i]);
//     }
// }


//API IS BEING THROTTLED FUNCTION
function apiThrottled(heading,message) {
    $('#error_modal .modal-content h4').text(heading);
    $('#error_modal .modal-content p').text(message);
    $('#error_modal').openModal();
};


//YOUTUBE SECTION -- DANs
function youTubeApi(usersChoice) {
    missingPropertyValues(event);
    //usersChoice = usersChoice + ' Meetup';
    console.log('In the youTubeApi function');
    $('div.video-list').html('');
    //BEGINNING OF AJAX FUNCTION
    $.ajax({
        dataType: 'json',
        data: {
            q: usersChoice,  // this is used as the parameter for the function
            maxResults: 5
        },
        method: 'POST',
        url: "https://s-apis.learningfuze.com/hackathon/youtube/search.php",
        //BEGIN SUCCESS'S ANONYMOUS FUNCTION
        success: function (response) {
            var relatedVideos = $('<h4>Related Videos</h4>');
            var videoList = $('div.video-list').append(relatedVideos);
            if (response.success === true) {
                //CONSOLE LOGS FOR TESTING PURPOSES
                console.log('successful connection to YouTube API');

                //LOOP FOR VIDEO ID AND TITLE
                for (var i = 0; i < response.video.length; i++) {
                    //THE BELOW CODE
                    var iframeDiv = $('<div>').addClass('video-container card');

                    //CREATION OF YOUTUBE VIDEO LINK
                    var iframe = $("<iframe>", {
                        src: "https://www.youtube.com/embed/" + response.video[i].id,
                        frameborder: 0,
                        allowfullscreen: true
                    });
                    iframe.appendTo(iframeDiv);
                    //ADDING VIDEO LINK TO THE DOM
                    //var videoList = $('div.video-list').append(relatedVideos);
                    videoList.append(iframe);
                    console.log('This is the new div and class ', iframeDiv);
                }
            } else {
                //CONSOLE LOG FOR TESTING PURPOSES
                console.log('failure -- Unable to connect to YouTube api');
                //CALLING A FUNCTION FOR IF THE API IS DOWN
                var youTubeFailHeading = 'Oh no!';
                var youTubeFailMessage = 'This is rare, but we are unable to pull any videos at this time.' +
                    'Please, try again later.';
                apiThrottled(youTubeFailHeading,youTubeFailMessage);
            }
        }
    });
}
/**
 * createEventDescription - dynamically add event info to more event info page'
 * @param {object} eventCard - contains event information
 */
function createEventDescription(eventCard) {
    $('.event-details').html('');
    var cardClicked = eventCard;
    var cardId = $(cardClicked).attr('id'); //finds card id to look for matching event
    //console.log('Card Clicked', cardId);
    cardEvent = global_event[cardId];
    //console.log('This Event ', cardEvent);
    var date = new Date(cardEvent['time']);
    date = parseTime(date); //get readable date format
    //create elements with event information and classes for styling
    var $eventName=$('<h3>',{
        class: 'red-text',
        text: cardEvent['name']
    });
    var $groupName=$('<h6>',{
        text: cardEvent.group.name
    });
    var $eventDate= $('<h5>',{
        class: 'red-text',
        text: date
    });
    var $eventAddress= $('<h5>',{
        class: 'red-text',
        text: cardEvent.venue.address_1 + " "+ cardEvent.venue.city + " "+ cardEvent.venue.state
    });
    var $eventURL=$('<a/>',{
        href:cardEvent['event_url'],
        text: 'Event Link',
    });
    var $eventDescription=$('<p>',{
        html: cardEvent['description']
    });
    //attach elements to dom
    $('.event-details').append($eventName,$groupName,$eventDate,$eventAddress, $eventURL,$eventDescription);
}
