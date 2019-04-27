import React from "react";
import Async from "react-code-splitting";
import ReactDOM from "react-dom";

const Dashboard = () => <Async load={import("./components/pages/dashboard")} />;

ReactDOM.render(<Dashboard />, document.getElementById("root"));
