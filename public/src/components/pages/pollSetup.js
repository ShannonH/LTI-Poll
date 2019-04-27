import Button from "@material-ui/core/Button/index";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField/index";
import classNames from "classnames";
import Faker from "faker/locale/en_US";
import ChipInput from "material-ui-chip-input";
import * as PropTypes from "prop-types";
import * as QueryString from "query-string";
import React from "react";
import { styles } from "../../common/styles/styles";
import { openSnackbar } from "../page_objects/snackbar";

class PollSetup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      creator: "shannon",
      pollId: "",
      pollName: "",
      question: "",
      options: []
    };
    this.handleQuestionChange = this.handleQuestionChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
  }

  componentDidMount() {
    const pollId = Faker.random.alphaNumeric(8);
    this.setState({
      pollId: pollId
    });
  }

  handleQuestionChange(event) {
    console.dir(`handleQuestionChange ${event.target.value}`);
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
    let data = QueryString.stringify(this.state);
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
        <form>
          <TextField
            label={"Poll Name"}
            variant={"outlined"}
            multiline
            fullWidth
            margin={"normal"}
            onChange={this.handleNameChange.bind(this)}
          />
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
    );
  }
}

PollSetup.propTypes = {
  addOnBlur: PropTypes.bool
};

PollSetup.propTypes = {
  addOnBlur: PropTypes.bool
};

export default withStyles(styles)(PollSetup);
