import React from "react";
import anon from "../assets/anon.png";
import Files from "react-files";
import { Profile } from "react-near-openweb";

const uploadResizeWidth = 96;
const uploadResizeHeight = 96;

export class ProfileApp extends React.Component {
  constructor(props) {
    super(props);
    const keys = [
      "displayName",
      "profileUrl",
      "bio",
    ];
    this.state = keys.reduce((acc, key) => {
      acc[key] = "";
      acc.chainValues[key] = null;
      return acc;
    }, {
      keys,
      chainValues: {},
      initialized: false,
      saving: false,
      hasChanges: false,
      appReady: false,
    });
  }

  async init(profile) {
    if (!profile) {
      return;
    }
    const newState = this.state.keys.reduce((state, key) => {
      state[key] = profile[key] || "";
      state.chainValues[key] = state[key];
      return state;
    }, {
      chainValues: {}
    });
    this.setState(newState);
  }

  maybeInit() {
    if (this.props.app && !this.state.initialized) {
      this.setState({
        initialized: true,
      });
      this.props.app.waitReady().then(() => {
        this.setState({
          appReady: true,
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

  hasChanges() {
    return this.state.keys.some(key => this.state.chainValues[key] !== this.state[key]);
  }

  async save() {
    this.setState({
      saving: true,
    });
    console.log("Saving");
    const chainValues = Object.assign({}, this.state.chainValues);
    const promises = [];
    this.state.keys.forEach(key => {
      if (this.state.chainValues[key] !== this.state[key]) {
        chainValues[key] = this.state[key];
        promises.push(this.props.app.set(key, this.state[key]).then(() => {
          console.log("Updated key `" + key + "` to value `" + this.state[key] + '`');
        }));
      }
    });
    Promise.all(promises).then(() => {
      this.setState({
        chainValues,
        saving: false,
      })
    });
  }

  async onFilesChange(f) {
    let sourceImage = new Image();
    let reader = new FileReader();

    reader.readAsDataURL(f[0]);

    sourceImage.onload = () => {
      // Create a canvas with the desired dimensions
      let canvas = document.createElement("canvas");
      const aspect = sourceImage.naturalWidth / sourceImage.naturalHeight;
      const width = Math.round(uploadResizeWidth * Math.max(1, aspect));
      const height = Math.round(uploadResizeHeight * Math.max(1, 1 / aspect));
      canvas.width = uploadResizeWidth;
      canvas.height = uploadResizeHeight;
      const ctx = canvas.getContext("2d");

      // Scale and draw the source image to the canvas
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, uploadResizeWidth, uploadResizeHeight);
      ctx.drawImage(sourceImage, (uploadResizeWidth - width) / 2, (uploadResizeHeight - height) / 2, width, height);

      // Convert the canvas to a data URL in PNG format
      const options = [
        canvas.toDataURL('image/jpeg', 0.92),
        // Disabling webp because it doesn't work on iOS.
        // canvas.toDataURL('image/webp', 0.92),
        canvas.toDataURL('image/png')
      ];
      options.sort((a, b) => a.length - b.length);

      this.handleChange('profileUrl', options[0]);
    }

    reader.onload = function(event) {
      sourceImage.src = event.target.result;
    };
  }

  async onFilesError(e, f) {
    console.log(e, f);
  }

  render() {
    return (
      <div>
        <div>
          <button className="float-right" onClick={this.props.logOut}>Log out</button>
          <Profile
            accountId={this.props.app && this.props.app.accountId}
            profileUrl={this.state.profileUrl}
            displayName={this.state.displayName}
            bio={this.state.bio}
            defaultProfileUrl={anon}
            onFetch={(profile) => this.init(profile)}
          />
        </div>
        <hr/>
        <div>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input placeholder="The REAL Satoshi" id="displayName" className="form-control" disabled={!this.props.app} value={this.state.displayName} onChange={(e) => this.handleChange('displayName', e.target.value)} />
          </div>
          <label htmlFor="profileUrl">Profile URL</label>
          <div className="input-group">
            <input placeholder={"https://metanear.com" + anon} id="profileUrl" className="form-control" disabled={!this.props.app} value={this.state.profileUrl}
                   onChange={(e) => this.handleChange('profileUrl', e.target.value)}/>
            <div className="input-group-append">
              <Files
                type="button"
                className='btn btn-outline-primary'
                onChange={(f) => this.onFilesChange(f)}
                onError={(e, f) => this.onFilesError(e, f)}
                multiple={false}
                accepts={['image/*']}
                minFileSize={1}
                clickable
              >
                Click to upload
              </Files>
            </div>

          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea placeholder="I'm working on Bitcoin, so bankers can go home." id="bio" className="form-control" disabled={!this.props.app} value={this.state.bio} onChange={(e) => this.handleChange('bio', e.target.value)} />
          </div>
          <div className="form-group">
            <button
                className="btn btn-primary"
                disabled={this.state.saving || !this.hasChanges()}
                onClick={() => this.save()}
            >
              {this.state.saving && (
                  <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
              )} Save changes
            </button>
          </div>
        </div>
      </div>
    )
  }
}
