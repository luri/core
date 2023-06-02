import luri, { Component, register, registerListeners as RegisterHandlers } from "../lib/luri.js";

function prettify(name) {
  return name[0].toUpperCase() + name.substring(1).replace(/-/g, " ");
}

function Control(base) {
  return RegisterHandlers(class extends Component(base) {
    constructor(name, props = {}) {
      if (name) {
        props.name = name;
      }
      super(props);
    }

    constructx(props) {
      if (typeof props.name === "string") {
        this.labelx(prettify(props.name));
      }

      return super.constructx(props);
    }

    labelx(text) {
      return this.inputx().attrx("placeholder", text);
    }

    clearError() {
      this.inputx().setCustomValidity("");
    }

    onInput() {
      this.clearError();
    }

    /**
     * Return the input element in case of
     * complex controls
     */
    inputx() {
      return this;
    }

    /**
     * Get or set the value of the control
     * @param {*} value 
     */
    valuex(value) {
      return value ? (this.inputx().value = value, this) : this.inputx().value;
    }
  });
}

export class Input extends Control(HTMLInputElement) {

  static parentx() {
    return "input";
  }

  /**
   * 
   * @param {*} name 
   * @param {'text'|'hidden'|'email'|'color'|'date'|'month'|'number'|'range'|'search'|'tel'|'time'|'url'|'week'|'password'|'submit'|'image'|'button'} type 
   * @param {*} value
   * @param {Object} props
   */
  constructor(name, type = "text", value = "", props = {}) {
    props.type = type;
    props.value = value;

    super(name, props);

    if (!props.autocomplete) {
      this.setAttribute("autocomplete", "off");
    }
  }
}
register(Input);


export class Select extends Control(HTMLSelectElement) {

  static parentx() {
    return "select";
  }

  constructoptx(props) {
    return props;
  }

  constructx(props) {
    let selected = props.selected;
    let options = props.options || [];

    if (options) {
      let arr = Array.isArray(options);
      props.html = [];
      for (let key in options) {
        let value = arr ? options[key] : key;
        let option = {
          node: "option",
          html: options[key],
          value: value
        };
        if (selected === value) {
          option.selected = "selected"
        }
        props.html.push(this.constructoptx(option));
      }
    }

    delete (props.options);
    delete (props.selected);

    return props;
  }
}
register(Select);

export class Textarea extends Control(HTMLTextAreaElement) {

  static parentx() {
    return "textarea";
  }

  constructor(name, value = "", props = {}) {
    props.html = value;
    super(name, props);
  }
}
register(Textarea);

export class Checkbox extends Control(HTMLLabelElement) {

  static boxtypex = "checkbox";
  static inputClassx = Input;

  static parentx() {
    return "label";
  }

  constructor(name, checked = false, value = "on", props = {}) {
    if (checked) props.checked = checked;
    if (value) props.value = value;

    super(name, props);

    if (typeof name === "string") this.labelx(prettify(this.constructor.boxtypex === "checkbox" ? name : value));
  }

  constructinputx(props) {
    return props;
  }

  instantiateinputx(props) {
    return new (this.constructor.inputClassx)(props.name, this.constructor.boxtypex, props.value, props);
  }

  constructlabelx(props) {
    return props;
  }

  constructlabelwrapperx() {
    return {
      node: "span",
      html: "label"
    };
  }

  constructx(props) {
    return this.constructlabelx({
      node: "label",
      html: [
        this.instantiateinputx(this.constructinputx(props)),
        this.constructlabelwrapperx()
      ]
    });
  }

  inputx() {
    return this.firstChild;
  }

  labelx(def) {
    this.children[1].innerHTML = "";
    luri.append(def, this.children[1]);
    return this;
  }

  /**
   * Get or set the checked state
   * @param {*} checked 
   */
  checkedx(checked) {
    return checked ? (this.inputx().checked = checked, this) : this.inputx().checked;
  }
}
register(Checkbox);

export class Radio extends Checkbox {
  static boxtypex = "radio";

  constructor(name, value, checked, props) {
    super(name, checked, value, props);
  }
}
register(Radio);