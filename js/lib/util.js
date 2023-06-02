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
 * Check if instance implements interface
 * @param {any} instance 
 * @param {any} interface 
 */
// export function implements(instance, interface) {
//   return instance instanceof interface ||
//     Object.getOwnPropertyNames(interface.prototype).reduce((implements, method) => {
//       return implements && instance.constructor.prototype.hasOwnProperty(method);
//     }, true);
// }

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

/**
 * A utility function that allows you to modify the DOM *in style*.
 * 
 * if add and remove are present then replaces remove with add  
 * if add and parent are present then appends add to parent  
 * if only remove is present then removes remove from its parent
 * if add, remove, and parent are present then insert add before remove in parent
 * 
 * if add or remove implement Animatable their respective animations
 * will get called
 * 
 * @param {HTMLElement | null} add 
 * @param {HTMLElement | null} remove 
 * @param {HTMLElement | null} parent 
 * @returns {Promise} Resolves when all animations are over
 */
export async function smoothie(add, remove, parent) {
  if (remove) {
    if (remove.outx) {
      await remove.outx(add);
    } else {
      await animate(remove, "fadeOut");
    }
  }
  if (add) {
    if (remove) {
      if (parent) {
        add = luri.insert(add, parent, remove);
      } else {
        add = luri.replace(remove, add);
      }
    } else {
      add = luri.append(add, parent);
    }
    if (add.inx) {
      await add.inx(remove);
    } else {
      await animate(add, "fadeIn");
    }
  } else {
    remove.remove();
  }
  return add || remove;
}

/**
 * Run an animation on element by adding animatecss classes.
 * @param {HTMLElement} element 
 * @param {string} animation 
 */
export function animate(element, animation) {
  if (element.classList.contains("animate__animated")) {
    return element.animationPromisex;
  }

  let anim = "animate__" + animation;
  element.classList.add("animate__animated", anim);

  return element.animationPromisex = new Promise(resolve => {
    element.onanimationend = () => {
      element.onanimationend = null;
      element.classList.remove("animate__animated", anim)
      resolve(element);
    };
  });
}

/*
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
document.addEventListener('mousedown', handleTouchStart, false);
document.addEventListener('mousemove', handleTouchMove, false);
document.addEventListener('mouseup', handleRelease, false);

var xDown = null;
var yDown = null;

function handleRelease() {
  xDown = null;
  yDown = null;
}

function getTouches(evt) {
  return (evt.touches || [evt])[0];
}

function handleTouchStart(evt) {
  const firstTouch = getTouches(evt);
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
  const touch = getTouches(evt);

  if (!xDown || !yDown) {
    return;
  }

  var xUp = touch.clientX;
  var yUp = touch.clientY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0) {
      console.log("LEFT", evt.target);
      // left swipe
    } else {
      console.log("RIGHT", evt.target);
      // right swipe
    }
  } else {
    if (yDiff > 0) {
      console.log("UP", evt.target);
      // up swipe
    } else {
      console.log("DOWN", evt.target);
      // down swipe
    }
  }

  xDown = null;
  yDown = null;
};

*/