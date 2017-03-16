"use strict";

function authorize() {
    swal({
        title: "Please sign in",
        text: '<br/><span id="my-signin2"></span>',
        type: "info",
        html: !0,
        showConfirmButton: !1
    })
}

function onSuccess(e) {
    var t = e.getBasicProfile();
    token = e.getAuthResponse().id_token, verifyUser(token, t.ofa)
}

function onFailure(e) {
    swal({
        title: "Unauthorized",
        text: "Sorry, we can't verify who you are. " + e,
        type: "Error",
        allowEscapeKey: !1,
        allowOutsideClick: !1,
        showConfirmButton: !0
    })
}

function renderButton() {
    gapi.signin2.render("my-signin2", {
        scope: "profile email",
        width: 240,
        height: 50,
        longtitle: !0,
        theme: "dark",
        onsuccess: onSuccess,
        onfailure: onFailure
    })
}

function verifyUser(e, t) {
    var o = $.ajax({
        url: apiEndpoint + "?verifyUser=" + e + "&userDetails"
    });
    o.done(function(e) {
        if (e.hasOwnProperty("error_description")) swal({
            title: "Error",
            text: e.error_description,
            type: "error",
            allowEscapeKey: !1,
            allowOutsideClick: !1,
            showConfirmButton: !0
        });
        else {
            var o = void 0 !== t && 0 !== t ? "Hello " + t + "!" : "Hello!";
            swal({
                title: o,
                text: "You are authorized. Good job!",
                type: "success",
                timer: 2e3,
                allowEscapeKey: !0,
                allowOutsideClick: !0,
                showConfirmButton: !1
            }), $("form#list-form").prepend('<label class="textfield"><span class="textfield__label ">Select the persons who will recive the text message</span></label>')
        }
    }), o.fail(function(data) {
        console.log(data)
        swal({
            title: "Error",
            text: "XHR Request failed. Please try again later.",
            type: "error",
            allowEscapeKey: !1,
            allowOutsideClick: !1,
            showConfirmButton: !0
        })
    })
}
WebFont.load({
    typekit: {
        id: "fvc2tgi"
    }
});
var token = null,
    apiEndpoint = window.location.href + 'sms.php';

authorize(), $("#send").on("click", function(e) {
    e.preventDefault();
    var t = $(":checkbox").serializeArray(),
        o = $('textarea[name="message"]').val();
        o = encodeURIComponent(o);

    t.length > 0 && o.length > 0 ? swal({
        title: "Do you really want to send those messages?",
        text: "You are about to send a lot of text messages...",
        type: "info",
        allowEscapeKey: !1,
        allowOutsideClick: !1,
        showConfirmButton: !0,
        showCancelButton: !0,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        cancelButtonText: "No"
    }, function(e) {
        var requestURL = apiEndpoint + "?verifyUser=" + token + "&sendMessages&recipients=" + JSON.stringify($(":checkbox").serializeArray()) + "&message=" + o;
            //requestURL = encodeURIComponent(requestURL);

        console.log(requestURL);
        $.ajax({
            url: requestURL
        }).done(function(e) {}).fail(function(e) {})
    }) : swal({
        title: "No recipients",
        text: "No recipients specied. Please select <b>at least one recipient</b>.",
        type: "warning",
        html: !0,
        timer: 4e3,
        allowEscapeKey: !1,
        allowOutsideClick: !1,
        showConfirmButton: !0
    })
});


var lists = readLocal('SMS-tool');

$.each(lists, function(index, el) {
    // Place all uploaded lists in drop down
    $('#list-picker').append('<option value="'+ index +'">'+ index +'</option>');
    // console.log(el);
    // console.log(index);
});

$(document).ready(function() {

    readLocal('SMS-tool');

    $(document).on("click", "#toggle", function(e) {
            e.preventDefault(), $(":checkbox").each(function() {
            this.checked = !this.checked
        });
    });

    $('form#upload-form').submit(function(event) {
        event.preventDefault();

        $('input[type=file]').parse({
            config: {
                complete: function(results, file) {
                    
                    // console.log('This file done:', file, results);

                    var stringifiedRows = stringifyRow(results.data);

                    if(updateLocal('SMS-tool', file.name, stringifiedRows)){

                        $('#list-picker').append('<option>'+ file.name +'</option>');

                        alert('Listan är uppladdad!');
                    }
                }
            },
            complete: function() {
                
            }
        });
    });

    $('form#list-picker-form').submit(function(event){
        event.preventDefault();

        var selectedListName = $('#list-picker').val();

        if (selectedListName === '') {

            alert('Du måste välja en lista!');

            return;
        }

        lists = readLocal('SMS-tool');

        var selectedList = JSON.parse(lists[selectedListName]);

        console.log(selectedList);

        $('#recipients').html('');

        // Key = position, value = the array
        $.each(selectedList, function(k, v){
            $("#recipients").append('<label class="checkbox"><input type="checkbox" name="' + v[0] + '" value="' + v[2] + '" data-name="' + v[0] + '" data-number="' + v[2] + '" /><span class="checkbox__label">' + v[0] + ' ' + v[1] + "</span></label>");
        });

        $("#recipients").append('<span id="toggle" class="btn btn--secondary" data-toggle="false">Toggle</span>');

    });

    $('#delete-list-btn').click(function(event) {
        event.preventDefault();

        var selectedListName = $('#list-picker').val();

        if (selectedListName === '') {

            alert('Du måste välja en lista!');

            return;
        }

        if (!confirm('Vill du radera '+ selectedListName + '?')) {

            return;
        }

        $('#list-picker').val('');

        deleteLocal('SMS-tool', selectedListName);

        $('option[value="'+ selectedListName +'"]').remove();

        lists = readLocal('SMS-tool');

    });

});

// Saves stringified object to selected position in local storage
function saveLocal(name, obj) {
    localStorage.setItem(name, JSON.stringify(obj));
}

// Get and return parsed object from selected position in local storage
function readLocal(name) {
    var data = JSON.parse(localStorage.getItem(name));

    if (data === null) {
        data = {};
    }

    return data;
}

// Find and update keys and values in object
function updateLocal(name, k, v) {
    var data = readLocal(name);

    if (data === null) {
        data = {};
    }

    if(data.hasOwnProperty(k)){
        if(!confirm('Listan finns redan, vill du ersätta den?')){
            return false;
        }
    }

    data[k] = v;

    saveLocal(name, data);

    return true;
}

function deleteLocal(name, obj) {

    var li = readLocal(name);

    delete li[obj];

    saveLocal(name, li);

}

function stringifyRow(row){
    var output = JSON.stringify(row);

    return output;
}