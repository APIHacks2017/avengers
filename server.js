// server.js

//Heroku live logging

// heroku logs -t --app mrbanker
var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore');
var restClient = require('node-rest-client').Client;
var RestClient = new restClient();
const apiai = require("api.ai");

const nlp = new apiai({
  token: "0e40cf129abe4ca9944ce7d7dab35749",
  session: "infinity-db0dc"
});

var decision_tree = require('./data');

app.use(express.static('client'));

app.get('/', function (req, res) {

    res.sendfile('client/infinite.html');

});

app.get('/offers', function (req, res) {

    res.sendfile('client/form.html');

});

app.get('/chatMsg', function (req, res) {

    var q = req["query"]["q"];
    res.send("Hi");

});


io.on('connection', function (socket) {

    properEmit = function (event_name, event_msg, event_links) {
        io.emit(event_name, {
            type: 2,
            msg: event_msg,
            links: event_links

        });
    }

    blogEmit = function (event_name, event_msg, event_links) {
        io.emit(event_name, {
            type: 3,
            msg: event_msg,
            links: event_links

        });
    }

    inputEmit = function (event_name, event_msg, event_links) {
        io.emit(event_name, {
            type: 5,
            msg: event_msg,
            links: event_links

        });
    }


    socket.on('chat', function (data) {
        console.log('hey', data);
        var inp_chat_str = data["msg"];
        
        nlp.text(data['msg'], {sessionId: '123'}).then(function(resp) {
            
            var conv_type =  resp.result.parameters.number;
            console.log('########### conv_type:', conv_type);
            
            if(conv_type == 2){
                var args = {
                    parameters: { city_id: 1 ,count:3},
                    headers: { 
                        "Content-Type": "application/json",
                        'x-Gateway-APIKey': 'd037e4be-e9a1-4ffc-a036-15ba9171baa1'
                    }
                };
                
                RestClient.get('http://52.36.211.72:5555/gateway/Zomato/1.0/collections', args, function (data2, response) {
                    console.log('result ------ ', data2);
                    io.emit('chat-resp', {input: data['msg'], output: data2.collections, type: conv_type});
                });
            } else if(conv_type == 3){
                //FOR NEWS
                var args = {
                    parameters: { source: 'the-hindu'},
                    headers: { 
                        "Content-Type": "application/json",
                        'x-Gateway-APIKey': 'f0a634ff-1fbb-4cf7-b0e6-02ab2443a653'
                    }
                };
                
                RestClient.get('http://52.36.211.72:5555/gateway/NewsAPI/1.0/articles', args, function (data2, response) {
                    
                    console.log('result ------ ', data2);
                    
                    io.emit('chat-resp', {input: data['msg'], output: data2, type:3});

                    // raw response 
                    // console.log(response);
                });
//                 io.emit('chat-resp', {input: data['msg'], output: resp.result.fulfillment.speech});  
            } else if(conv_type == 4) {
                var args = {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-Gateway-APIKey': 'd2bf230a-5e06-4ea9-95cf-85e45d3fcdd6'
                    }
                };
                RestClient.get('http://52.36.211.72:5555/gateway/WeatherUnderground/v1/hourly//q/Abhiramapuram.json', args, function (data2, response) {
                    console.log('result ------ ', data2);
                    io.emit('chat-resp', {input: data['msg'], output: data2.hourly_forecast, type: conv_type});
                });
            } else if(conv_type == 6) {
                console.log('input: ', inp_chat_str);
                var args = {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-Gateway-APIKey': 'd2bf230a-5e06-4ea9-95cf-85e45d3fcdd6'
                    }
                };
                RestClient.get('http://52.36.211.72:5555/gateway/Chennai/v1/train/routes', args, function (data, response) {
                    console.log('route no: ------ ', data.slice(5,15));
                    io.emit('chat-resp', {input: data['msg'], output: data, type: conv_type});
                });
            }
            else if(conv_type == 5) {
                var args = {
                    parameters: { author: 'lee child'},
                    headers: {
                        'Content-Type': 'application/json',
                        'x-Gateway-APIKey': '8bef4dc3-c39c-47e6-8fb7-0ba75a40525d'
                    }
                };
                RestClient.get('http://52.36.211.72:5555/gateway/Books%20API/3.0.0/reviews.json', args, function (data2, response) {
                    console.log('result ------ ', data2);
                    io.emit('chat-resp', {input: data['msg'], output: data2.results, type: conv_type});
                });
            }
            
            else if(conv_type == 7) {
                var args = {
                    
                    headers: {
                        'Content-Type': 'application/json',
                        'x-Gateway-APIKey': '8bef4dc3-c39c-47e6-8fb7-0ba75a40525d'
                    }
                };
                RestClient.get('http://52.36.211.72:5555/gateway/XKCD/1/info.0.json', args, function (data2, response) {
                    console.log('result ------ ', data2);
                    io.emit('chat-resp', {input: data['msg'], output: data2, type: conv_type});
                });
            }
            
            
            else{
                io.emit('chat-resp', {input: data['msg'], output: resp.result.fulfillment.speech});   
            }
            
            
            
            
        
        }).error(function (err) {
            console.log('########### NPL err:', err);
        });
        
        //Aish
        // io.emit('chat-resp', 'asdasd');

        // if (inp_chat_str == "@banker") {

        //     properEmit('chat-resp', "Hi. I am Mr.Banker. What can I help you with?", decision_tree["data"]);

        // } else {
        //     io.emit('chat-resp', {
        //         type: 1,
        //         msg: "" + data["msg"]
        //     });
        // }


    });


    socket.on('node_event', function (data) {

        var inp_chat_str = data["nodeId"];

        var tmp_arr = [];
        var tmp_node_name = "";
        var tmp_node_type = 0;

        var data_arr = decision_tree["data"];


        //find unique id from the tree

        for (item in data_arr) {
            var tmp_obj = data_arr[item];

            if (tmp_obj["node_type"] == 1) {
                tmp_node_type = 1;

                if (tmp_obj["node_id"] == inp_chat_str) {
                    tmp_arr = tmp_obj["child_node"];
                    tmp_node_name = tmp_obj["node_name"];

                    break;
                }


            } else if (tmp_obj["node_type"] == 2) {
                tmp_node_type = 2;

            } else if (tmp_obj["node_type"] == 3) {

                tmp_node_type = 3;

                if (tmp_obj["node_id"] == inp_chat_str) {
                    tmp_arr = tmp_obj["child_node"];
                    tmp_node_name = tmp_obj["node_name"];

                    break;
                }


            } else if (tmp_obj["node_type"] == 5) {

                tmp_node_type = 5;

                if (tmp_obj["node_id"] == inp_chat_str) {
                    tmp_arr = tmp_obj["blog_arr"];
                    tmp_node_name = tmp_obj["node_name"];

                    break;
                }


            }



        }

        if (tmp_node_type == 1) {
            properEmit('chat-resp', "Your Choice: " + tmp_node_name, tmp_arr);
        } else if (tmp_node_type == 2) {
            // properEmit('chat-resp',"Your Choice: "+tmp_node_name,tmp_arr);	
        } else if (tmp_node_type == 3) {
            // properEmit('chat-resp',"Your Choice: "+tmp_node_name,tmp_arr);
            blogEmit('chat-resp', "Your Suggested Article: " + tmp_node_name, tmp_arr);

        } else if (tmp_node_type == 5) {
            inputEmit('chat-resp', "" + tmp_node_name, tmp_arr);
        }




    });

    //new_offer


    socket.on('new_offer', function (data) {

        var offer_text = data["txt"];
        var offer_img = data["img"];
        //        console.log(data);

        //        console.log(offer_text);
        io.emit('chat-resp', {
            type: 4,
            msg: {
                txt: offer_text,
                img: offer_img
            }
        });

        //        console.log({
        //            txt: offer_text,
        //            img: offer_img
        //        });



    });

});


// var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
// var server_host = process.env.YOUR_HOST || '0.0.0.0';

var server = http.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});