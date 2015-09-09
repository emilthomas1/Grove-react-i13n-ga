var DEFAULT_CATEGORY = 'all';
var DEFAULT_ACTION = 'click';
var DEFAULT_LABEL = '';

/**
 * @class ReactI13nGoogleAnalytics
 * @param {String} tracking id
 * @constructor
 */
 var ReactI13nGoogleAnalytics = function (trackingId) {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', trackingId, 'auto');
};

// https://developers.google.com/analytics/devguides/collection/analyticsjs/method-reference#send
var hitTypes = {
  event: {
    required: ['category', 'action', 'label'],
    optional: ['value'],
  },
  pageview: {
    required: [],
    optional: ['location', 'page', 'title'],
  },
  social: {
    required: ['socialNetwork', 'socialAction', 'socialTarget'],
    optional: [],
  },
  timing: {
    required: ['timingCategory', 'timingVar', 'timingValue'],
    optional: ['timingLabel'],
  },
    // this one is weird
    exception: {
      required: [],
      optional: ['erroData'],
    },
  };

/**
 * get plugin object
 * @method getPlugin
 * @return {Object} plugin object
 */
 ReactI13nGoogleAnalytics.prototype.getPlugin = function () {
  return {
    name: 'ga',
    eventHandlers: {
      /**
       * generic GA call handler
       * 
       * @method callSend
       * @param {Object} payload
       * @param {String} payload.type - e.g. 'event', 'pageview', 'exception'
       * @param {Object} payload.data - data associated with type
       * @param {Function} callback - ...the callback
       */
       callSend: function(payload, callback) {

        if ( !(payload.type in hitTypes) ) {
          throw new Error('hit type ' + payload.type + ' not supported');
        }

        var hitType = payload.type;
        var data = payload.data;
        var params = ['send', payload.type];
        var requiredArgs = hitTypes[hitType].required;
        var optionalArgs = hitTypes[hitType].optional;

        for (var i = 0; i < requiredArgs.length; i++) {
          var arg = requiredArgs[i];
          if (data.hasOwnProperty(arg)) {
            params.push(data[arg]);
          } else {
            throw new Error('missing argument for ' + hitType + ': ' + arg);
          }
        }

        for (var i = 0; i < optionalArgs.length; i++) {
          var arg = optionalArgs[i];
          if (data.hasOwnProperty(arg)) {
            params.push(data[arg]);
          }
        }
        ga.apply(this, params);
      },
      
      /**
       * pageview handler
       * @method pageview
       * @param {Object} payload payload object
       * @param {Object} payload.title page title
       * @param {Object} payload.url current url
       * @param {Function} calback callback function
       */
       pageview: function (payload, callback) {
        ga('send', 'pageview', {
          page: payload.url,
          title: payload.title,
          hitCallback: callback
        });
      },

      /**
       * click handler
       * @method pageview
       * @param {Object} payload payload object
       * @param {Object} payload.title page title
       * @param {Object} payload.url current url
       * @param {Function} calback callback function
       */
       click: function (payload, callback) {
        var i13nNode = payload.i13nNode;
        var params = ['send', 'event']
        if (i13nNode) {
          var model = i13nNode.getMergedModel();
          params.push(model.category || DEFAULT_CATEGORY);
          params.push(model.action || DEFAULT_ACTION);
          params.push(model.label || i13nNode.getText(payload.target) || DEFAULT_LABEL);
          if (model.value) {
            params.push(model.value);
          }
          params.push({
            hitCallback: callback
          });
          ga.apply(this, params);
        } else {
          callback();
        }
      }
    }
  };
}

module.exports = ReactI13nGoogleAnalytics;
