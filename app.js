var axios = require('axios');
var tracery = require('tracery-grammar');
// var fs = require('fs');

var Clarifai = require('clarifai');

var Twit = require('twit');
var config = require('./config.js');

var poem;
var picture;
var tags;

var app = new Clarifai.App(
  '',
  ''
);

// Craft the response

function parseResponse(resp) {
  tags = [];
  if (resp.statusText === 'OK') {
    var results = resp.data.outputs[0].data.concepts;
    console.log(results[0].name)
    for (i=0; i<19; i++) {
      tags.push(results[i].name);
    }
    console.log(tags);
    // tags = results[0].result.tag.classes;
  } else {
    console.log('Sorry, something is wrong.');
  }

  // ALL THE TRACERY GRAMMAR AND STUFF

  var syntax = {
  "sentence": ["🔮 #thinking#. 🔮 #seeing# #fortune#. #emojis#"],
  "noun": tags,
  "thinking": [
    "Let me think",
    "Hmmm",
    "I'm thinking about it",
    "Gimme a sec",
    "Ooooooookay",
    "Wow okay",
    "Okay let me look",
    "Hmm let me think",
    "That's a tough one",
    "Well that's tricky"
    ],
  "seeing": [
    "So I'm seeing a #noun# or maybe it's a #noun#.",
    "It's hazy but I think it's a #noun# or maybe a #noun#.",
    "I'm starting to see a #noun#. Perhaps a #noun#?",
    "I'm almost certain it's a #noun# or maybe a #noun#.",
    "I think I'm seeing a #noun#? Or could it be a #noun#?",
    "It's a #noun# - no wait a #noun#."
  ],
  "fortune": [
    "Watch for new projects and new beginnings",
    "Prepare to take something on faith",
    "Something new comes your way; go for it",
    "A powerful man may play a role in your day",
    "A mysterious woman will arrive",
    "A sexual secret may surface",
    "Someone knows more than he or she will reveal",
    "Pregnancy is in the cards",
    "An opportunity to be involved in luxurious sexuality is coming",
    "Beware a tendency toward addiction",
    "A father figure arrives",
    "A new employer or authority figure will give you orders",
    "Expect discipline or correction in the near future",
    "Expect to be caught in a misdeed and punished accordingly",
    "Pray for forgiveness and confess wrongdoings",
    "A more experienced man will come into your life",
    "Victory is a certainty",
    "Move ahead with all plans",
    "Beware the jealousy of others",
    "Your self-control will be tested",
    "A woman will seek to change her partner or lover",
    "You are a strong, capable person",
    "A period of loneliness begins",
    "One partner in a relationship departs",
    "A search for love or money proves fruitless",
    "Some events are in the hands of heaven",
    "You've lived through this before",
    "What happened then?",
    "A legal verdict will be rendered soon",
    "Someone is making a decision",
    "You need to get the facts",
    "A traitor is revealed",
    "One of your friends is working against you",
    "Change your ways or suffer the consequences",
    "A relationship or illness ends suddenly",
    "Limit travel and risk-taking",
    "General gloom and doom",
    "Someone's using drugs or alcohol to excess",
    "It's time to get back on that diet",
    "Adultery and unfaithfulness",
    "A string of extremely bad luck is coming your way",
    "Beware evil influences and wolves in sheep's clothing",
    "Impending disaster",
    "Cancel plans and reverse decisions",
    "Someone wants to take you down a notch or two",
    "Don't hold back; say what you really mean",
    "Get an astrology chart drawn up",
    "Someone is a little too starstruck",
    "What's happening now has long been fore-ordained",
    "Watch for problems at the end of the month",
    "Someone you know needs to howl at the moon more often",
    "Someone is about to change his or her mind about an important decision",
    "An old issue you thought was over will come up again today",
    "Get ready for huge changes: break-ups and unexpected setbacks",
    "God's trying to get your attention",
    "Someone has the \"hots\" for you"
  ],
  "emojis": ["#emoji1# #emoji2# #emoji3#"],
  "emoji1": ["💩", "😭", "👍", "💅", "👅", "👄", "🙌", "😈", "😱", "👑", "🎩", "💀", "👻", "😳", "🙏", "🖕", "💆", "👙", "👀"],
  "emoji2": ["🤖", "🤑", "🙄", "🙃", "💄", "💃🏻", "🏃🏻", "👼🏻", "👵🏻", "👸🏻", "🐒", "🙈", "🙉", "🦄 ", "🐙 ", "🍆 ", "🍳", "🍕", "🌯"],
  "emoji3": ["🍦", "☕️", "🍷", "🍌", "🍼", "🍰", "🌽", "🍻", "🍩", "🎤", "🎷", "⛵️", "🚨", "🏠", "💻", "💸", "📼", "🔫", "💣"]
  };

  var grammar = tracery.createGrammar(syntax);
  grammar.addModifiers(tracery.baseEngModifiers);
  poem = grammar.flatten('#sentence#');
  console.log(poem);
}

// ALL THE TWITTER STUFF

// Connect to Twitter API with credentials
var T = new Twit(config);
var stream = T.stream('user');

// Set up a user stream and look for tweet events
stream.on('tweet', tweetEvent);

// Here a tweet event is triggered!
function tweetEvent(tweet) {

  var reply_to = tweet.in_reply_to_screen_name; //who did it reply to
  var name = tweet.user.screen_name; // their twitter screen name
  var id = tweet.id_str; // their twitter handle
  var txt = tweet.text; // text of tweet
  var media = tweet.entities.media;
  console.log(media);
  try {
    picture = media[0].media_url; // image in tweet
}
catch(err) {
    console.log("nope");
    picture = undefined;
}

  console.log("picture set");
  console.log(picture);
  //console.log(media[0].media_url);

  // Set up the tweeting function

  if (reply_to === 'gimmeafortune') {
    // If there's no image let the tweeter know
    if (media === undefined) {
      console.log("inside if")
      var reply = '@' + name + ' First you have to send me an image!';
      T.post('statuses/update', {
        status: reply,
        in_reply_to_status_id: id
      }, tweeted);
    } else if (media.length > 0) { // If there is an image, get the url
     console.log(picture)

      // predict the contents of an image by passing in a url

      // predict the contents of an image by passing in a url
      try {
      app.models.predict(Clarifai.GENERAL_MODEL, picture).then(
        function(response) {
          console.log(response)
          parseResponse(response);
        },
        function(err) {
          console.error(err);
        }
      );
    }

    catch(err) {
      console.log(err)
    }

      // parseResponse();

      var replyText = '.@'+ name + ' '+ poem;
      T.post('statuses/update', {
        status: replyText,
        in_reply_to_status_id: id
      }, tweeted);
    }
   }
  }

    // Make sure it worked!
    function tweeted(err, reply) {
      if (err) {
        console.log(err.message);
      } else {
        console.log('Tweeted: ' + reply.text);
        tags =[]
        poem = null;
      }
    }
