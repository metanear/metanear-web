import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Home } from './Home';
import { Auth } from './Auth';

class App extends Component {
  render() {
    return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route exact path="/" component={() => <Home {...this.props}/>} />
          <Route path="/auth" component={() => <Auth {...this.props}/>} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
