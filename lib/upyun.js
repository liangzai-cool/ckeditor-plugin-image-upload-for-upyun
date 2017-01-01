;(function(window, angular) {

  'use strict';

  // check outer deps
  if (!window.JSON) throw new Error('JSON required.');
  if (!window.FormData) throw new Error('FormData required.');
  if (!window.XMLHttpRequest) throw new Error('XMLHttpRequest required.');

  // inject as a angular module
  if (angular) {
    angular.module('upyun', [
      'base64',
      'angular-md5'
    ]).factory('$upyun', function($base64, md5) {
      return new Upyun($base64, md5);
    });
  } else {
    // inject to window object
    window.upyun = new Upyun(window.Base64, window.md5);
  }

  function Upyun(base64, md5) {
    if (!base64) throw new Error('base64 required.');
    if (!md5) throw new Error('md5 required.');
    this.base64 = base64;
    this.md5 = md5;
    this.events = {};
    this.form_api_secret = CKEDITOR.config.imageuploadforupyun.form_api_secret || '<your_form_api_secret>';
    this.configs = {};
    this.configs.bucket = CKEDITOR.config.imageuploadforupyun.bucket_name || '<your_bucket_name>';
    this.configs.expiration = CKEDITOR.config.imageuploadforupyun.expiration || parseInt((new Date().getTime() + 3600000) / 1000);
    this.host = 'http://' + this.configs.bucket + '.' + (CKEDITOR.config.imageuploadforupyun.host || '<your_host>');
    this.configs['allow-file-type'] = 'jpg,jpeg,gif,png';
  }

  Upyun.prototype.set = function(k, v) {
    var toplevel = ['form_api_secret', 'endpoint', 'host'];
    if (k && v) {
      if (toplevel.indexOf(k) > -1) {
        this[k] = v;
      } else {
        this.configs[k] = v;
      }
    }
    return this;
  };

  Upyun.prototype.on = function(event, callback) {
    if (event && callback) {
      this.events[event] = callback;
    }
    return this;
  };

  Upyun.prototype.upload = function(params, callback) {
    if (!callback || typeof(callback) !== 'function') 
      throw new Error('callback function required.');
    var self = this;
    var req = new XMLHttpRequest();
    var uploadByForm = typeof(params) === 'string';
    var md5hash = self.md5.createHash || self.md5;

    var files = null;
    if (uploadByForm) {
      files = document.forms.namedItem(params).file.files;
    } else {
      files = file ? [file] : [];
    }

    // if upload by form name,
    // all params must be input's value.
    var data = uploadByForm ?
      new FormData(document.forms.namedItem(params)) :
      new FormData();
    self.configs['save-key'] = CKEDITOR.config.imageuploadforupyun.path || (function () {

                      var ext = '.' + files[0].name.split('.').pop();
                      return '/images/' + parseInt((new Date().getTime() + 3600000) / 1000) + ext;
    })();
    var policy = self.base64.encode(JSON.stringify(self.configs));
    var apiendpoint = self.endpoint || '//v0.api.upyun.com/' + self.configs.bucket;
    var imageHost = self.host || 'http://' + self.configs.bucket + '.b0.upaiyun.com';

    // by default, if not upload files by form,
    // file object will be parse as `params`
    if (!uploadByForm) data.append('file', params);
    data.append('policy', policy);
    // data.append('save-key', self.configs['save-key']);
    data.append('signature', md5hash(policy + '&' + self.form_api_secret));

    // open request
    req.open('POST', apiendpoint, true);

    // Error event
    req.addEventListener('error', function(err) {
      return callback(err);
    }, false);

    // when server response
    req.addEventListener('load', function(result) {
      var statusCode = result.target.status;
      // trying to parse JSON
      if (statusCode !== 200)
        return callback(new Error(result.target.status), result.target);
      try {
        var image = JSON.parse(this.responseText);
        image.absUrl = imageHost + image.url;
        image.absUri = image.absUrl;
        return callback(null, result.target, image);
      } catch (err) {
        return callback(err);
      }
    }, false);

    // the upload progress monitor
    req.upload.addEventListener('progress', function(pe) {
      if (!pe.lengthComputable) return;
      if (!self.events.uploading || typeof(self.events.uploading) !== 'function')
        return;
      self.events.uploading(Math.round(pe.loaded / pe.total * 100));
    });

    // send data to server 
    req.send(data);
  };

})(window, window.angular);
