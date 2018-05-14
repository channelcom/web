if (!ldBlogRssPlugin){
  var ldBlogRssPlugin = function (url, row, target, id_base) {
    this.url = url;
    this.row = Math.abs(row) ? Math.abs(row) > 10 ? 10 : Math.abs(row) : 5;
    this.target = target;
    this.id_base = id_base;
    var obj = this;
    setTimeout(function(){ obj.getFeed(); }, 100);
  };
  ldBlogRssPlugin.prototype = {
    getFeed : function () {
      var api_url = "http://portal.profile.livedoor.com/api/item/feed?url="+encodeURIComponent(this.url)+"&row="+this.row+"&escape=1";
      var obj = this;
      this.callJSONP(api_url, function (json) {
        try {
          var _obj = obj;
          if (json.status == 'wait')
            window.setTimeout(function () { _obj.getFeed(); }, json.waittime ? json.waittime : 500);
          else if (json.status == 'fail')
            obj.outputHTML({"title":"RSS Error!", "link":"#", "entries":[]});
          else
            obj.outputHTML(json);
        } catch (e) {}
    });
    },
    outputHTML : function (json) {
      var title_elm = document.getElementById(this.id_base+"-title");
      var body_elm = document.getElementById(this.id_base+"-body");
      if (title_elm) {
        title_elm.href = json.link;
        title_elm.innerHTML = json.title;
      }
      for (var i in json.entries) {
        if (json.entries.hasOwnProperty(i)){
          var link_elm = document.createElement('a');
          if (/^https?:\/\//.test(json.entries[i].link))
            link_elm.href = json.entries[i].link;
          if (this.target)
            link_elm.target = this.target;
          link_elm.appendChild(document.createTextNode(json.entries[i].title));
          var div_elm = document.createElement('div');
          div_elm.className = 'sidebody';
          div_elm.appendChild(link_elm);
          body_elm.appendChild(div_elm);
        }
      }
    },
    callJSONP : function (api_url, cb_func) {
      var uniq_name = "ldb_rss_plugin_cb_" + Math.random().toString(36).slice(2);
      var scr = document.createElement("script");
      scr.type = "text/javascript";
      scr.src = api_url + '&callback=' + uniq_name;
      scr.id = uniq_name;
      var obj = this;
      window[uniq_name] = function (json) {
        cb_func(json);
        var u_name = uniq_name;
        var obj2 = obj;
        setTimeout(function() {
          obj2.head.removeChild(document.getElementById(u_name));
          try{
            window[u_name] = null;
            delete window[u_name];
          } catch (e) {};
        }, 200);
      };
      this.head = this.head ? this.head : document.getElementsByTagName("head").item(0);
      setTimeout(function(){ obj.head.appendChild(scr); }, 100);
    }
  };
}

