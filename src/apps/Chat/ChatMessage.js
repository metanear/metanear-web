import React from "react";
import anon from "../../assets/anon.png";
import {Profile} from "metanear-react-components";

const ProfileMessageStyle = {
    profile: {
        display: 'none',
    },
};

const formatTime = (t) => {
    const d = new Date(t);
    const c = new Date();
    if (c.getDate() === d.getDate()) {
        return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else {
        return d.toLocaleDateString()
    }
}

export class ChatMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayName: "",
            profileUrl: anon,
        };
    }


    onProfile(p) {
        this.setState({
            displayName: (p && p.displayName) || "",
            profileUrl: (p && p.profileUrl) || anon,
        })
    }

    render() {
        const message = this.props.message;
        const content = message.text;
        const senderId = message.senderId;
        const time = formatTime(message.time);
        const p = this.props.showMeta && <Profile accountId={senderId} styles={ProfileMessageStyle} onFetch={(p) => this.onProfile(p)}/>;
        return (
            <div className={"chat-message" + (this.props.pending ? " chat-message-pending" : "") + (!this.props.showMeta ? " chat-message-no-meta" : "")}>
                {p}
                <img className="chat-message-profile" src={this.state.profileUrl} alt={`Profile @${senderId}`}/>
                <div className="chat-message-content">
                    <div className="chat-message-meta">
                        <div className="chat-message-sender-name">{this.state.displayName || ("@" + senderId)}</div>
                        {this.state.displayName && <div className="chat-message-sender-id">{"(@" + senderId + ")"}</div>}
                        {this.props.pending ?
                            <div className="chat-message-time"><span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> sending</div> :
                            <div className="chat-message-time">{time}</div>
                        }
                    </div>
                    {content}
                </div>
            </div>
        )
    }
}
