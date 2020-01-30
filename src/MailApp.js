import React from "react";

const RE = "Re: ";

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
      inbox: [
        /* {
        messageId: -1,
        sender: "potato-lord",
        subject: "DOPE",
        content: "HELLO? HELLLOOOOO?",
        time: new Date().getTime() - 1000 * 42 * 60,
      }, {
        messageId: -2,
        sender: "potato-lord",
        subject: "BLABLBALBLABLALBA L BALBLABAL LBLA",
        content: "HELLO? HELLLOOOOO?HELLO? HELLLOOOOO?HELLO? HELLLOOOOO?HELLO? HELLLOOOOO?HELLO? HELLLOOOOO?",
        time: new Date().getTime() - 1000 * 23 * 60 * 60,
      }, {
        messageId: -4,
        sender: "sheeet",
        subject: "Self mailing?",
        content: "Best idea ever!",
        time: new Date().getTime() - 2 * 1000 * 24 * 60 * 60,
      }
      */],
    }
    this.profileCache = {};
  }

  addLetter(letter) {
    console.log(letter);
    if (!letter) {
      return;
    }
    const newInbox = this.state.inbox.slice();
    newInbox.push(letter);
    newInbox.sort((a, b) => b.time - a.time);
    this.setState({
      inbox: newInbox
    });
  }

  async init() {
    console.log("init");
    this.setState({
      initialized: true,
    });
    this.props.app.get('numLetters').then((num) => {
      num = num || 0;
      this.setState({
        numLetters: num,
      })
      for (let i = Math.max(0, num - 10); i < num; ++i) {
        this.props.app.get('letter_' + i).then((letter) => this.addLetter(letter));
      }
      this.fetchMessages();
    });
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
          this.props.app.getFrom(accountId, 'displayName', 'profile'),
          this.props.app.getFrom(accountId, 'profileUrl', 'profile'),
        ]);
        this.profileCache[accountId] = {
          displayName: values[0] || "",
          profileUrl: values[1],
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

  fetchMessages() {
    if (!this.props.app) {
      return;
    }
    if (this.fetchTimeoutId) {
      clearTimeout(this.fetchTimeoutId);
      this.fetchTimeoutId = null;
    }
    console.log("Fetching messages");
    this.props.app.pullMessage().then((message) => {
      if (!message) {
        this.fetchTimeoutId = setTimeout(() => { this.fetchMessages() }, 15 * 1000);
        return;
      }
      try {
        console.log(message);
        const inner = JSON.parse(message.message);
        if (inner.type === 'mail') {
          const letter = {
            messageId: this.state.numLetters,
            sender: message.sender,
            subject: inner.subject,
            content: inner.content,
            time: Math.trunc(message.time / 1000000),
          }
          const newNumLetters = this.state.numLetters + 1;
          this.setState({
            numLetters: newNumLetters,
          });

          this.props.app.set("letter_" + letter.messageId, letter).then(() => {
            console.log("Saved the letter: ", letter);
          });
          this.props.app.set("numLetters", newNumLetters).then(() => {
              console.log("Saved the new number of letters: ", newNumLetters);
          });
          this.addLetter(letter);
        } else {
          console.warn("Unknown message", message);
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.fetchMessages()
      }
    })
  }

  sendMail() {
    if (!this.state.profile) {
      return;
    }
    console.log("Sending mail");
    this.setState({
      sending: true,
    });
    this.props.app.sendMessage(this.state.receiverId, JSON.stringify({
      type: "mail",
      subject: this.state.subject,
      content: this.state.content,
    })).then(() => {
      this.setState({
        subject: "",
        content: "",
      })
    }).finally(() => {
      this.setState({
        sending: false,
      });
      this.fetchMessages();
    });

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

  selectLetter(letter, displayName) {
    this.handleChange("receiverId", letter.sender);
    this.handleChange("subject", (letter.subject.startsWith(RE) ? "" : RE) + letter.subject);
    this.handleChange("content", [
      "",
      "",
      ["On", new Date(letter.time).toLocaleDateString(), displayName, "@" + letter.sender, "wrote:"].join(' '),
      ... letter.content.split(/\r?\n/).map(s => "| " + s)
    ].join("\n"));
  }

  render() {
    const profile = this.state.profileLoading ? (
      <div className="col">
        <div className="spinner-grow" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    ) : this.state.profile ? (
      <div className="col">
        <img className="profile-image" src={this.state.profile.profileUrl}/>
        <label className="profile-name">{this.state.profile.displayName}</label>
      </div>
    ) : null;
    const inbox = this.props.app ?
      this.state.inbox.map((letter, i) => <Letter
          key={letter.messageId}
          fetchProfile={(a) => this.fetchProfile(a)}
          letter={letter}
          selectLetter={(letter, displayName) => this.selectLetter(letter, displayName)}/>) :
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
          <textarea id="content" className="form-control" rows="7" disabled={!this.props.app} value={this.state.content} onChange={(e) => this.handleChange('content', e.target.value)} />
        </div>
        <div className="form-group">
          <button className="form-control form-control-lg btn btn-primary" disabled={!this.state.profile || this.state.sending} onClick={() => this.sendMail()}>Send</button>
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
      expanded: false,
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
    this.setState({
      expanded: !this.state.expanded,
    });
    this.props.selectLetter(this.props.letter, this.state.profile.displayName);
  }

  render() {
    return (
      <div className={"row letter " + (this.state.expanded ? "expanded" : "")} onClick={() => this.onClick()}>
        <div className="col letter-profile">
          <img className="letter-profile-image" src={this.state.profile.profileUrl}/>
          <label className="letter-profile-name">{this.state.profile.displayName}</label>
        </div>
        <div className="col">
          <div className="letter-subject">{this.props.letter.subject}</div>
        </div>
        <div className="col">
          <div className="letter-content">{this.props.letter.content}</div>
        </div>
        <div className="col">
          <div className="letter-time">{timeFormat(this.props.letter.time)}</div>
        </div>
      </div>
    );
  }
}

function timeFormat(t) {
  const d = new Date(t);
  const now = new Date();
  if (now.getDate() == d.getDate()) {
    return d.toLocaleTimeString();
  } else {
    return d.toLocaleDateString();
  }
}
