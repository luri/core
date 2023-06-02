/**
 * Parse a multi-line string containing class names into a single line
 * and remove duplicate class names.
 * @param {string} classes 
 */
export function shrink(classes) {
  return classes.trim().replace(/(?:\n+\s+|\s+)/g, " ").split(" ").filter((v, i, a) => a.indexOf(v) === i).join(" ");
}

export default class ClassList extends Set {

  cache = null;

  constructor(classes = "") {
    super();
    this.add(classes.replace(/\s{2,}/g, " ").trim());
  }

  add(classes = "") {
    this.cache = null;
    classes.split(" ").forEach(name => {
      super.add(name);
    });
    return this;
  }

  delete(classes) {
    this.cache = null;
    classes.split(" ").forEach(name => {
      super.delete(name);
    });
    return this;
  }

  toString() {
    if (this.cache) {
      return this.cache;
    }
    let className = "";
    this.forEach(name => className += " " + name);
    return this.cache = className.substring(1);
  }
}