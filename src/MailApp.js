import React from "react";
import anon from "./assets/anon.png";
import encryptionOn from "./assets/encryptionOn.png";
import encryptionOff from "./assets/encryptionOff.png";
import {encryptionKey} from "./openweb";

const RE = "Re: ";
const currentVersion = 2;

export class MailApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      receiverId: "",
      subject: "",
      content: "",
      sending: false,
      profileFetchTimeoutId: null,
      profileFetchIndex: 0,
      numLetters: 0,
      unread: 0,
      expandedId: -1,
      theirPublicKey64: null,
      inbox: [],
    }
    this.textarea = React.createRef();
    this.profileCache = {};
  }

  modifyLetter(letter, messageId) {
    if (messageId === undefined) {
      if (!letter) {
        return;
      }
      messageId = letter.messageId;
    }
    const inbox = this.state.inbox.filter((a) => a.messageId != messageId);
    if (letter) {
      inbox.push(letter);
    }
    inbox.sort((a, b) => b.time - a.time);
    const unread = inbox.reduce((acc, letter) => acc + (letter.read ? 0: 1), 0);
    this.setState({
      inbox,
      unread,
    });
    this.props.onNewMail(unread);
  }

  async migrateFrom(version) {
    if (version === 0) {
      console.log("Migrating from version #0");
      const num = await this.props.app.get('numLetters');
      const allMigrations = [this.props.app.set('numLetters', num, { encrypted: true })];
      for (let i = 0; i < num; ++i) {
        allMigrations.push(this.props.app.get('letter_' + i).then((letter) => {
          if (letter) {
            return this.props.app.set('letter_' + i, letter, {encrypted: true}).then(() => {
              console.log("Migrated letter #" + i);
            })
          }
          return Promise.resolve();
        }).catch((e) => console.log("Can't migrate letter #", i, e)));
      }
      await Promise.all(allMigrations);
      version++;
    }
    if (version === 1) {
      console.log("Migrating from version #1");
      await this.props.app.storeEncryptionPublicKey();
      version++;
    }
    await this.props.app.set('version', version, { encrypted: true });
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
    const num = await this.props.app.get('numLetters', { encrypted: true }) || 0;
    this.setState({
      numLetters: num,
    });
    for (let i = Math.max(0, num - 10); i < num; ++i) {
      this.props.app.get('letter_' + i, {encrypted: true}).then((letter) => this.modifyLetter(letter));
    }
    this.fetchMessages();
  }

  componentDidUpdate(prevProps) {
    if (this.props.app && !this.state.initialized) {
      this.init();
    }
  }

  async fetchProfile(accountId) {
    if (accountId in this.profileCache) {
      return this.profileCache[accountId];
    } else {
      console.log("Fetching profile for " + accountId);
      try {
        const values = await Promise.all([
          this.props.app.getFrom(accountId, 'displayName',  { appId: 'profile' }),
          this.props.app.getFrom(accountId, 'profileUrl', { appId: 'profile' }),
          this.props.app.getFrom(accountId, encryptionKey),
        ]);
        this.profileCache[accountId] = {
          displayName: values[0] || "",
          profileUrl: values[1],
          theirPublicKey64: values[2],
        };
      } catch (e) {
        this.profileCache[accountId] = false;
      }
      return this.profileCache[accountId];
    }
  }

  handleChange(key, value) {
    const stateChange = {
      [key]: value,
    };
    if (key === 'receiverId') {
      value = value.toLowerCase().replace(/[^a-z0-9\-\_\.]/, '');
      stateChange[key] = value;
      const profileFetchIndex = this.state.profileFetchIndex + 1;
      stateChange.profileFetchIndex = profileFetchIndex;
      stateChange.profile = null;
      if (value) {
        stateChange.profileLoading = true;
        this.fetchProfile(value).then((profile) => {
          if (this.state.profileFetchIndex !== profileFetchIndex) {
            return;
          }
          this.setState({
            profileLoading: false,
            profile,
          });
        });
      } else {
        stateChange.profileLoading = false;
      }
    }
    this.setState(stateChange);
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
      if (inner.type === 'mail') {
        const letter = {
          messageId: this.state.numLetters,
          isEncrypted,
          fromAppId,
          sender: message.sender,
          subject: inner.subject,
          content: inner.content,
          time: Math.trunc(message.time / 1000000),
        }
        const newNumLetters = this.state.numLetters + 1;
        this.setState({
          numLetters: newNumLetters,
        });

        this.props.app.set("letter_" + letter.messageId, letter, {encrypted: true}).then(() => {
          console.log("Saved the letter: ", letter);
        });
        this.props.app.set("numLetters", newNumLetters, {encrypted: true}).then(() => {
            console.log("Saved the new number of letters: ", newNumLetters);
        });
        this.modifyLetter(letter);
      } else {
        console.warn("Unknown message", message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.fetchMessages()
    }
  }

  async sendMail() {
    if (!this.state.profile) {
      return;
    }
    console.log("Sending mail");
    this.setState({
      sending: true,
    });
    try {
      let message = JSON.stringify({
        type: "mail",
        subject: this.state.subject,
        content: this.state.content,
      });
      if (this.state.profile.theirPublicKey64) {
        const content = await this.props.app.encryptMessage(message, {
          theirPublicKey64: this.state.profile.theirPublicKey64,
        });
        message = JSON.stringify({
          type: "encrypted",
          fromAppId: this.props.app.appId,
          content,
        })
      }
      await this.props.app.sendMessage(this.state.receiverId, message);
      this.setState({
        subject: "",
        content: "",
      })
    } catch (e) {
      console.log("Failed to send the message", e);
    } finally {
      this.setState({
        sending: false,
      });
      this.fetchMessages();
    };
  }

  receiverClass() {
    if (!this.state.receiverId || this.state.profileLoading) {
      return "form-control";
    } else if (this.state.profile) {
      return "form-control is-valid";
    } else {
      return "form-control is-invalid";
    }
  }

  replyTo(letter, displayName) {
    this.handleChange("receiverId", letter.sender);
    this.setState({
      subject: (letter.subject.startsWith(RE) ? "" : RE) + letter.subject,
      content: [
        "",
        "",
        ["On", new Date(letter.time).toLocaleDateString(), displayName, "@" + letter.sender, "wrote:"].join(' '),
        ...letter.content.split(/\r?\n/).map(s => "| " + s)
      ].join("\n"),
    }, () => {
      this.textarea.current.focus();
      this.textarea.current.setSelectionRange(0, 0);
      this.textarea.current.scrollLeft = 0;
      this.textarea.current.scrollTop = 0;
    });
  }

  selectLetter(letter) {
    this.setState({
      expandedId: (this.state.expandedId === letter.messageId) ? -1 : letter.messageId,
    });
    if (!letter.read) {
      letter = JSON.parse(JSON.stringify(letter));
      letter.read = true;
      this.props.app.set("letter_" + letter.messageId, letter, {encrypted: true}).then(() => {
        console.log("Saved the letter: ", letter);
      });
      this.modifyLetter(letter);
    }
  }

  deleteLetter(letter) {
    this.props.app.remove("letter_" + letter.messageId).then(() => {
      console.log("Deleted the letter: ", letter);
    });
    this.modifyLetter(null, letter.messageId);
  }

  render() {
    const encryptionEnabled = this.state.profile && this.state.profile.theirPublicKey64;
    const encryptionIcon = this.state.profile &&
      <img className="encryption-icon" src={encryptionEnabled ? encryptionOn : encryptionOff}
          title={encryptionEnabled ? "Encryption is ON" : "Not secure! Encryption is OFF"}/>;
    const profile = this.state.profileLoading ? (
      <div className="col">
        <div className="spinner-grow" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    ) : this.state.profile ? (
      <div className="col">
        <img className="profile-image" src={this.state.profile.profileUrl || anon}/>
        <span className="profile-name">{this.state.profile.displayName}</span>
      </div>
    ) : null;
    const inbox = true || this.props.app ?
      this.state.inbox.map((letter, i) => <Letter
          key={letter.messageId}
          fetchProfile={(a) => this.fetchProfile(a)}
          letter={letter}
          expanded={letter.messageId == this.state.expandedId}
          deleteLetter={(letter) => this.deleteLetter(letter)}
          replyTo={(letter, displayName) => this.replyTo(letter, displayName)}
          selectLetter={(letter) => this.selectLetter(letter)}/>) :
      null;
    return (
      <div>
        Inbox <button className="btn btn-sm" onClick={() => this.fetchMessages()}>🔄</button>
        <div>
          {inbox}
        </div>
        <h3>Send</h3>
        <div className="form-row">
          <div className="col">
            <div className="form-group">
              <label className="sr-only" htmlFor="toAccountId">To Account ID</label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">@</div>
                </div>
                <input type="text" className={this.receiverClass()} id="toAccountId" placeholder="To Account ID" value={this.state.receiverId} disabled={!this.props.app} onChange={(e) => this.handleChange('receiverId', e.target.value)} />
              </div>
            </div>
          </div>
          {profile}
        </div>
        <div className="form-group">
          <label className="sr-only" htmlFor="subject">Subject</label>
          <input type="text" className="form-control" id="subject" placeholder="Subject" disabled={!this.props.app} value={this.state.subject} onChange={(e) => this.handleChange('subject', e.target.value)} />
        </div>
        <div className="form-group">
          <textarea ref={this.textarea} id="content" className="form-control" rows="7" disabled={!this.props.app} value={this.state.content} onChange={(e) => this.handleChange('content', e.target.value)} />
        </div>
        <div className="form-group">
          <button className={"form-control form-control-lg btn " + (this.state.profile && !encryptionEnabled ? "btn-danger" : "btn-primary")} disabled={!this.state.profile || this.state.sending} onClick={() => this.sendMail()}>
            Send {encryptionIcon}</button>
        </div>
      </div>
    )
  }
}

export class Letter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: {
        profileUrl: null,
        displayName: '@' + props.letter.sender,
      },
    };
  }

  componentDidMount() {
    this.props.fetchProfile(this.props.letter.sender).then((profile) => {
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
