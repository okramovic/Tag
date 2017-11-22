 /*
  Live.js - One script closer to Designing in the Browser
  Written for Handcraft.com by Martin Kool (@mrtnkl).

  Version 4.
  Recent change: Made stylesheet and mimetype checks case insensitive.

  http://livejs.com
  http://livejs.com/license (MIT)  
  @livejs

  Include live.js#css to monitor css changes only.
  Include live.js#js to monitor js changes only.
  Include live.js#html to monitor html changes only.
  Mix and match to monitor a preferred combination such as live.js#html,css  

  By default, just include live.js to monitor all css, js and html changes.
  
  Live.js can also be loaded as a bookmarklet. It is best to only use it for CSS then,
  as a page reload due to a change in html or css would not re-include the bookmarklet.
  To monitor CSS and be notified that it has loaded, include it as: live.js#css,notify
*/
(function () {
        var filesToWatch = [
          '../src/html/index.html',
          '../src/css/style.css',
          '../src/js/script.js'
        ];
    
      var headers = { "Etag": 1, "Last-Modified": 1, "Content-Length": 1, "Content-Type": 1 },
          resources = {},
          pendingRequests = {},
          currentLinkElements = {},
          oldLinkElements = {},
          interval = 1000,
          loaded = false,
          active = { "html": 1, "css": 1, "js": 1 };
    
      var Live = {
    
        // performs a cycle per interval
        heartbeat: function () {      
          if (document.body) {        
            // make sure all resources are loaded on first activation
            if (!loaded) Live.loadresources();
            Live.checkForChanges();
          }
          setTimeout(Live.heartbeat, interval);
        },
    
        // loads all local css and js resources upon first activation
        loadresources: function () {
            filesToWatch.forEach(function(url) {
                Live.getHead(url, function (url, info) {
                    resources[url] = info;
                });
            });
            
            loaded = true;
        },
    
        // check all tracking resources for changes
        checkForChanges: function () {
          for (var url in resources) {
            if (pendingRequests[url])
              continue;
    
            Live.getHead(url, function (url, newInfo) {
              var oldInfo = resources[url],
                  hasChanged = false;
              resources[url] = newInfo;
              for (var header in oldInfo) {
                // do verification based on the header type
                var oldValue = oldInfo[header],
                    newValue = newInfo[header],
                    contentType = newInfo["Content-Type"];
                switch (header.toLowerCase()) {
                  case "etag":
                    if (!newValue) break;
                    // fall through to default
                  default:
                    hasChanged = oldValue != newValue;
                    break;
                }
                // if changed, act
                if (hasChanged) {
                  Live.refreshResource(url, contentType);
                  break;
                }
              }
            });
          }
        },
    
        // act upon a changed url of certain content type
        refreshResource: function (url, type) {
              document.location.reload();
        },
    
        // removes the old stylesheet rules only once the new one has finished loading
        removeoldLinkElements: function () {
          var pending = 0;
          for (var url in oldLinkElements) {
            // if this sheet has any cssRules, delete the old link
            try {
              var link = currentLinkElements[url],
                  oldLink = oldLinkElements[url],
                  html = document.body.parentNode,
                  sheet = link.sheet || link.styleSheet,
                  rules = sheet.rules || sheet.cssRules;
              if (rules.length >= 0) {
                oldLink.parentNode.removeChild(oldLink);
                delete oldLinkElements[url];
                setTimeout(function () {
                  html.className = html.className.replace(/\s*livejs\-loading/gi, '');
                }, 100);
              }
            } catch (e) {
              pending++;
            }
            if (pending) setTimeout(Live.removeoldLinkElements, 50);
          }
        },
    
        // performs a HEAD request and passes the header info to the given callback
        getHead: function (url, callback) {
          pendingRequests[url] = true;
          var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XmlHttp");
          xhr.open("HEAD", url, true);
          xhr.onreadystatechange = function () {
            delete pendingRequests[url];
            if (xhr.readyState == 4 && xhr.status != 304) {
              xhr.getAllResponseHeaders();
              var info = {};
              for (var h in headers) {
                var value = xhr.getResponseHeader(h);
                // adjust the simple Etag variant to match on its significant part
                if (h.toLowerCase() == "etag" && value) value = value.replace(/^W\//, '');
                if (h.toLowerCase() == "content-type" && value) value = value.replace(/^(.*?);.*?$/i, "$1");
                info[h] = value;
              }
              callback(url, info);
            }
          }
          xhr.send();
        }
      };
    
      // start listening
      if (document.location.protocol != "file:") {
          console.log('Starting live.js');
        if (!window.liveJsLoaded)
          Live.heartbeat();
    
        window.liveJsLoaded = true;
      }
      else if (window.console)
        console.log("Live.js doesn't support the file protocol. It needs http.");    
    })();