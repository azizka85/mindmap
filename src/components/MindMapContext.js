export default class MindMapContext {
  #toolBar;
  #mindMap;

  constructor(toolBar, mindMap) {
    this.#toolBar = toolBar;
    this.#mindMap = mindMap;
  }

  get toolBar() {
    return this.#toolBar;
  }

  get mindMap() {
    return this.#mindMap;
  }
}
