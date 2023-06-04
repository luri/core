import luri from "./luri.js";

/**
 * Each instance of Model gets assigned an unique id
 */
let id = 0;
let docroot = document.body;

/**
 * TODO: perhaps change this in future
 * Uses DOM classes to propagate events
 */
export default class Model {

  static targetselector = "T";
  static anyselector = "X";
  static htmlx = false;

  id = id++;
  target = null;
  collections = new Map;

  static handlerx = {
    get: function (model, prop, receiver) {
      if (model.constructor.prototype[prop]) {
        return model[prop].bind(model);
      } else {
        return model.get(prop);
      }
    },
    set: function (model, property, value) {
      model.set(property, value);

      for (let prop of [property, "*"]) {
        for (let instance of model.getCollection(prop)) {
          for (let binding of instance.bindingsx) {
            if (binding.model === model && binding.prop === prop) {
              binding.sync(instance, property);
            }
          }
        }
      }
      return true;
    }
  }

  constructor(target) {
    this.target = target;

    return new Proxy(this, this.constructor.handlerx);
  }

  classname(property) {
    return `#${this.id}-${property}`;
  }

  value(prop) {
    return this.target[prop];
  }

  get(prop) {
    if (prop === this.constructor.targetselector)
      return this.target;
    if (prop === this.constructor.anyselector)
      prop = "*";
    return new ModelProperty(this, prop);
  }

  set(property, value) {
    this.target[property] = value;

    return this;
  }

  getCollection(property) {
    if (!this.collections.has(property)) {
      this.collections.set(property, docroot.getElementsByClassName(this.classname(property)));
    }

    return this.collections.get(property);
  }
}

class ModelProperty {

  node = "span";

  constructor(model, prop) {
    this.html = prop;
    // put class higher in prop order so it
    // doesn't get overwritten from transformers
    this.class = "";
    this.binding = new DataBinding(model, prop);
  }

  /**
   * Allows for modifications to the definition
   * @param {() => {}} transformer 
   */
  transform(transformer) {
    transformer(this);
  }

  /**
   * Allows customization of the binding renderer,
   * additionally provides utility way of calling transform.
   * 
   * @param {(any, HTMLElement, string) => void | any} renderer 
   * @param {() => {}} transformer 
   */
  bind(renderer, transformer) {
    this.binding.render = renderer;
    if (transformer)
      this.transform(transformer);

    return this;
  }

  toString() {
    return this.binding.model.value(this.html).toString();
  }

  valueOf() {
    return this.binding.model.value(this.html);
  }

  // [Symbol.toPrimitive](hint) {
  //   // probably gonna need this in future
  // }
}

/**
 * Represents a bond between an HTMLElement and 
 * a model's property.
 */
export class DataBinding {

  /**
   * When applied to an element's
   * property it's name will be saved here
   */
  appliedto = null;

  constructor(model, prop) {
    this.model = model;
    this.prop = prop;
  }


  /**
   * Attaches the DataBinding instance to the element
   * @param {HTMLElement} element
   * @param {string} prop When binding is applied 
   */
  bind(element, prop) {
    if (!element.bindingsx)
      element.bindingsx = [];
    this.appliedto = prop;
    element.bindingsx.push(this);
    element.classList.add("has-bindings", this.model.classname(this.prop));
    this.sync(element);
  }


  /**
   * This function gets called with the value
   * of the model's property it is bound to.
   * It's responsible for modifying **element** 
   * and keeping it sync'd with the model.
   * If a value is returned then the 
   * default renderer will be called using 
   * that value instead of **value**.
   * 
   * @param {any} value 
   * @param {HTMLElement} element
   * @param {Readonly<{ [string]: any }>} model Direct access to the model's properties. Modifications to this object will not propagate and will cause the model's bindings to be out of sync.
   */
  render(value, element, model) {
    return value;
  }

  /**
   * Default renderer for ModelPropertyDefinition
   * @param {any} value 
   * @param {HTMLElement} element 
   */
  renderhtml(value, element) {
    if (typeof value === "string") {
      if (this.model.constructor.htmlx) {
        element.innerHTML = "";
        element.insertAdjacentHTML("beforeend", value);
      } else {
        element.firstChild.textContent = value;
      }
    } else {
      element.innerHTML = "";
      luri.append(value, element);
    }
  }

  /**
   * Default renderer for property bindings
   * @param {any} value 
   * @param {HTMLElement} element 
   * @param {string} prop 
   */
  renderprop(value, element, prop) {
    element[prop] = value;

    if (prop.toLowerCase() === prop) {
      // checkbox special case
      if (prop === "checked" && value == false) {
        return element.removeAttribute(prop);
      }

      // double tap
      element.setAttribute(prop, value);
    }
  }

  /**
   * Must sync **context** with **this.model**
   * 
   * @param {HTMLElement} context The element this binding is bound to. The binding itself does not hold a reference to the element it's bound to in order to prevent accidental memory leaks, thankfully it is not needed because everywhere where sync is called there is a reference to the element.
   * @param {string} prop 
   */
  sync(context, prop = this.prop) {
    let value = this.render(
      this.prop === "*" ? this.model.target : this.model.value(prop),
      context,
      prop
    )

    if (value !== undefined) {
      if (this.appliedto) {
        this.renderprop(value, context, this.appliedto);
      } else {
        this.renderhtml(value, context);
      }
    }
  }
}

let i = 0;
// watch the dom for bound elements
new MutationObserver(function (mutations) {
  for (let record of mutations) { i++;
    for (let node of record.addedNodes) { i++;
      if (node instanceof HTMLElement) {
        for (let bound of node.getElementsByClassName("has-bindings")) { i++;
          for (let binding of bound.bindingsx) { i++;
            binding.sync(bound);
          }
        }
      }
    }
  }
}).observe(document.body, { childList: true, subtree: true });



// tell luri about the binding property and ModelProperty prop
luri.parsers.binding = (element, props, prop) => {
  props[prop].bind(element);
};
luri.starparsers.set(ModelProperty, (element, props, prop) => {
  props[prop].binding.bind(element, prop);
});
