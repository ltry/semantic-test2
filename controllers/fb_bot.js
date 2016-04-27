var winston = require('winston');
var request = require('request');
var $str = require('stringformat');
var token = "EAAWv3GcO0moBANpu6ZB2vC3zDiyb6Qyi8CY5ulw09vFFueBsW7nkkUQOBXqXId0ewFW2UGhgGtv0ZCMz2WRyFEMFvpeSvVoqYQwRKLVlHOGZCC0OvscA8jI362SSHHkkgh2ZBSdDBP7uYXKdLwr08F8EcCRQss2pc3wKuZCKzGAZDZD";

var sendGenericMessage = function (sender) {
  var messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      winston.log('info', 'Error sending message: ' + error);
    } else if (response.body.error) {
      winston.log('info', 'Error: ' + response.body.error);
    }
  });
}

var sendSimpleMessage = function(sender, text) {
  
  var messageData = {
    text: text
  }
  
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: { id:sender },
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      winston.log('info', 'Error sending message: ' + error);
    } else if (response.body.error) {
      winston.log('info', 'Error: ' + response.body.error);
    }
  });
  
}


// Public Actions
exports.webhook = function (req, res) {
  
  var cmd_text_init = 'cmd@';
  var messaging_events = req.body.entry[0].messaging;
  
  for (i = 0; i < messaging_events.length; i++) {
    
    // Entrada de FB
    var event = req.body.entry[0].messaging[i];
    
    // ID de FB de la persona con quien se esta conversado por chat
    var sender = event.sender.id; 
    
    winston.log('info', event);
    winston.log('info', event.sender);
    
    if (event.message && event.message.text) {
      
      // Texto del chat
      var text = event.message.text;
      winston.log('info', text);
      
      try {
        
        if (text.indexOf(cmd_text_init) > -1) {
          
          var cmd_text = text.substr((text.length - cmd_text.length) * -1);
          var cmd_specific = cmd_text.substring(0, cmd_text.indexOf(':'));
          
          sendSimpleMessage(sender, $str.format('Se ha enviado un comando - completo "{0}"!', cmd_text));
          sendSimpleMessage(sender, $str.format('Se ha enviado un comando especifico "{0}"!', cmd_specific));
          
          continue;
        }
        
        if (text === 'Generic') {
          sendGenericMessage(sender);
          continue;
        }
        
        sendSimpleMessage(sender, text);
        
      }
      catch (e) {
        winston.log('info', e);
      }
    }
    
    if (event.postback) {
      text = JSON.stringify(event.postback);
      winston.log('info', text);
      sendGenericMessage(sender);
      continue;
    }
  }
  res.sendStatus(200);
}