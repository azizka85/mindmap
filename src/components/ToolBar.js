export default class ToolBar extends HTMLDivElement {
  #activateLeftNodeTool;
  #activateUpNodeTool;
  #activateDownNodeTool;
  #activateRightNodeTool;
  #saveDataTool;

  #activeNode;

  context;  

  constructor(init = false) {
    super();

    this.className = 'toolbar';

    if(init) {
      this.innerHTML = `
        <svg class="tool" viewBox="0 0 16 16" data-action="activate-left-node">
          <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm11.5 5.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
        </svg>
        <svg class="tool" viewBox="0 0 16 16" data-action="activate-up-node">
          <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm8.5 9.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
        </svg>
        <svg class="tool" viewBox="0 0 16 16" data-action="activate-down-node">
          <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm8.5 2.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
        </svg>
        <svg class="tool" viewBox="0 0 16 16" data-action="activate-right-node">
          <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
        </svg>
        <svg class="tool" viewBox="0 0 16 16" data-action="save-data">
          <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"/>
        </svg>
      `;
    }

    this.#activateLeftNodeTool = this.querySelector('[data-action="activate-left-node"]');
    this.#activateLeftNodeTool.onclick = this.activateLeftNode.bind(this);

    this.#activateUpNodeTool = this.querySelector('[data-action="activate-up-node"]');
    this.#activateUpNodeTool.onclick = this.activateUpNode.bind(this);

    this.#activateDownNodeTool = this.querySelector('[data-action="activate-down-node"]');
    this.#activateDownNodeTool.onclick = this.activateDownNode.bind(this);

    this.#activateRightNodeTool = this.querySelector('[data-action="activate-right-node"]');
    this.#activateRightNodeTool.onclick = this.activateRightNode.bind(this);

    this.#saveDataTool = this.querySelector('[data-action="save-data"]');
    this.#saveDataTool.onclick = this.saveToLocalStorage.bind(this);

    this.canSave = false;
    this.update();
  }

  get activeNode() {
    return this.#activeNode;
  }

  set activeNode(item) {
    if(this.activeNode) {
      this.activeNode.active = false;
    }
    if(item) {
      item.active = true;
    }
    this.#activeNode = item;
    this.update();
  }

  get canSave() {
    return this.#saveDataTool.style.display !== 'none';
  }

  set canSave(value) {
    this.#saveDataTool.style.display = value ? '' : 'none';
  }

  canActivateLeftNode() {
    return this.activeNode?.canMoveToLeftNode?.() || false;
  }

  activateLeftNode() {
    return this.activeNode?.moveToLeftNode?.();
  }

  canActivateUpNode() {
    return this.activeNode?.canMoveToUpNode?.() || false;
  }

  activateUpNode() {
    return this.activeNode?.moveToUpNode?.();
  }

  canActivateDownNode() {
    return this.activeNode?.canMoveToDownNode?.() || false;
  }

  activateDownNode() {
    return this.activeNode?.moveToDownNode?.();
  }

  canActivateRightNode() {
    return this.activeNode?.canMoveToRightNode?.() || false;
  }

  activateRightNode() {
    return this.activeNode?.moveToRightNode?.();
  }

  saveToLocalStorage() {
    this.context?.mindMap?.saveToLocalStorage?.();
  }

  update() {
    this.#activateLeftNodeTool.style.display = this.canActivateLeftNode() ? '' : 'none';
    this.#activateUpNodeTool.style.display = this.canActivateUpNode() ? '' : 'none';
    this.#activateDownNodeTool.style.display = this.canActivateDownNode() ? '' : 'none';
    this.#activateRightNodeTool.style.display = this.canActivateRightNode() ? '' : 'none';
  }
}
