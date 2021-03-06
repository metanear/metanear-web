import React from "react";
import anon from "../assets/anon.png";
import encryptionOn from "../assets/encryptionOn.png";
import encryptionOff from "../assets/encryptionOff.png";
import { Profile } from "metanear-react-components";

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
      numLetters: 0,
      unread: 0,
      expandedId: -1,
      profileFound: false,
      profileLoading: false,
      keyLoading: false,
      theirPublicKey64: null,
      inbox: [],
    }
    this.textarea = React.createRef();
    this.keyCache = {};
  }

  modifyLetter(letter, messageId) {
    if (messageId === undefined) {
      if (!letter) {
        return;
      }
      messageId = letter.messageId;
    }
    const inbox = this.state.inbox.filter((a) => a.messageId !== messageId);
    if (letter) {
      inbox.push(letter);
    }
    inbox.sort((a, b) => b.time - a.time);
    const unread = inbox.reduce((acc, letter) => acc + (letter.read ? 0: 1), 0);
    this.setState({
      inbox,
      unread,
    });
    this.props.onUnread(unread);
  }

  async migrateFrom(version) {
    if (version === 0) {
      console.log("Migrating from version #0");
      let num = 0;
      try {
        num = await this.props.app.get('numLetters');
      } catch (e) {
        // whatever. Probably died during migration.
      }
      const allMigrations = [];
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
      await this.props.app.set('numLetters', num, { encrypted: true });
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
    let version;
    try {
      version = await this.props.app.get('version', {encrypted: true}) || 0;
    } catch (e) {
      // likely mismatched keys
      console.log(e);
      return;
    }
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

  maybeInit() {
    if (this.props.app && !this.state.initialized) {
      this.setState({
        initialized: true,
      });
      this.props.app.waitReady().then(() => this.init());
    }
  }


  componentDidMount() {
    this.maybeInit()
  }

  componentDidUpdate(prevProps) {
    this.maybeInit()
  }

  async fetchKey(accountId) {
    if (accountId in this.keyCache) {
      return await this.keyCache[accountId];
    } else {
      console.log("Fetching key for " + accountId);
      this.keyCache[accountId] = this.props.app.getStoredEncryptionPublicKey(accountId, {}).catch((e) => false);
      return await this.keyCache[accountId];
    }
  }

  updateKey(profile) {
    if (!this.props.app) {
      return;
    }
    this.setState({
      profileLoading: false,
      profileFound: !!profile,
    });
    if (!profile) {
      return;
    }
    this.setState({
      keyLoading: true,
    })
    this.fetchKey(profile.accountId).then((theirPublicKey64) => {
      this.setState({
        keyLoading: false,
        theirPublicKey64,
      })
    });
  }

  handleChange(key, value) {
    const stateChange = {
      [key]: value,
    };
    if (key === 'receiverId') {
      value = value.toLowerCase().replace(/[^a-z0-9\-_.]/, '');
      stateChange[key] = value;
      stateChange.profileLoading = true;
      stateChange.theirPublicKey64 = false;
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
    if (!this.state.profileFound) {
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
      if (this.state.theirPublicKey64) {
        const content = await this.props.app.encryptMessage(message, {
          theirPublicKey64: this.state.theirPublicKey64,
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
      setTimeout(() => this.fetchMessages(), 2000);
    };
  }

  receiverClass() {
    if (!this.state.receiverId || this.state.profileLoading) {
      return "form-control";
    } else if (this.state.profileFound) {
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
    const encryptionEnabled = this.state.theirPublicKey64;
    const displayEncryptionIcon = this.state.profileFound && !this.state.keyLoading;
    const encryptionAlt = encryptionEnabled ? "Encryption is ON" : "Not secure! Encryption is OFF";
    const encryptionIcon = displayEncryptionIcon &&
      <img className="encryption-icon" src={encryptionEnabled ? encryptionOn : encryptionOff}
          title={encryptionAlt} alt={encryptionAlt}/>;
    const profile = <Profile accountId={this.state.receiverId} onFetch={(profile) => this.updateKey(profile)} defaultProfileUrl={anon}/>;
    const inbox = this.state.inbox.map((letter, i) => (
      <Letter
        key={letter.messageId}
        letter={letter}
        expanded={letter.messageId === this.state.expandedId}
        deleteLetter={(letter) => this.deleteLetter(letter)}
        replyTo={(letter, displayName) => this.replyTo(letter, displayName)}
        selectLetter={(letter) => this.selectLetter(letter)} />
    ));
    return (
      <div>
        Inbox <button className="btn btn-sm" onClick={() => this.fetchMessages()}><span role="img" aria-label="Refresh">🔄</span></button>
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
          <button className={"form-control form-control-lg btn " + (displayEncryptionIcon && !encryptionEnabled ? "btn-danger" : "btn-primary")} disabled={!this.state.profileFound || this.state.sending} onClick={() => this.sendMail()}>
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

  onClick() {
    this.props.selectLetter(this.props.letter);
  }

  render() {
    const profile = (
      <div className="col-sm-6 col-md-4 col-lg-4 letter-profile">
        <Profile accountId={this.props.letter.sender} onFetch={(profile) => profile && this.setState({displayName: profile.displayName})} defaultProfileUrl={anon}/>
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
                <button className="btn btn-primary" onClick={() => this.props.replyTo(this.props.letter, this.state.displayName)}>Reply</button>
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
