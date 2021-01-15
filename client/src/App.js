import React, { Component, Fragment } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import LabelingLoader from './label/LabelingLoader';
import OverScreen from './label/OverScreen';
import AdminApp from './admin/AdminApp';
import Home from './home/Home';
import Help from './help/Help';

class App extends Component {
  render() {
    return (
      <Router>
        <Fragment>
          <Route exact path="/" component={Home} />
          <Route path="/admin" component={AdminApp} />
          <Route path="/help" component={Help} />
          <Route
            exact
            path="/label/:projectId/:projectHash"
            component={LabelingLoader}
          />
          <Route
            exact
            path="/label/:projectId/:projectHash/:imageId/:embedded?"
            render={props => {
              if (props.match.params.imageId === 'over') {
                return <OverScreen {...props} />;
              }

              if (props.match.params.embedded === 'embedded') {
                return <LabelingLoader embedded={true} {...props} />;
              }

              return <LabelingLoader {...props} />;
            }}
          />
        </Fragment>
      </Router>
    );
  }
}

export default App;
