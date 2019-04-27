import Button from "@material-ui/core/Button/index";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField/index";
import Typography from "@material-ui/core/Typography";
import classNames from "classnames";
import ChipInput from "material-ui-chip-input";
import qs from "query-string";
import React from "react";
import { styles } from "../../common/styles/styles";
import { openSnackbar } from "../page_objects/snackbar";

class PollCanvas extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pollName: "",
      pollId: "",
      question: "",
      options: []
    };
    this.handleQuestionChange = this.handleQuestionChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
  }

  componentDidMount() {
    // TODO: remove hard coded id
    const pollId = "1234567";

    fetch(`getOptions?pollId=${pollId}`)
      .then(response => {
        return response.json();
      })
      .then(json => this.setState({ options: json }));
    this.setState({
      pollId: pollId
    });

    fetch(`getQuestion?pollId=${pollId}`)
      .then(res => {
        return res.text();
      })
      .then(value => {
        this.setState({
          question: value
        });
      });
  }

  handleQuestionChange(event) {
    this.setState({
      question: event.target.value
    });
  }

  handleNameChange(event) {
    this.setState({
      pollName: event.target.value
    });
  }

  handleAdd(option) {
    this.state.options.push(option);
  }

  handleDelete(deletedOption) {
    this.setState({
      options: this.state.options.filter(c => c !== deletedOption)
    });
  }

  handleSubmit() {
    let data = qs.stringify(this.state);
    fetch("/savePoll", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: data
    }).then(result => {
      if (result.status === 200) openSnackbar({ message: "Poll saved!" });
    });
  }

  cancel() {
    console.dir(`cancel`);
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <div>
          <Typography variant="h4" gutterBottom component="h2">
            Poll Question Setup Changed
          </Typography>
        </div>
        <div>
          <form>
            <div className={classNames(classes.midTextField)}>
              <TextField
                label={"Question"}
                variant={"outlined"}
                multiline
                fullWidth
                margin={"normal"}
                value={this.state.question}
                onChange={this.handleQuestionChange.bind(this)}
              />
              <div />
              <br />
              <div>
                <ChipInput
                  variant={"outlined"}
                  value={this.state.options}
                  onAdd={option => this.handleAdd(option)}
                  onDelete={deletedOption => this.handleDelete(deletedOption)}
                  onBlur={event => {
                    if (this.props.addOnBlur && event.target.value) {
                      this.handleAdd(event.target.value);
                    }
                  }}
                  allowDuplicates={false}
                  fullWidth
                  label="Answer Choices"
                  className={classNames(classes.margin)}
                />
              </div>
            </div>
            <div>
              <br />
            </div>
            <div className={classNames(classes.bottomSave)}>
              <Button
                onClick={this.handleSubmit}
                size={"large"}
                variant="contained"
                color="secondary">
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(PollSetup);
