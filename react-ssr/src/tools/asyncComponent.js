import React from "react";

/*
  注意：将异步处理组件单独定义而不是定义在render文件，
  避免router模块与render模块相互引用造成循环引用问题，webpack会报相关错误
*/

// 简单处理异步组件加载，可以使用第三方库react-loadable等
const asyncComponent = function(importComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { component: null };
    }
    componentDidMount() {
      importComponent().then(module => {
        this.setState({ component: module.default });
      })
    }
    render() {
      const Component = this.state.component;
      return Component ? <Component {...this.props} /> : null;
    }
  }
};

export default asyncComponent;
