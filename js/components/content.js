import { Component } from "../lib/luri.js";

/**
 * Currently, intelliSense has trouble picking up all members of 
 * a composite class. In the light of which, prioritize showing 
 * members of the Component mixin as they also contain the HTMLElement
 * members. Inclusion of Animatable members is possible via the 
 * implements anotation however that only works on the class definition.
 * 
 * Opened an issue about it:
 * https://github.com/microsoft/vscode/issues/109375
 */

/**
 * @property {any} queryx
 */
class Content extends Component(HTMLElement) {

  // static parentx() {
  //   return "div";
  // }

  initx(props) {
    this.queryx = props.query;
    this.rootx = props.root;
  }

  /**
   * Expresses the content's attitude
   * towards being cached
   */
  cachex() {
    return true;
  }

  /**
   * 
   * @param {*} data 
   * @returns {Definition}
   */
  contentx(data) {
    return [
      "*Cricket Sounds*"
    ];
  }

  // prevent putting query elements as html attributes
  propsx() {
    return {};
  }
  
  /**
   * Determines an unique identifier for the content
   * @param {*} query 
   */
  static idx(query) {
    let isArray = Array.isArray(query);
    let id = this.name;

    if (query && (query.length || !isArray)) {
      id += ":" + (!isArray ? JSON.stringify(query) : query);
    }
    return id;
  }

  /**
   * The idx function has been made static, this is only kept for convenience.
   * @alias this.constructor.idx
   * @param {*} query 
   */
  idx(query = this.queryx) {
    return this.constructor.idx(query);
  }

  /**
   * Runs before content is rendered.
   * @throws {Error | Content}
   */
  interceptx() {
    
  }

  /**
   * Allows render of a custom error screen 
   * when datax rejects
   */
  errorx() {
    
  }

  datax() {
    return Promise.resolve();
  }

}

export default Content;