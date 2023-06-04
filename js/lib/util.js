import luri from "./luri.js";

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generatelocationhash(path, query) {
  if (query) {
    return path + ":" + JSON.stringify(query);
  }
  return path;
}

export function navigate(path, query) {
  window.location.hash = generatelocationhash(path, query);
}

/**
 * Globalize luri helper functions
 */
luri.helpers(window);

/**
 * Swaps classes on an element based on a condition.
 * 
 * @param {HTMLElement} element 
 * @param {bool} condition 
 * @param {string} a classes to be added if condition is true or removed if condition is false
 * @param {string} b classes to be removed if condition is true or added if condition is false
 */
export function swap(element, condition, a = "", b = "") {
  if (b)
    element.classList[condition ? "remove" : "add"](...b.split(" "));
  element.classList[condition ? "add" : "remove"](...a.split(" "));
}
