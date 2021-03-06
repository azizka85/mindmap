import './styles/main.scss';
import MindMapContext from './components/MindMapContext';
import MindMap from './components/MindMap';
import ToolBar from './components/ToolBar';
import MindNode from './components/MindNode';

customElements.define('mind-map', MindMap, { extends: 'ul' });
customElements.define('tool-bar', ToolBar, { extends: 'div' });
customElements.define('mind-node', MindNode, { extends: 'li' });

const container = document.createElement('div');
container.className = 'container';

const mindMap = new MindMap();
const toolBar = new ToolBar(true);
const context = new MindMapContext(toolBar, mindMap);

mindMap.context = context;
toolBar.context = context;

mindMap.loadFromLocalStorage();

container.appendChild(toolBar);
container.appendChild(mindMap);
document.body.appendChild(container);
