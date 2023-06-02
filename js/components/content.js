import luri, { Component } from "../lib/luri.js";
import Animatable from "./animatable.js";

// class ContentComponent extends Component() {}
// class AnimatableContentComponent extends Animatable(ContentComponent) {}

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

// /**
//  * @extends {ContentComponent}
//  * @implements {AnimatableContentComponent}
//  */
// class Content extends AnimatableContentComponent {
/**
 * @property {any} queryx
 */
class Content extends Component(Animatable(HTMLElement)) {

  // static parentx() {
  //   return "div";
  // }

  initx(props) {
    this.queryx = props;
  }

  constructx(props) {
    return this.propsx();
  }
  
  /**
   * @deprecated use constructx()
   */
  propsx() {
    return {
      // id: this.idx()
    };
  }

  /**
   * Expresses the content's attitude
   * towards being cached
   */
  cachex() {
    return true;
  }

  contentx(data) {
    return [
      "*Cricket Sounds*"
    ];
  }

  /**
   * Inject the returned definition from contentx or errorx after fetching datax
   * @param {HTMLElement} def
   */
  injectx(def) {
    for (let child of (Array.isArray(def) ? def : [def])) {
      luri.append(child, this);
    }
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
   * @deprecated The idx function has been made static, this is only kept for no good reason really.
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