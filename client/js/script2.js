// script2.js

$(document).ready(function () {

    var socket = io.connect();

    emitMsg = function (event_name, event_data) {
        socket.emit(event_name, event_data);

    }

    $("#create_offer").on("click", function () {
        var txt = $("#offer_text").val();
        var img = $("#offer_img").val();

        emitMsg("new_offer", {
            txt: txt,
            img: img
        });


    });



});