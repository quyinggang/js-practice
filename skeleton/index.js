class Skeleton {
  constructor($el, options) {
    if (!($el instanceof HTMLElement)) {
      throw new Error('非法挂载元素')
    }
    const defaultConfig = {
      active: false,
      rows: 3
    }
    this.$el = $el;
    this.config = Object.assign({}, defaultConfig, options);
    this.init();
  }

  init() {
    const { $el, config } = this;
    const domParser = new DOMParser();
    const liNodeList = Array(config.rows).fill(0).map(() => {
      return '<li class="li"></li>'
    });
    const skeletonClass = `skeleton ${config.active ? 'skeleton--active' : ''}`.trim();
    const htmlTemplate = `
      <div class="${skeletonClass}">
        <section class="skeleton-content">
          <h3 class="title"></h3>
          <ul class="ul">
            ${liNodeList.join('\n')}
          </ul>
        </section>
      </div>
    `;
    const doc = domParser.parseFromString(htmlTemplate, 'text/html');
    $el.appendChild(doc.body.children[0]);
  }
}

export default Skeleton
