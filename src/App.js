import React, { Component } from 'react';
import nearlogo from './assets/gray_near_logo.svg';
import './App.css';
import * as nearlib from "nearlib";
import {OpenWebApp} from './openweb.js';
import {ProfileApp} from "./ProfileApp";
import {MailApp} from "./MailApp";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const GAS = 2_000_000_000_000_000;
const TITLE = "Open Web Home - NEAR"

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      apps: {},
      unread: 0,
    }
    this.signedInFlow = this.signedInFlow.bind(this);
    this.requestSignIn = this.requestSignIn.bind(this);
    this.requestSignOut = this.requestSignOut.bind(this);
    this.signedOutFlow = this.signedOutFlow.bind(this);
    window.nearlib = nearlib;
  }

  componentDidMount() {
    let loggedIn = window.walletAccount.isSignedIn();
    if (loggedIn) {
      this.signedInFlow();
    } else {
      this.signedOutFlow();
    }
  }

  async signedInFlow() {
    console.log("come in sign in flow")
    const accountId = await this.props.wallet.getAccountId()
    this.setState({
      login: true,
      accountId,
    })
    if (window.location.search.includes("account_id")) {
      window.location.replace(window.location.origin + window.location.pathname)
    }
    if (window.location.search.includes("all_keys")) {
      window.location.replace(window.location.origin + window.location.pathname)
    }
    // Initializing our contract APIs by contract name and configuration.

    console.log("Connecting to account...");
    const account = await new nearlib.Account(window.near.connection, accountId);
    console.log("Querying state...");
    let state = await account.state();
    console.log(state);
    if (state.code_hash !== 'CbG5c4viMES2C47pc8SYWGc4F8W4EBSzD4RLjVqTPDR6') {
      console.log("Going to deploy the code");
      // no code. Need to deploy.
      console.log("Downloading started...");
      let data = await fetch('/open_web.wasm');
      let buf = await data.arrayBuffer();
      console.log("Downloading done. Deploying contract...");
      await account.deployContract(new Uint8Array(buf));
      if (state.code_hash === '11111111111111111111111111111111') {
        console.log("Deploying done. Initializing contract...");
        // Gotta init it.
        let contract = await new nearlib.Contract(account, accountId, {
          viewMethods: [],
          // Change methods can modify the state. But you don't receive the returned value when called.
          changeMethods: ['new'],
          // Sender is the account ID to initialize transactions.
          sender: accountId
        });
        console.log(await contract.new());
      }
      console.log("Done");
    }

    const masterContract = await new nearlib.Contract(account, accountId, {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: ['apps'],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: ['add_app_key', 'remove_app_key'],
      // Sender is the account ID to initialize transactions.
      sender: accountId
    });

    this.masterContract = masterContract;
    window.masterContract = masterContract;
    console.log("Fetching authorized apps...");
    console.log("Apps:", await masterContract.apps());

    console.log("Initializing local apps...");
    const apps = {
      profile: await this.initOpenWebApp('profile', accountId),
      graph: await this.initOpenWebApp('graph', accountId),
      mail: await this.initOpenWebApp('mail', accountId),
    };
    window.apps = apps;
    this.apps = apps;
    this.setState({
      apps,
    })
    console.log(apps);
  }

  async initOpenWebApp(appId, accountId) {
    console.log("Initializing app: " + appId + " ...");
    const app = await new OpenWebApp(appId, accountId, window.nearConfig);
    await app.init();
    if (!await app.ready()) {
      let pk = await app.getPublicKey();
      console.log("Authorizing app for key " + pk.toString() + " ...");
      const args = {
        public_key: [...nearlib.utils.serialize.serialize(nearlib.transactions.SCHEMA, pk)],
        app_id: appId,
      };
      await this.masterContract.add_app_key(args, GAS);
      await app.onKeyAdded();
    }
    console.log("Done");
    return app;
  }

  async requestSignIn() {
    const appTitle = 'Open Web Home';
    await this.props.wallet.requestSignIn(
      "",
      appTitle
    )
  }

  requestSignOut = () => {
    this.props.wallet.signOut();
    setTimeout(this.signedOutFlow, 500);
    console.log("after sign out", this.props.wallet.isSignedIn())
  }


  signedOutFlow = () => {
    if (window.location.search.includes("account_id")) {
      window.location.replace(window.location.origin + window.location.pathname)
    }
    this.setState({
      login: false,
    })
  }

  render() {
    document.title = (this.state.unread ? `(${this.state.unread}) ` : "") + TITLE;
    return (
      <div className="App-header">
        <div className="image-wrapper">
          <img className="logo" src={nearlogo} alt="NEAR logo" />
        </div>
        <h1>Hello{this.state.login ? ", " + this.state.accountId : "?"}</h1>
        <div>
          {this.state.login ? <button onClick={this.requestSignOut}>Log out</button>
            : <button onClick={this.requestSignIn}>Log in with NEAR</button>}
        </div>
        <br/>
        {this.state.login && (
          <div className="apps">
            <Tabs forceRenderTabPanel={true}>
              <TabList>
                <Tab>Profile</Tab>
                <Tab>Mail {this.state.unread ? `(${this.state.unread})` : ""}</Tab>
              </TabList>

              <TabPanel>
                <ProfileApp app={this.state.apps.profile}/>
              </TabPanel>
              <TabPanel>
                <MailApp app={this.state.apps.mail} onNewMail={(unread) => this.setState({unread})}/>
              </TabPanel>
            </Tabs>
          </div>
        )}
      </div>
    )
  }

}

export default App;
