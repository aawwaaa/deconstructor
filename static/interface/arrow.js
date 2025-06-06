class ArrowManager {
  constructor(parent = document.body) {
    this.arrowMap = new Map(); // 存储箭头信息 {arrowId: {svgElement, fromElement, toElement}}
    this.svgContainer = null;
    this.initSvgContainer(parent);
    this.parent = parent;
  }

  // 初始化SVG容器
  initSvgContainer(parent) {
    this.svgContainer = document.createElement('div');
    this.svgContainer.style.position = 'absolute';
    this.svgContainer.style.top = '0';
    this.svgContainer.style.left = '0';
    this.svgContainer.style.width = '100%';
    this.svgContainer.style.height = '100%';
    this.svgContainer.style.pointerEvents = 'none';
    this.svgContainer.style.zIndex = '-2';
    this.svgContainer.style.overflow = 'visible';
    parent.appendChild(this.svgContainer);
  }

  rect(element) {
    const rect = element.getBoundingClientRect();
    const left = Math.floor(this.parent.scrollLeft), top = Math.floor(this.parent.scrollTop);
    return {left: rect.left + left, right: rect.right + left, top: rect.top + top, bottom: rect.bottom + top,
            width: rect.width, height: rect.height}
    // return rect
  }

  // 创建箭头
  createArrow(arrowId, fromElement, toElement, options = {}) {
    // 如果箭头已存在，先删除
    if (this.arrowMap.has(arrowId)) {
      this.removeArrow(arrowId);
    }

    const defaultOptions = {
      strokeColor: '#333',
      strokeWidth: 2,
      arrowSize: 6,
      curveRadius: 0,
      margin: 5
    };
    options = {...defaultOptions, ...options};

    // 创建SVG元素
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('class', 'dynamic-arrow');
    svg.style.position = 'absolute';
    svg.style.overflow = 'visible';
    
    // 添加到容器
    this.svgContainer.appendChild(svg);
    
    // 存储引用
    this.arrowMap.set(arrowId, {
      svgElement: svg,
      fromElement,
      toElement,
      options
    });

    // 更新箭头位置
    this.updateArrow(arrowId);

    return arrowId;
  }

  // 更新箭头位置
  updateArrow(arrowId) {
    if (!this.arrowMap.has(arrowId)) return;

    const {svgElement, fromElement, toElement, options} = this.arrowMap.get(arrowId);
    
    // 获取元素位置
    const fromRect = this.rect(fromElement);
    const toRect = this.rect(toElement);
    
    // 计算起点和终点
    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top - options.margin + 1;
    let endX = 0, endY = 0, points = '';
    if (toRect.bottom < fromRect.top) {
      endX = toRect.left + toRect.width / 2;
      endY = toRect.bottom;
      points = `0,0 ${options.arrowSize},${options.arrowSize / 2} 0,${options.arrowSize}`
    } else if (startX < toRect.left) {
      endX = toRect.left;
      endY = toRect.top + toRect.height / 2;
      points = `0,0 ${options.arrowSize},0 ${options.arrowSize / 2},${options.arrowSize}`
    } else if (startX > toRect.left) {
      endX = toRect.right;
      endY = toRect.top + toRect.height / 2;
      points = `0,${options.arrowSize} ${options.arrowSize},0 ${options.arrowSize / 2},0`
    }
    
    // 计算中间控制点
    const midY = Math.min(endY + 10, startY);
    
    // 创建路径数据
    let pathData;
    if (options.curveRadius > 0) {
      // 带曲线的路径
      pathData = `M${startX},${startY} 
                 L${startX},${midY + options.curveRadius} 
                 Q${startX},${midY} ${startX + (endX > startX ? options.curveRadius : -options.curveRadius)},${midY}
                 L${endX},${midY}
                 L${endX},${endY}`;
    } else {
      // 直线路径
      pathData = `M${startX},${startY} 
                  L${startX},${midY} 
                  L${endX},${midY} 
                  L${endX},${endY}`;
    }
    
    // 清空SVG
    svgElement.innerHTML = '';
    
    // 设置SVG尺寸和位置
    const svgWidth = Math.max(startX, endX) + options.arrowSize * 2;
    const svgHeight = Math.max(startY, endY) + options.arrowSize * 2;
    svgElement.setAttribute('width', svgWidth);
    svgElement.setAttribute('height', svgHeight);
    svgElement.style.left = '0';
    svgElement.style.top = '0';
    
    // 创建路径
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', options.strokeColor);
    path.setAttribute('stroke-width', options.strokeWidth);
    path.setAttribute('fill', 'none');
    
    // 创建箭头标记
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute('id', `arrowhead-${arrowId}`);
    marker.setAttribute('markerWidth', options.arrowSize);
    marker.setAttribute('markerHeight', options.arrowSize);
    marker.setAttribute('refX', options.arrowSize / 2);
    marker.setAttribute('refY', options.arrowSize / 2);
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute('points', points);
    polygon.setAttribute('fill', options.strokeColor);
    
    marker.appendChild(polygon);
    
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.appendChild(marker);
    
    path.setAttribute('marker-end', `url(#arrowhead-${arrowId})`);
    
    svgElement.appendChild(defs);
    svgElement.appendChild(path);
  }

  // 更新所有箭头
  updateAllArrows() {
    this.arrowMap.forEach((value, arrowId) => {
      this.updateArrow(arrowId);
    });
  }

  // 修改箭头目标
  modifyArrowTarget(arrowId, newToElement) {
    if (!this.arrowMap.has(arrowId)) return;
    
    const arrowData = this.arrowMap.get(arrowId);
    arrowData.toElement = newToElement;
    this.arrowMap.set(arrowId, arrowData);
    
    this.updateArrow(arrowId);
  }

  // 删除箭头
  removeArrow(arrowId) {
    if (!this.arrowMap.has(arrowId)) return;
    
    const {svgElement} = this.arrowMap.get(arrowId);
    if (svgElement && svgElement.parentNode) {
      svgElement.parentNode.removeChild(svgElement);
    }
    
    this.arrowMap.delete(arrowId);
  }

  // 删除所有箭头
  removeAllArrows() {
    this.arrowMap.forEach((value, arrowId) => {
      this.removeArrow(arrowId);
    });
  }

  // 销毁管理器
  destroy() {
    this.removeAllArrows();
    if (this.svgContainer && this.svgContainer.parentNode) {
      this.svgContainer.parentNode.removeChild(this.svgContainer);
    }
  }
}

export {ArrowManager}
