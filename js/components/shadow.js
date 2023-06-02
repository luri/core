import luri, { Component, register } from "../lib/luri.js";
import web from "../lib/web.js";


export default class ShadowComponent extends Component() {

  constructor(props, mode = "open") {
    super(props);

    luri.append(this.shadowpropsx(), this.attachShadow({ mode }));

    for (let url of this.stylesx()) {
      this.stylex(url);
    }
  }

  stylesx() {
    return [];
  }

  shadowpropsx() {
    return SLOT();
  }

  stylex(href) {
    return luri.append(LINK({ rel: "stylesheet", href: web.url(href) }), this.shadowRoot), this;
  }
}
register(ShadowComponent);
