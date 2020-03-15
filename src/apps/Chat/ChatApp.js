import React from "react";
import anon from "../../assets/anon.png";
import { Profile } from "react-near-openweb";
import { Channel, ChatContract } from "./Channel";
import './Chat.css';

const ProfileInlineStyle = {
  profile: {
    whiteSpace: 'nowrap',
    display: 'inline-block',
  },
  profileImage: {
    height: '2em',
    width: '2em',
    borderRadius: '50%',
    verticalAlign: 'middle',
    marginRight: '0.5em',
  },
  profileName: {
    display: 'none',
  },
  profileDisplayName: {},
  profileAccountId: {},
};

export class ChatApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      appReady: false,
      text: "",
      channelId: "public",
      sending: false,
      currentMessage: null,
    };
    this.textInput = React.createRef();
  }

  maybeInit() {
    if (this.props.app && !this.state.initialized) {
      this.setState({
        initialized: true,
      });
      this.props.app.waitReady().then(() => {
        this.setState({
          appReady: true,
        }, () => {
          this.textInput.current.focus();
        })
      })
    }
  }

  componentDidMount() {
    this.maybeInit()
  }

  componentDidUpdate(prevProps) {
    this.maybeInit()
  }

  handleChange(key, value) {
    this.setState({
      [key]: value,
    });
  }

  async sendMessage() {
    console.log("Sending chat message");
    let text = this.state.text;
    this.setState({
      sending: true,
      text: "",
      currentMessage: {
        text,
        senderId: this.props.app.accountId,
        time: new Date().getTime(),
      }
    });
    try {
      let message = JSON.stringify({
        ChatMessage: {
          channel_id: this.state.channelId,
          text,
        }
      });
      await this.props.app.sendMessage(ChatContract, message);
      text = "";
    } catch (e) {
      console.log("Failed to send the chat message", e);
    } finally {
      this.setState({
        text,
        sending: false,
        currentMessage: null,
      });
    };
  }

  onKeyDown(event) {
    // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.sendMessage();
    }
  }


  render() {
    return (
      <div className="chat-app h100 cflex">
        <div className="channels">
          <div className="current-channel">#{this.state.channelId}</div>
        </div>
        <Channel channelId={this.state.channelId} app={this.props.app} currentMessage={this.state.currentMessage}/>
        <br/>
        <div className="input-group">
          <div className="input-group-prepend">
            {this.state.appReady && (<Profile accountId={this.props.app.accountId} defaultProfileUrl={anon} styles={ProfileInlineStyle}/>)}
          </div>
          <input ref={this.textInput}
                 id="text"
                 placeholder={"Message #" + this.state.channelId}
                 className="form-control form-control"
                 disabled={!this.state.appReady || this.state.sending}
                 value={this.state.text}
                 onKeyDown={(e) => this.onKeyDown(e)}
                 onChange={(e) => this.handleChange('text', e.target.value)}/>
          <div className="input-group-append">
            <button
                className='btn btn-primary'
                disabled={!this.state.appReady || this.state.sending}
                onClick={() => this.sendMessage()}
            >
              {this.state.sending && (
                  <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
              )} Send
            </button>
          </div>
        </div>
      </div>
    )
  }
}
