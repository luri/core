import { register } from "../../lib/luri.js";
import Content from "../content.js";

export default class ErrorContent extends Content {

  constructx(props) {
    return {
      class: "flex flex-col items-center text-center",
      html: [
        {
          class: "relative inline-block p-16 m-10 bg-gray-800 rounded-full text-6xl text-red-700 font-bold border-red-800 border-solid border-2 shadow-lg",
          html: [
            {
              class: "absolute left-0 top-0 w-full h-full flex justify-center items-center",
              html: "!"
            },
          ]
        },
        H1({
          class: "text-2xl font-weight-bold px-6 py-3",
          html: "Error"
        }),
        P({
          class: "text-gray-600",
          html: props.message
        }),
      ]
    }
  }
}

register(ErrorContent);