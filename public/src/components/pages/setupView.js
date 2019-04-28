import Button from "@material-ui/core/Button/index";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField/index";
import Typography from "@material-ui/core/Typography/index";
import classNames from "classnames";
import Faker from "faker/locale/en_US";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { openSnackbar } from "../page_objects/snackbar";

let randomText = Faker.lorem.lines(25);
let randomGuid = Faker.random.uuid();
let randomHost = Faker.internet.url();

const styles = themeType => ({
  textField: {
    borderColor: themeType.palette.secondary
  }
});

class SetupView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      applicationId: "",
      privateKey: "",
      devPortalHost: "",
      issuer: "",
      tokenEndPoint: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    fetch("setupData")
      .then(result => result.json())
      .then(result => {
        this.setState({
          privateKey: result.privateKey,
          applicationId: result.applicationId,
          devPortalHost: result.devPortalHost,
          issuer: result.issuer,
          tokenEndPoint: result.tokenEndPoint
        });
      });
  }

  handleSubmit() {
    const data = new URLSearchParams(this.state);
    fetch("/saveSetup", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: data
    }).then(result => {
      if (result.status === 200) openSnackbar({ message: "Settings saved!" });
    });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Typography variant="h4" gutterBottom component="h2">
          LTI Advantage Settings
        </Typography>
        <br />
        <form id={"setupForm"}>
          <TextField
            className={classes.textField}
            required
            label="Developer Portal URL"
            variant="outlined"
            placeholder="https://developer.blackboard.com"
            fullWidth={true}
            InputLabelProps={{
              shrink: true
            }}
            name={"devPortalHost"}
            value={this.state.devPortalHost || ""}
            onInput={this.handleChange}
          />
          <br />
          <br />
          <TextField
            required
            label="Application ID"
            variant="outlined"
            placeholder={randomGuid}
            fullWidth={true}
            InputLabelProps={{
              shrink: true
            }}
            name={"applicationId"}
            value={this.state.applicationId || ""}
            onInput={this.handleChange}
          />
          <br />
          <br />
          <TextField
            required
            label="OAuth2 Token End Point"
            variant="outlined"
            placeholder={randomHost}
            fullWidth={true}
            InputLabelProps={{
              shrink: true
            }}
            name={"tokenEndPoint"}
            value={this.state.tokenEndPoint || ""}
            onInput={this.handleChange}
          />
          <br />
          <br />
          <TextField
            required
            label="Issuer"
            variant="outlined"
            placeholder="blackboard.com"
            fullWidth={true}
            InputLabelProps={{
              shrink: true
            }}
            name={"issuer"}
            value={this.state.issuer || ""}
            onInput={this.handleChange}
          />
          <br />
          <br />
          <TextField
            required
            label="Private Key"
            rows="15"
            variant="outlined"
            multiline
            placeholder={randomText}
            fullWidth={true}
            InputLabelProps={{
              shrink: true
            }}
            name={"privateKey"}
            value={this.state.privateKey || ""}
            onInput={this.handleChange}
          />
          <br />
          <br />
          <div className={classNames(classes.bottomSave)}>
            <Button
              size={"large"}
              id={"cancel_button"}
              variant={"contained"}
              component={Link}
              to="/home">
              Cancel
            </Button>
            <Button
              style={{ left: 15 }}
              size={"large"}
              id={"save_button"}
              variant="contained"
              color="secondary">
              Save
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

export default withStyles(styles)(SetupView);
