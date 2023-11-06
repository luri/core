import web, { Web } from "./web.js";

export default class Cursor {
  /**
   * Remote resource cursor.
   * 
   * @param {string} url The url of the resource, with placeholders. http://example.com/posts?page=<page>
   * @param {*} pointer 
   * @param {Web} weblib
   */
  constructor(url, pointer = 1, weblib = web) {
    this.url = url;
    this.pointer = pointer;
    this.web = weblib;
  }

  update(old, data) {
    return old + 1;
  };

  parse(url) {
    return url.replace("<page>", this.pointer);
  }

  fetch() {
    let url = this.parse(this.url);

    return this.execute(url).then(data => {
      this.pointer = this.update(this.pointer, data);

      return data;
    });
  }

  setWeb(web) {
    this.web = web;
  }

  execute(url) {
    return this.web.request(url);
  }
}