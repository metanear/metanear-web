import React, { Component } from 'react';
import nearlogo from './assets/gray_near_logo.svg';
import './css/App.css';
import * as nearlib from "nearlib";
import { OpenWebApp } from 'near-openweb-js';
import { ProfileApp } from "./apps/ProfileApp";
import { ChatApp } from "./apps/Chat/ChatApp";
import { MailApp } from "./apps/MailApp";
// import { KeysApp } from "./apps/KeysApp";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { PowFaucet, AuthDataKey}  from "./components/PowFaucet";

const GAS = 2_000_000_000_000_000;
const TITLE = "Meta NEAR - User-centric web"
const DefaultTabIndexKey = "metanearDefaultTabIndex";

export class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      apps: {},
      logs: [],
      mailUnread: 0,
      chatUnread: 0,
      loading: false,
      defaultTabIndex: JSON.parse(window.localStorage.getItem(DefaultTabIndexKey) || '0'),
    }
    this.signedInFlow = this.signedInFlow.bind(this);
    this.requestSignIn = this.requestSignIn.bind(this);
    this.requestSignOut = this.requestSignOut.bind(this);
    this.signedOutFlow = this.signedOutFlow.bind(this);
    this.checkSignIn = this.checkSignIn.bind(this);
    this.initOpenWebApp = this.initOpenWebApp.bind(this);
    window.nearlib = nearlib;
  }

  componentDidMount() {
    this.checkSignIn();
  }

  async checkSignIn() {
    let loggedIn = window.walletAccount.isSignedIn();
    let authData = JSON.parse(window.localStorage.getItem(AuthDataKey) || '{}');
    if (loggedIn || authData.accountId) {
      await this.signedInFlow(authData);
    } else {
      this.signedOutFlow();
    }
  }

  log(message) {
    console.log(message);
    this.setState({
      logs: this.state.logs.concat([message])
    })
  }

  async signedInFlow(authData) {
    const accountId = authData.accountId || await this.props.wallet.getAccountId();
    this.setState({
      login: true,
      loading: true,
      accountId,
    })
    if (window.location.search.includes("account_id")) {
      window.location.replace(window.location.origin + window.location.pathname)
    }
    if (window.location.search.includes("all_keys")) {
      window.location.replace(window.location.origin + window.location.pathname)
    }
    // Initializing our contract APIs by contract name and configuration.

    this.log("Connecting to account...");
    const account = await new nearlib.Account(window.near.connection, accountId);
    this.log("Querying state...");
    let state = await account.state();
    /*
    await new Promise((resolve, reject) =>{
      setTimeout(() => {
        resolve();
      }, 5000);
    })
     */
    console.log(state);
    if (state.code_hash !== 'C8UmYSqATkuyhheJ7i7ryxPjfZL4nV8PfkovdMKitsmJ') {
      this.log("Going to deploy the code");
      // no code. Need to deploy.
      this.log("Downloading started...");
      let data = await fetch('/open_web.wasm');
      let buf = await data.arrayBuffer();
      this.log("Downloading done. Deploying contract...");
      await account.deployContract(new Uint8Array(buf));
      if (state.code_hash === '11111111111111111111111111111111') {
        this.log("Deploying done. Initializing contract...");
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
      this.log("The contract is deployed");
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
    this.log("Fetching authorized apps...");
    console.log("Apps:", await masterContract.apps());

    // this.initOpenWebApp = this.initOpenWebApp.bind(this);

    this.log("Initializing local apps...");
    const apps = {
      profile: await this.initOpenWebApp('profile', accountId),
      chat: await this.initOpenWebApp('chat', accountId),
      mail: await this.initOpenWebApp('mail', accountId),
      // keys: await this.initOpenWebApp('keys', accountId)
    };
    window.apps = apps;
    this.apps = apps;
    this.setState({
      apps,
      loading: false,
    })
  }

  async initOpenWebApp(appId, accountId) {
    this.log("Initializing app: " + appId + " ...");
    const app = new OpenWebApp(appId, accountId, window.nearConfig);
    await app.init();
    if (!await app.ready()) {
      let pk = await app.getAccessPublicKey();
      this.log("Authorizing app for key " + pk.toString() + " ...");
      const serializedPk = await app.getSerializedAccessPublicKey();
      const args = {
        public_key: [...serializedPk],
        app_id: appId,
      };
      await this.masterContract.add_app_key(args, GAS);
      await app.onKeyAdded();
    }
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

  selectTab = (index) => {
    window.localStorage.setItem(DefaultTabIndexKey, JSON.stringify(index));
    this.setState({
      defaultTabIndex: index,
    })
  }

  render() {
    const unread = this.state.mailUnread + this.state.chatUnread;
    document.title = (unread ? `(${unread}) ` : "") + TITLE;
    if (!this.state.login) {
      return <div className="App-header">
        <div>
          <div className="image-wrapper">
            <img className="logo" src={nearlogo} alt="NEAR logo"/>
          </div>
          <h1>Hello ?</h1>
          <div>
            <button
                className="btn btn-primary"
                onClick={this.requestSignIn}>Log in with NEAR Wallet</button>
          </div>
          <PowFaucet onLogin={this.signedInFlow}/>
        </div>
      </div>
    } else if (this.state.loading) {
      return <div className="loading-div">
        <div className="spinner-grow loading-spinner" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <pre className="text-left">
          {this.state.logs.join("\n")}
        </pre>
      </div>
    } else {
      return <div className={"h100 apps" + (this.state.loading ? " d-none" : "")}>
        <Tabs className="h100 cflex" forceRenderTabPanel={true} defaultIndex={this.state.defaultTabIndex} onSelect={(i) => this.selectTab(i)}>
          <TabList>
            <Tab>Profile</Tab>
            <Tab>Public Chat {this.state.chatUnread ? `(${this.state.chatUnread})` : ""}</Tab>
            <Tab>Mail {this.state.mailUnread ? `(${this.state.mailUnread})` : ""}</Tab>
            {/*<Tab>Keys</Tab>*/}
          </TabList>

          <TabPanel>
            <ProfileApp app={this.state.apps.profile} logOut={this.requestSignOut}/>
          </TabPanel>
          <TabPanel style={{flexGrow: '1'}}>
            <ChatApp app={this.state.apps.chat} onUnread={(chatUnread) => this.setState({chatUnread})}/>
          </TabPanel>
          <TabPanel>
            <MailApp app={this.state.apps.mail} onUnread={(mailUnread) => this.setState({mailUnread})}/>
          </TabPanel>
          {/*<TabPanel>
            <KeysApp app={this.state.apps.keys}/>
          </TabPanel>*/}
        </Tabs>
      </div>
    }
  }
}
