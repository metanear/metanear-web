import React from "react";
import anon from "./assets/anon.png";
import Files from "react-files";

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
    });
  }

  async init() {
    console.log("init profile");
    this.setState({
      initialized: true,
    });
    const values = await Promise.all(this.state.keys.map((key) => this.props.app.get(key)));
    console.log(values);
    const chainValues = this.state.keys.reduce((acc, key, i) => {
      acc[key] = values[i] || "";
      return acc;
    }, {});
    this.setState(Object.assign({chainValues}, chainValues));
  }

  componentDidUpdate(prevProps) {
    if (this.props.app && !this.state.initialized) {
      this.init();
    }
  }

  handleChange(key, value) {
    console.log(value.length);
    this.setState({
      [key]: value,
    });
  }

  async save() {
    console.log("Saving");
    const chainValues = Object.assign({}, this.state.chainValues);
    this.state.keys.forEach(key => {
      if (this.state.chainValues[key] !== this.state[key]) {
        chainValues[key] = this.state[key];
        this.props.app.set(key, this.state[key]).then(() => {
          console.log("Updated key `" + key + "` to value `" + this.state[key] + '`');
        });
      }
    });
    this.setState({
      chainValues
    })
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
        canvas.toDataURL('image/webp', 0.92),
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
          <img className="profile-image" src={this.state.profileUrl || anon}/>
          <span className="letter-expanded-profile">
            <span className="letter-profile-name">{this.state.displayName}</span>
            {this.props.app && <span className="letter-account-id">{"(@" + this.props.app.accountId + ")"}</span>}
          </span>
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
            <button onClick={() => this.save()}>Save changes</button>
          </div>
        </div>
      </div>
    )
  }
}