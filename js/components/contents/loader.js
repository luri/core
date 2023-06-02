
import { register } from "../../lib/luri.js";
import Content from "../content.js";
import loader from "../loader.js";

export default class LoaderContent extends Content {

  ninjax() {
    return true;
  }

  constructx() {
    super.constructx({
      class: "flex justify-center items-center my-24",
      html: loader()
    });
  }

}

register(LoaderContent);