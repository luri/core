class Web {
  /**
   * The base uri for the requests
   */
  base = "";

  /**
   * Name of the expected CSRF field
   */
  CSRF_NAME = "_token";
  csrf_token = "";

  /**
   * Provides the ability to simulate 
   * different request methods through
   * POST, obiding the HTTP protocol
   */
  METHOD_NAME = "_method";

  /**
   * Maximum number of failed attempts
   * before keepAlive is killed
   */
  extendMaxFailAttempts = 5;
  /**
   * Endpoint where session extension
   * requests will be sent
   */
  extendEndpoint = "/extend";
  /**
   * Amount of ms between session
   * extension requests
   */
  extendInterval = 600000;
  /**
   * The return value of setInterval
   */
  extendI = null;
  /**
   * Timeout before retrying after
   * a failed session extension request
   */
  extendRetryTimeout = 20000;

  constructor(base = "") {
    this.base = base;
  }

  /**
   * Set the value for the CSRF token
   * @param {string} token 
   */
  setToken(token) {
    this.csrf_token = token;
  }

  /**
   * Entries (one dimensional) to query string
   */
  toQueryString(entries = []) {
    return entries.map(e => encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1])).join("&");
  }

  /**
   * Return an absolute url for an endpoint
   * @param {string} uri endpoint
   * @param {any} query A object or string
   */
  url(uri, query) {
    return this.base + uri + (query ? ("?" + (typeof query === "object" ? this.toQueryString(Object.entries(query)) : query)) : "");
  }

  /**
   * Default options for each request
   */
  options() {
    return {
      credentials: "include",
      headers: {
        Accept: "application/json"
      }
    }
  }

  /**
   * Perform a web request.
   * @param {string} uri Endpoint
   * @param {RequestInit} options An options object to pass to fetch() except a custom data property is introduced which must be a plain object or FormData instance.
   */
  request(uri, options = {}) {
    Object.assign(options, this.options());

    if (options.method) {
      options.method = options.method.toUpperCase();
    } else {
      options.method = "GET";
    }
    
    if (!options.headers) {
      options.headers = {};
    }

    if (options.data) {
      if (options.method !== "GET") {
        options.method = "POST";

        if (options.data instanceof FormData) {
          if (options.method !== "POST") {
            options.data.append(this.METHOD_NAME, options.method);
          }
          options.data.append(this.CSRF_NAME, this.csrf_token);

          options.body = options.data;
        } else {
          if (options.method !== "POST") {
            options.data[this.METHOD_NAME] = options.method;
          }

          options.data[this.CSRF_NAME] = this.csrf_token;

          options.body = this.toQueryString(Object.entries(options.data));
          options.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }
      } else {
        uri += (uri.indexOf("?") > -1 ? "&" : "?") + this.toQueryString(options.data instanceof FormData ? [...options.data.entries()] : Object.entries(options.data));
      }

      delete (options.data);
    }

    return this.processResponse(this.fetch(this.url(uri), options));
  }

  fetch(url, options) {
    return fetch(url, options);
  }

  processResponse(fetchPromise) {
    return fetchPromise.then(resp => {
      switch (resp.headers.get("content-type")) {
        case "application/json":
          return resp.json();
        default:
          return resp.text();
      }
    });
  }

  /**
   * Starts an interval that sends requests to this.extendEndpoint every this.extendInterval
   * in order to prevent a session from expiring
   */
  keepAlive() {
    this.extendI = setInterval(this.extendSession.bind(this), this.extendInterval);
  }

  /**
   * Stops the keepAlive interval
   */
  kill() {
    if (this.extendI) {
      clearInterval(this.extendI);
      delete (this.extendI);
    }
  }

  /**
   * Performs the extend request
   * @param {number} attempt 
   */
  extendSession(attempt = 1) {
    this.request(this.extendEndpoint).catch(() => {
      if (this.extendMaxFailAttempts < attempt) {
        this.extendSessionFailed();
        this.kill();
      } else {
        setTimeout(() => {
          this.extendSession(attempt + 1);
        }, this.extendRetryTimeout);
      }
    });
  }

  extendSessionFailed() {
    // notify user their session could not be extended
    alert("Session could not be extended.");
  }

  /**
   * A separate function for uploading files since fetch() does not support tracking upload progress currently.
   * @param {File} file blob
   * @param {string} name name of the field in the generated form
   * @param {string} uri destination
   */
  uploadFile(file, name, uri) {
    return new Promise((resolve, reject) => {

      var oReq = new XMLHttpRequest();
      var data = new FormData();

      data.append(name, file);
      data.append(this.CSRF_NAME, this.csrf_token);

      if (oReq.upload) {
        oReq.upload.addEventListener("progress", event => this.uploadFileProgress(event), false);
      }
      oReq.addEventListener("load", event => {
        if (oReq.status !== 200) {
          reject(oReq);
        }

        resolve(this.uploadFileComplete(oReq));
      });
      oReq.addEventListener("error", event => {
        reject(oReq);
      });
      oReq.addEventListener("abort", event => {
        reject(oReq);
      });

      oReq.open("POST", this.url(uri));

      this.uploadFileBeforeSend(oReq, data);

      oReq.send(data);
    });
  }

  uploadFileComplete(xhr) {
    return xhr.responseText;
  }

  uploadFileBeforeSend(xhr, data) {
    // modify xhr or data if needed
  }

  uploadFileProgress(event) {
    // do something if needed
  }

}

let web = new Web();

export { Web };
export default web;
