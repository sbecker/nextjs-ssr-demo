import Document, { Html, Head, Main, NextScript } from "next/document";
import React from "react";
import {
  ExtendedHead,
  revalidate,
  flushChunks,
  DevHotScript,
} from "@module-federation/nextjs-ssr/flushChunks";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    ctx?.res?.on("finish", () => {
      revalidate().then(() => {
        // choose any additional steps you want to take.
        // the promise will only resolve if remotes have changed and a hot reload needs to happen
        if (process.env.NODE_ENV === "development") {
          setTimeout(() => {
            // useful for dev or if you want to cold start lambdas.
            process.exit(1);
          }, 50);
        }
      });
    });
    const remotes = await flushChunks(process.env.REMOTES);
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      remoteChunks: remotes,
    };
  }

  render() {
    return (
      <Html>
        <ExtendedHead>
          <meta name="robots" content="noindex" />
          {Object.values(this.props.remoteChunks)}
        </ExtendedHead>
        <DevHotScript />
        <body className="bg-background-grey">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
