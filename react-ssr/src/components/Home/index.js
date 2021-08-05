import React from "react";
import { connect  } from "react-redux";
import { getHomeListData } from './actions';

class Home extends React.Component {
  render() {
    console.log('home')
    const { list, onPrevPage, onNextPage, currentPage } = this.props;
    return (
      <div>
        {
          list.map(item => {
            return (
              <p key={item.sid}>
                {item.title}
              </p>
            )
          })
        }
        <p>
          <button onClick={() => onPrevPage(currentPage)}>上一页</button>
          <span>&nbsp;第{currentPage}页&nbsp;</span>
          <button onClick={() => onNextPage(currentPage)}>下一页</button>
        </p>
      </div>
    )
  }
  componentDidMount() {
    const props = this.props;
    if (props.list.length) return;
    props.getHomeListData();
  }
}

const mapStateToProps = state => {
  return {
    currentPage: state.home.currentPage,
    list: state.home.listData
  }
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    getHomeListData: () => dispatch(getHomeListData()),
    onPrevPage: (currentPage) => {
      const value = Math.max(1, currentPage - 1);
      if (value === currentPage) return;
      dispatch(getHomeListData(value));
    },
    onNextPage: (currentPage) => {
      const value = currentPage + 1;
      dispatch(getHomeListData(value));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
