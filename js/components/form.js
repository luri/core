import web from "../lib/web.js";
import loader from "./loader.js";
import { Component, register } from "../lib/luri.js";
import { smoothie } from "../lib/util.js";

export default class Form extends Component(HTMLFormElement) {

  static parentx() {
    return "form";
  }

  /**
   * Gets called before fetch()
   * 
   * @param {FormData} formdata
   * @param {HTMLFormElement} form
   */
  onbeforesendx(formdata) {
    return formdata;
  }

  /**
   * Gets called when the action was successful
   * 
   * @param {any} response 
   */
  onsuccessx(response) {
    console.log("Form submission success: ", response);
  }

  /**
   * Gets called when the action was unsuccessful
   * 
   * @param {any} response 
   * @param {HTMLFormElement} form
   */
  onfailurex(response) {
    let report = true;
    let errors = response.form ? response.form.errors : response.errors;
    
    for (let error in errors) {
      let input = this.elements[error];
      if (input) {
        input.setCustomValidity(errors[error]);
        if (report) {
          input.reportValidity();
          report = false;
        }
      }
    }
  }

  /**
   * Gets called when an error occured either in
   * the network or in the response
   * 
   * @param {any} error 
   * @param {HTMLFormElement} form
   */
  onerrorx(error) {
    console.log("Form submission error: ", error);
  }

  /**
   * Process the response, call the appropriate handler
   * 
   * @param {Promise} promise result from fetch() call
   * @param {HTMLFormElement} form
   */
  onfetchx(promise) {
    let loader = this.loaderx();
    smoothie({ html: loader }, null, this)

    return promise.catch(error => error).then(async response => {
      loader.remove();

      if (this.validaterespx(response)) {
        this.onsuccessx(response);
      } else if (this.validatefailrespx(response)) {
        this.onfailurex(response);
      } else {
        this.onerrorx(response);
      }
    });
  }

  /**
   * Amount of time to wait before appending a loader
   */
  loaderTimeoutx() {
    return 200;
  }

  /**
   * Tell if the response is a success or a failure
   * @param {any} response 
   */
  validaterespx(response) {
    return response.ok;
  }

  validatefailrespx(response) {
    return response.ok === false;
  }

  /**
   * Perform the actual submit request
   * @param {string} url 
   * @param {string} method 
   * @param {FormData} data 
   */
  fetchx(url, method, data) {
    return web.request(url, {
      method: method,
      data: data
    });
  }

  /**
   * Intercepts the submit event and transforms
   * it into a fetch request
   */
  onSubmit(event) {
    // prevent form from actually submitting
    event.preventDefault();

    if (!this.isLoadingx(this)) {
      let data = this.onbeforesendx(new FormData(this));
      
      this.onfetchx(this.fetchx(this.getAttribute("action"), this.getAttribute("method"), data));
    } else {
      console.log("Prevented form submission while loading");
    }
  }

  /**
   * Determines if form is loading by checking for loader
   * @param {HTMLFormElement} form 
   */
  isLoadingx() {
    return this.getElementsByClassName("form-loader").length;
  }

  /**
   * Appends a loader overlay to the form.
   * Warning: adds class "relative" to the form
   */
  loaderx() {
    this.classList.add("relative");

    let classes = "form-loader absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-100 opacity-50";

    return loader(32, classes)
  }
}
register(Form);

