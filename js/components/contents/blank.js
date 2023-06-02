import { register } from "../../lib/luri.js";
import Content from "../content.js";

export default class BlankContent extends Content {

  contentx() {
    return "";
  }

  inx() {
    return Promise.resolve(this);
  }

  outx() {
    return Promise.resolve(this);
  }

  ninjax() {
    return true;
  }

}

register(BlankContent);