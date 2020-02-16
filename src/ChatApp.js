import React from "react";
import anon from "./assets/anon.png";
import {encryptionKey} from "./openweb";

const RE = "Re: ";
const currentVersion = 0;

export class ChatApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
    }
    this.textarea = React.createRef();
    this.profileCache = {};
  }

  async migrateFrom(version) {

  }

  async init() {
    console.log("init");
    this.setState({
      initialized: true,
    });
    const version = await this.props.app.get('version', { encrypted: true }) || 0;
    if (version < currentVersion) {
      await this.migrateFrom(version);
    }

    await this.fetchMessages();
  }

  componentDidUpdate(prevProps) {
    if (this.props.app && !this.state.initialized) {
      this.init();
    }
  }

  async fetchProfile(accountId) {
    if (accountId in this.profileCache) {
      return await this.profileCache[accountId];
    } else {
      console.log("Fetching profile for " + accountId);
      this.profileCache[accountId] = Promise.all([
        this.props.app.getFrom(accountId, 'displayName',  { appId: 'profile' }),
        this.props.app.getFrom(accountId, 'profileUrl', { appId: 'profile' }),
        this.props.app.getFrom(accountId, encryptionKey),
      ]).then((values) => {
        return {
          displayName: values[0] || "",
          profileUrl: values[1],
          theirPublicKey64: values[2],
        };
      }).catch((e) => false);
      return await this.profileCache[accountId];
    }
  }

  handleChange(key, value) {
    const stateChange = {
      [key]: value,
    };
    this.setState(stateChange);
  }

  async processMessage(message) {
    console.log(message);
    let inner = JSON.parse(message.message);
    const isEncrypted = inner.type === 'encrypted';
    const fromAppId = inner.fromAppId || this.props.app.appId;
    if (isEncrypted) {
      const decryptedMessage = await this.props.app.decryptMessage(inner.content, {
        accountId: message.sender,
        appId: inner.fromAppId,
      });
      inner = JSON.parse(decryptedMessage);
    }
    if (inner.type === 'chat') {
      console.log(inner);
    } else {
      console.warn("Unknown message", message);
    }
  }

  async fetchMessages() {
    if (!this.props.app) {
      return;
    }
    if (this.fetchTimeoutId) {
      clearTimeout(this.fetchTimeoutId);
      this.fetchTimeoutId = null;
    }
    console.log("Fetching messages");
    const message = await this.props.app.pullMessage();
    if (!message) {
      this.fetchTimeoutId = setTimeout(() => { this.fetchMessages() }, 60 * 1000);
      return;
    }
    try {
      await this.processMessage(message);
    } catch (e) {
      console.error(e);
    } finally {
      this.fetchMessages()
    }
  }

  render() {
    return (
      <div>
        Inbox <button className="btn btn-sm" onClick={() => this.fetchMessages()}>🔄</button>
      </div>
    )
  }
}

export class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: {
        profileUrl: null,
        displayName: '@' + props.receiverId,
      },
    };
  }

  componentDidMount() {
    this.props.fetchProfile(this.props.receiverId).then((profile) => {
      this.setState({
        profile,
      })
    });
  }

  onClick() {
    this.props.selectLetter(this.props.letter);
  }

  render() {
    const profileName = (
      <span className="letter-expanded-profile">
        <span className="letter-profile-name">{this.state.profile.displayName}</span>
        <span className="letter-account-id">{"(@" + this.props.letter.sender + ")"}</span>
      </span>
    )
    const profile = (
      <div className="col-sm-6 col-md-4 col-lg-4 letter-profile">
        <img className="letter-profile-image" src={this.state.profile.profileUrl || anon}/>
        {profileName}
      </div>
    );
    const subject = (
      <div className="col-sm-4 col-md">
        <div className="letter-subject">{this.props.letter.subject}</div>
      </div>
    );
    const time = this.props.expanded ? (
      <div className="col-sm-2 col-lg-2">
        <div className="letter-time">{longTimeFormat(this.props.letter.time)}</div>
      </div>
    ) : (
      <div className="col-sm-2 col-lg-1 d-none d-md-block">
        <div className="letter-time">{timeFormat(this.props.letter.time)}</div>
      </div>
    );
    if (this.props.expanded) {
      return (
        <div className="letter letter-expanded">
          <div className="row letter-expanded-header" onClick={() => this.onClick()}>
            {profile}
            {subject}
            {time}
          </div>
          <div className="letter-content-expanded">
            <pre>{this.props.letter.content}</pre>
            <div className="row">
              <div className="col-sm">
                <button className="btn btn-primary" onClick={() => this.props.replyTo(this.props.letter, this.state.profile.displayName)}>Reply</button>
              </div>
              <div className="col-sm">
                <button className="btn btn-danger float-right" onClick={() => this.props.deleteLetter(this.props.letter)}>DELETE THIS!</button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={"row letter letter-small" + (this.props.letter.read ? " letter-read" : " letter-unread")} onClick={() => this.onClick()}>
          {profile}
          {subject}
          <div className="col-sm d-none d-lg-block">
            <div className="letter-content">{this.props.letter.content}</div>
          </div>
          {time}
        </div>
      );
    }
  }
}

function longTimeFormat(t) {
  return new Date(t).toLocaleString();
}

function timeFormat(t) {
  const d = new Date(t);
  const now = new Date();
  if (now.getDate() === d.getDate()) {
    const hour = d.getHours() % 12;
    const minute = d.getMinutes().toString().padStart(2, '0');
    const daytime = d.getHours() >= 12 ? "PM" : "AM";
    return `${hour}:${minute} ${daytime}`;
  } else {
    return d.toLocaleDateString();
  }
}
