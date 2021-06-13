import MindNode from "./MindNode";

export const MindMapContextKey = 'mindmap';

export class MindMap extends HTMLUListElement {
  #mindNodes;
  #context;

  constructor() {
    super();      

    this.className = 'mindmap';
    this.onclick = this.disposeActiveNode.bind(this);
  }

  get context() {
    return this.#context;
  }

  set context(ctx) {
    this.#context = ctx;

    for(let i = 0; i < this.children.length; i++) {
      this.children.item(i).context = ctx;
    }
  }

  initMindNodes() {
    this.#mindNodes = [];

    for(let i = 0; i < this.children.length; i++) {
      this.children.item(i).parentMindNode = this;
      this.children.item(i).initMindNodes();
      this.#mindNodes.push(this.children.item(i).mindNode);
    }
  }

  loadFromLocalStorage() {
    let data = undefined;

    try {
      data = JSON.parse(localStorage.getItem(MindMapContextKey) || '');
    } catch(error) {
      console.error(error);
    }

    if(!data || typeof data !== 'object') {
      data = [{
        id: Date.now(),
        label: 'Press Space or double click to edit',
        mindNodes: []      
      }];
    }

    this.updateMindNodes(data);
  }

  saveToLocalStorage() {
    if(this.#mindNodes) {
      localStorage.setItem(MindMapContextKey, JSON.stringify(this.#mindNodes));
    }
  }

  disposeActiveNode() {
    if(this.context) {
      this.context.toolBar.activeNode = undefined;
    }    
  }

  updateMindNodes(data) {
    this.innerHTML = '';

    data.forEach(node => {
      const item = new MindNode();

      item.parentMindNode = this;
      item.context = this.context;      
      item.mindNode = node;

      this.appendChild(item);
    });

    this.#mindNodes = data;
  }

  mindNodesCount() {
    return this.#mindNodes.length;
  }

  mindNodeIndex(item) {
    return this.#mindNodes.findIndex(elem => elem.id === item.mindNode.id);
  }

  moveToMindNode(index) {
    if(this.context && index < this.children.length) {
      this.context.toolBar.activeNode = this.children.item(index);
    }
  }

  createMindNode() {
    const newNode = {
      id: Date.now(),
      label: '',
      mindNodes: []       
    };

    const item = new MindNode();

    item.parentMindNode = this;
    item.context = this.context;
    item.mindNode = newNode;
    
    this.appendChild(item);
    this.#mindNodes.push(newNode);

    if(this.context) {
      this.context.toolBar.canSave = true;
      this.context.toolBar.activeNode = item;
    }
  }

  removeMindNode(item) {    
    const index = this.#mindNodes.findIndex(elem => elem.id === item.mindNode.id);
    const length = this.#mindNodes.length;

    if(length < 2) return;
    
    this.#mindNodes.splice(index, 1);    
    this.removeChild(item);

    if(this.context) {
      this.context.toolBar.canSave = true;
    }

    let focusIndex = length - 2;

    if(length > index + 1) {
      focusIndex = index;
    }

    if(focusIndex >= 0) {
      this.moveToMindNode(focusIndex); 
    }        
  }
}
