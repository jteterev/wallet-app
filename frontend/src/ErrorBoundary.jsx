import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <pre
          style={{
            padding: 20,
            color: "red",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
          }}
        >
          {String(this.state.error && this.state.error.stack)}
        </pre>
      );
    }
    return this.props.children;
  }
}
