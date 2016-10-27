/**
 * Created by LFZ C11 Hackathon TEAM 2 - Yrenia, Danh, Kevin, Dan, and Taylor on 10/26/2016.
 */
$(document).ready(function(){


    $(".go-btn").click(function(){
        var usersChoice = $('.interests input').val();
        console.log('in the click function');
        youTubeApi($('.interests input').val());
    });

$(document).ready(click_handlers);


function click_handlers(){
    console.log('in click handlers');
    $('button').click(function(){
        console.log('Clicked!');
        var userSearch = $('#search').val();
        var zipSearch = $('#zip').val();
        console.log(userSearch,zipSearch);
        getCategories(userSearch);
        getEvents(userSearch,zipSearch);
    });
}

function getCategories(keyword){
    console.log('get stuff');
    var userKeyword = keyword;
    $.ajax({
        dataType: 'jsonp',
        url: 'https://api.meetup.com/topics?search='+ userKeyword +'&page=20&key=702403fb782d606165f7638a242a&sign=true',
        method: 'get',
        success: function(response){
            console.log(response);
        }
    });
}

function getEvents(keyword,zip){
    var userKeyword = keyword;
    var userZip = zip;
    $.ajax({
        dataType: 'jsonp',
        url: 'https://api.meetup.com/2/open_events?key=702403fb782d606165f7638a242a&zip='+userZip+'&topic='+userKeyword +'&page =20',
        method:'get',
        success: function(response){
            console.log(response);


//YOUTUBE SECTION
// $(".go-btn").click(function(){
//     var usersChoice = $('input.interests').val();
//     console.log('in the click function');
//     youTubeApi($('input.interests').val());
// });

function youTubeApi(usersChoice) {
    console.log('In the youTubeApi function');
    //BEGINNING OF AJAX FUNCTION
    $.ajax({
        dataType:'json',
        data: {
            q: usersChoice,
            maxResults: 20,
        },
        method: 'POST',
        url: "https://s-apis.learningfuze.com/hackathon/youtube/search.php",
        //BEGIN SUCCESS'S ANONYMOUS FUNCTION
        success: function(response){
            if (response) {
                //CONSOLE LOGS FOR TESTING PURPOSES
                console.log('successful connection to YouTube API');

                //LOOP FOR VIDEO ID AND TITLE
                for (var i = 0; i < response.video.length; i++) {
                    var titleText = $('<p>').text(response.video[i].title);

                    //CREATION OF YOUTUBE VIDEO LINK
                    var iframe = $("<iframe>",{
                        width: 360,
                        height: 215,
                        src: "http://www.youtube.com/embed/"+response.video[i].id,
                        frameborder:0,
                        allowfullscreen: true
                    });

                    //ADDING TITLE AND VIDEO LINK TO THE DOM
                    $('div.video-list').append(titleText);
                    $('div.video-list').append(iframe);
                }
            } else {
                //CONSOLE LOG FOR TESTING PURPOSES
                console.log('failure -- Unable to connect to YouTube api');
            }

        }
    });
}