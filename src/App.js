import React, { Component } from 'react';
import {HashRouter, Route, Switch} from "react-router-dom";
import { Home } from './Home';
import { Auth } from './Auth';

class App extends Component {
  render() {
    return (
      <HashRouter basename={process.env.PUBLIC_URL} hashType="noslash">
        <Switch>
          <Route exact path="/" component={() => <Home {...this.props}/>} />
          <Route path="/auth" component={() => <Auth {...this.props}/>} />
        </Switch>
      </HashRouter>
    );
  }
}

export default App;
