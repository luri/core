import luri, { Component, register } from "../lib/luri.js";
import Content from "./content.js";

export default class ContentRoot extends Component() {

  constructor(props) {
    super(props);

    /**
     * Stores contents by id
     */
    this.contentCachex = new Map;

    /**
     * Indicates whether a transition is taking place
     */
    this.navingx = false;

    /**
     * Stores paths when navigating too quickly.
     */
    this.navqx = [];
  }

  /**
   * Path that will be loaded if missing or /
   */
  defaultPathx() {
    return "/home";
  }

  /**
 * Content with the same ID will only get constructed once
 */
  cacheContentx() {
    return true;
  }

  /**
   * The amount of time in ms to wait before rendering
   * a loader in the root whenever navigation is taking place
   */
  loaderTimeoutx() {
    return 200;
  }

  /**
   * The amount of time in ms to wait before rendering
   * an error screen whenever waiting for content data
   */
  contentTimeoutx() {
    return 15000;
  }

  constructx(props = {}) {
    props.html = {};

    return props;
  }

  /**
   * Parses a route into a path and query as array.
   * 
   * @param {string} route
   * @returns {[string, any]}
   */
  parsex(route) {
    let colon = route.indexOf(":"),
      query = null;

    if (colon > 0) {
      route = route.substring(0, colon);
      query = decodeURIComponent(route.substring(1));
      try {
        query = JSON.parse(query);
      } catch (e) {
        // sigh 
      }
    }

    return [route, query];
  }

  /**
   * Gives the opportunity to intercept navigation
   * @param {string} path 
   * @param {any} query 
   */
  validatex(path, query) {
    return true;
  }

  async navigatex(route = "") {
    // Make sure only one navigation is taking
    // place at any time
    if (this.navingx) {
      this.navqx.push(route);
      return false;
    }
    this.navingx = true;

    // Get derived path and query data
    let [path, query] = this.parsex(route);
    if (!path || path === "/") {
      path = this.defaultPathx();
    }

    // Make sure this root can satisfy the request
    if (!this.validatex(path, query)) {
      return this.endnavx();
    }

    let loader = null;

    // renders a loader if the content hasn't rendered
    // within loaderTimeoutx ms. Then starts the 
    // navigation timeout timer which will terminate
    // the navigation process after contentTimeoutx ms
    let to = setTimeout(() => {
      loader = this.renderx(this.loaderx())
      to = setTimeout(() => {
        // TODO add timedoutx function for extendability
        to = false;
        this.renderx(this.errorhandlerx(new Error("Timed out"))).then(() => {
          this.endnavx();
        });
      }, this.contentTimeoutx());
    }, this.loaderTimeoutx());

    let content = await this.contentx(path, query)
      .catch(error => this.errorhandlerx(error));

    if (to === false) {
      return false;
    } else {
      clearTimeout(to);
      await loader;
    }

    luri.emit("ContentRender", route, path, query, content, this);

    await this.renderx(content);

    luri.emit("ContentRendered", route, path, query, content, this);

    return this.endnavx(content);
  }

  /**
   * Finalizes a navigation sequence
   * Makes sure all requests in navqx are rendered
   */
  endnavx(content) {
    this.navingx = false;
    if (this.navqx.length) {
      return this.navigatex(this.navqx.shift());
    }
    return content;
  }

  async contentx(path, query = null) {
    let module = await this.loadx(this.resolvex(path, query));

    let contentClass = module.default;

    if (!(contentClass.prototype instanceof Content)) {
      throw new Error("Default export must extend Content");
    }

    let content = null;

    if (this.cacheContentx()) {
      let id = contentClass.idx(query);

      if (this.contentCachex.has(id)) {
        content = this.contentCachex.get(id);
        await content.interceptx();
        return content;
      } else {
        content = new contentClass({
          query: query,
          root: this
        });
        await content.interceptx();
        if (content.cachex()) {
          this.contentCachex.set(id, content);
        }
      }
    } else {
      content = new contentClass({
        query: query,
        root: this
      });
      await content.interceptx();
    }

    return await this.executex(content);
  }

  async executex(content) {

    let def = null;
    try {
      def = content.contentx(await content.datax());
    } catch (error) {
      def = this.errorhandlerx(error, content);
    }

    for (let child of (Array.isArray(def) ? def : [def])) {
      luri.append(child, content);
    }

    return content;
  }

  /**
   * Renders definition in the content root
   * @param {Content} content
   */
  async renderx(content) {
    return Promise.resolve(luri.replace(this.getCurrentContentx(), content));
  }

  getContentRootElementx() {
    return this;
  }

  getCurrentContentx() {
    return this.getContentRootElementx().firstElementChild;
  }

  /**
   * Resolve the route into a module path
   * 
   * @param {string} path 
   * @param {any} query 
   */
  resolvex(path, query) {
    return "";
  }

  /**
   * Unfortunately, dynamic ES6 modules will be loaded relative to
   * the file where the "import" call resides. Thus this function must be 
   * re-implemented in every child content-root. Containing only the following
   * is sufficient:
   * 
   * return import(module);
   * 
   * @param {string} module 
   */
  loadx(module) {
    throw new Error("Must implement loader");
  }

  /**
   * Definition that will be rendered while content is loading
   */
  loaderx() {
    return {
      html: [
        "Loading.."
      ]
    };
  }

  /**
   * Definition that will be rendered when an error occurs
   */
  errorx(thrown) {
    return [
      {
        node: "h1",
        style: "text-align: center; font-size: 150%; font-weight: bold;",
        html: "Error"
      },
      {
        node: "p",
        html: thrown.message
      },
    ]
  }

  /**
   * Whenever a content component can not be rendered this will get called
   * 
   * @param {any} thrown 
   * @param {Content} content the content that was attempted to be rendered
   * @returns {Content} Content to be rendered
   */
  errorhandlerx(thrown, content) {
    if (thrown instanceof Content) {
      return thrown;
    } else {
      console.error(thrown);

      return (content && content.errorx ? content.errorx(thrown) : null) ||
        this.errorx(new Error("Sorry, the content you are looking for can not be displayed right now."));
    }
  }

}

register(ContentRoot);