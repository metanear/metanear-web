import React from "react";
import { ChatMessage } from "./ChatMessage";

export const ChatContract = 'metanear-chat';

const FetchMessagesLimit = 10;
const MinTimeDiffForMetaMs = 5 * 60 * 1000;

export class Channel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            initialized: false,
            appReady: false,
            messages: [],
        };
        this.channelId = null;
        this.channelHash = null;
        this.cachedRanges = null;
        this.cachedMessages = {};
        this.fetchingMessages = false;
        this.fetchTimeoutId = null;
        this.channelInnerRef = React.createRef();
        this.mounted = false;
    }

    async loadCache(channelId) {
        const textEncoder = new TextEncoder('utf-8');
        const buf = textEncoder.encode('c:' + channelId);

        this.channelId = channelId;
        this.cachedMessages = {};
        this.channelHash =  Buffer.from(await crypto.subtle.digest('SHA-256', buf)).toString('base64');

        this.cachedRanges = JSON.parse(window.localStorage.getItem(this.channelHash + ':cachedRanges') || "null") || []
        this.cachedRanges.forEach((r) => {
            for (let i = r.first; i < r.last; ++i) {
                this.cachedMessages[i] = JSON.parse(window.localStorage.getItem(this.channelHash + ':m:' + i) || "null");
            }
        });
        this.updateState(true);
    }

    scrollDown() {
        this.channelInnerRef.current.scrollTop = this.channelInnerRef.current.scrollHeight;
    }

    updateState(scrollDown) {
        if (!this.mounted) {
            return;
        }
        this.setState({
            messages: Object.values(this.cachedMessages)
        }, () => {
            if (scrollDown)  {
                this.scrollDown();
            }
        })
    }

    maybeInit() {
        if (this.props.channelId && this.channelId !== this.props.channelId) {
            const cache = this.loadCache(this.props.channelId);
            if (this.state.appReady) {
                cache.then(() => {
                    this.fetchNewMessages();
                });
            }
        }
        if (this.props.app && !this.state.initialized) {
            this.setState({
                initialized: true,
                appReady: true,
            });
            this.fetchNewMessages();
        }
    }

    componentDidMount() {
        this.maybeInit()
        this.mounted = true;
    }

    componentDidUpdate(prevProps) {
        this.maybeInit()
        if (this.props.currentMessage) {
            setTimeout(() => {
                this.scrollDown();
            }, 10);
        }
        if (!this.props.currentMessage && prevProps.currentMessage) {
            this.fetchNewMessages();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        if (this.fetchTimeoutId) {
            clearTimeout(this.fetchTimeoutId);
            this.fetchTimeoutId = null;
        }
    }


    addNewMessage(channelId, message) {
        if (channelId !== this.channelId) {
            return;
        }
        const index = message.index;
        if (index in this.cachedMessages) {
            return;
        }
        this.cachedMessages[index] = message;
        window.localStorage.setItem(this.channelHash + ':m:' + index, JSON.stringify(message));

        this.cachedRanges.push({
            first: index,
            last: index + 1,
        });
        this.cachedRanges.sort((a, b) => a.first - b.first);
        this.cachedRanges = this.cachedRanges.reduce((rs, r) => {
            if (r.first === r.last) {
                return rs;
            }
            if (!rs.length) {
                rs.push(r);
            }
            if (rs[rs.length - 1].last === r.first) {
                rs[rs.length - 1].last = r.last;
            }
            return rs;
        }, []);
        window.localStorage.setItem(this.channelHash + ':cachedRanges', JSON.stringify(this.cachedRanges));
    }

    async fetchMessages(channelId, fromIndex, toIndex) {
        fromIndex = Math.max(fromIndex, toIndex - FetchMessagesLimit);
        let messages = await this.props.app.getFrom(ChatContract, JSON.stringify({
            ChannelMessages: {
                channel_id: channelId,
                from_index: fromIndex,
                limit: toIndex - fromIndex,
            }
        }), {});
        messages.messages.forEach((m, i) => {
          this.addNewMessage(channelId, {
              index: fromIndex + i,
              senderId: m.sender_id,
              text: m.text,
              time: m.time,
          });
        })
    }

    async fetchNewMessages() {
        if (this.fetchingMessages) {
            return;
        }
        try {
            this.fetchingMessages = true;
            if (this.fetchTimeoutId) {
                clearTimeout(this.fetchTimeoutId);
                this.fetchTimeoutId = null;
            }
            console.log("Fetching chat messages");
            const channel = this.channelId;
            let channelStatus = await this.props.app.getFrom(ChatContract, JSON.stringify({
                ChannelStatus: {
                    channel_id: channel,
                }
            }), {});
            let numChannelMessages = channelStatus.num_messages;
            let lastNumMessages = this.cachedRanges.length ? this.cachedRanges[this.cachedRanges.length - 1].last : 0;
            if (lastNumMessages < numChannelMessages) {
                await this.fetchMessages(channel, lastNumMessages, numChannelMessages);
                this.updateState(true);
            }
        }
        finally {
            this.fetchingMessages = false;
            if (this.mounted) {
                this.fetchTimeoutId = setTimeout(() => this.fetchNewMessages(), 2000);
            }
        }
    }

    render() {
        let lastMessage = null;
        return (
            <div className="channel fgrow" ref={this.channelInnerRef}>
                {this.state.messages.map((message) => {
                    const chatMessage = <ChatMessage
                        key={this.channelHash + message.index}
                        message={message}
                        onReply={() => this.onReply(message)}
                        showMeta={!lastMessage || message.senderId !== lastMessage.senderId || message.time - lastMessage.time > MinTimeDiffForMetaMs}
                    />;
                    lastMessage = message;
                    return chatMessage;
                })}
                {this.props.currentMessage && (
                    <ChatMessage
                        key={"currentMessage"}
                        message={this.props.currentMessage}
                        pending={true}
                        showMeta={true}
                    />
                )}
            </div>
        );
    }
}
