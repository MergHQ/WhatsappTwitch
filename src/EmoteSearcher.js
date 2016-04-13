var gEmotes = null;

function searchForEmotes(tagsarr)
{
  var tags = [];
  for(var i = 0; i < tagsarr.length; i++)
  {
    tags.push(JSON.parse(tagsarr[i]));
  }

  // Loop all messages.
  try {
    for(var i = 0; i < tags.length; i++)
    {
      for(var j = 0; j < gEmotes.emoticons.length; j++) {
        var iterEmote = gEmotes.emoticons[j];
        var words = tags[i].text.split(" ");
        for(var k = 0; k < words.length; k++)
        {
          if(words[k] == iterEmote.regex && iterEmote.images.length > 0)
          {
            postMessage([iterEmote.regex, iterEmote.images[0].url, tags[i].id]);
          }
        }
      }
    }
    postMessage("");
  } catch(e) {
    postMessage("");
  }
}

function decodeEmotes(byteArray)
{
  var view = new DataView(byteArray.buffer, 0, byteArray.buffer.byteLength);
  var string = new TextDecoder("utf-8").decode(view);
  return JSON.parse(string);
}

onmessage = function(e)
{
  if(e.data[0] === 0) // 0 = emote pass
    gEmotes = decodeEmotes(e.data[1]);
  else if(e.data[0] === 1) // update
    searchForEmotes(e.data[1]);
}
