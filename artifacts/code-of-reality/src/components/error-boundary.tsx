import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#020817",
          color: "#d4af37",
          fontFamily: "monospace",
          padding: "2rem",
          textAlign: "center",
          gap: "1rem",
        }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6 }}>
            Reality Matrix Error
          </div>
          <div style={{ fontSize: "14px", color: "#ef4444", maxWidth: "600px", wordBreak: "break-word" }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => window.location.replace("/auth")}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              border: "1px solid #d4af37",
              background: "transparent",
              color: "#d4af37",
              fontFamily: "monospace",
              fontSize: "10px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Return to Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
