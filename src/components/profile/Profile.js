import React from "react";
import anon from "../../assets/anon.png";
import {OpenWebApp} from "../../openweb/openweb";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";

const profileAppId = "profile";

export class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayName: "",
      profileUrl: null,
      bio: "",
      loading: false,
      found: false,
    }
    if (!window.profileComponentCache) {
      window.profileComponentCache = {
        profileCache: {},
        app: new OpenWebApp(profileAppId, null, window.nearConfig),
      };
      window.profileComponentCache.app.init();
    }

    this.profileCache = window.profileComponentCache.profileCache;
    this.app = window.profileComponentCache.app;
  }

  componentDidMount() {
    this.props.accountId && this.app.ready().then(() => this.updateProfile(this.props.accountId));
  }

  async fetchProfile(accountId) {
    if (accountId in this.profileCache) {
      return await this.profileCache[accountId];
    } else {
      console.log("Fetching profile for " + accountId);
      this.profileCache[accountId] = Promise.all([
        this.app.getFrom(accountId, 'displayName'),
        this.app.getFrom(accountId, 'profileUrl'),
        this.app.getFrom(accountId, 'bio'),
      ]).then((values) => {
        return {
          accountId,
          displayName: values[0] || "",
          profileUrl: values[1],
          bio: values[2] || "",
        };
      }).catch((e) => false);
      return await this.profileCache[accountId];
    }
  }

  updateProfile(accountId) {
    this.setState({
      displayName: "",
      profileUrl: null,
      bio: "",
      loading: true,
      found: false,
    });
    this.fetchProfile(this.props.accountId).then((profile) => {
      if (profile) {
        this.setState({
          displayName: profile.displayName,
          profileUrl: profile.profileUrl,
          bio: profile.bio,
          loading: false,
          found: true,
        });
      } else {
        this.setState({
          loading: false,
          found: false,
        });
      }
      this.props.onFetch && this.props.onFetch(profile);
    })

  }

  componentDidUpdate(prevProps) {
    if (this.props.accountId !== prevProps.accountId) {
      this.updateProfile(this.props.accountId);
    }
  }

  render() {
    const displayName = this.props.displayName || this.state.displayName;
    const profileUrl = this.props.profileUrl || this.state.profileUrl || anon;
    const bio = this.props.bio || this.state.bio;
    const popover = <Popover className="profile-popover" id={"profile-popover-" + this.props.accountId}>
      <Popover.Title as="h3">{displayName}</Popover.Title>
      <Popover.Content>
        <div>
          <img className="profile-image" src={profileUrl} alt={`Profile @${this.props.accountId}`}/>
          <span className="profile-account-id">{"@" + this.props.accountId}</span>
        </div>
        <div>
          {bio}
        </div>
      </Popover.Content>
    </Popover>;
    return this.state.loading ? (
      <div className="profile">
        <div className="spinner-grow" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    ) : this.state.found ? (
      <OverlayTrigger
        placement="auto"
        delay={{ show: 250, hide: 100 }}
        overlay={popover}
      >
        <div className="profile">
          <img className="profile-image" src={profileUrl} alt={`Profile @${this.props.accountId}`}/>
          <span className="profile-name">
            <span className="profile-display-name">{displayName}</span>
            <span className="profile-account-id">{"(@" + this.props.accountId + ")"}</span>
          </span>
        </div>
      </OverlayTrigger>
    ) : null;
  }
}